import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderApiService } from '../../services/order.api';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-orders.html',
    styleUrls: ['./my-orders.css']
})
export class MyOrdersComponent implements OnInit {
    orders: any[] = [];
    isLoading = true;

    constructor(
        private router: Router,
        private orderApi: OrderApiService
    ) { }

    ngOnInit() {
        this.loadOrders();
    }

    refresh() {
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;

        // Check login
        if (!localStorage.getItem('greenie.loggedIn')) {
            this.router.navigate(['/login']);
            return;
        }

        const token = localStorage.getItem('greenie.token');
        if (!token) {
            console.warn('No token found, loading local orders only');
            this.mergeWithLocal([]);
            this.isLoading = false;
            return;
        }

        this.orderApi.getMyOrders(token).subscribe({
            next: (data) => {
                this.mergeWithLocal(data);
                this.isLoading = false;
            },
            error: (err) => {
                console.warn('Failed to load my orders from API', err);
                this.mergeWithLocal([]);
                this.isLoading = false;
            }
        });
    }

    mergeWithLocal(apiOrders: any[]) {
        let localOrders: any[] = [];
        try {
            const raw = localStorage.getItem('greenie.orders');
            // Get current user (server might return user obj or we check local)
            const currentUserRaw = localStorage.getItem('greenie.currentUser');
            const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;

            if (raw && currentUser) {
                const allLocal = JSON.parse(raw);
                // Filter orders for THIS user (by email or id)
                localOrders = allLocal.filter((o: any) =>
                    o.user === currentUser.id ||
                    o.user === currentUser._id ||
                    (o.shippingAddress && o.shippingAddress.email === currentUser.email)
                );
            }
        } catch (e) { }

        // Merge: local + api
        const combined = [...localOrders, ...(Array.isArray(apiOrders) ? apiOrders : [])];
        
        // Dedup by ID
        const unique = Array.from(new Map(combined.filter(item => !!item && (item._id || item.id)).map(item => [item._id || item.id, item])).values());

        // Safe Sort by date
        this.orders = unique.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    }
    getStatusClass(status: string): string {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Processing': return 'status-processing';
            case 'Shipped': return 'status-shipped';
            case 'Delivered': return 'status-delivered';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    }
}
