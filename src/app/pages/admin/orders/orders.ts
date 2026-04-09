import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../../services/admin.api';
import { NotificationService } from '../../../services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Logistics & Fulfillment</h1>
          <p>Orchestrating the journey of greenery from conservatory to customer.</p>
        </div>
        <div class="header-actions">
           <div class="stat-pill">
              <span class="label">Total Revenue</span>
              <span class="value">₹{{ totalRevenue | number:'1.0-0' }}</span>
           </div>
        </div>
      </div>

      <div *ngIf="isLoading" class="loader-panel">
         <div class="spinner"></div>
         <p>Synchronizing operational data...</p>
      </div>

      <!-- PREMIUM LIST-CARD LAYOUT -->
      <div class="logistics-list" *ngIf="!isLoading && orders.length > 0">
         <div class="logistics-row-header">
            <span>Order Identity</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Botanical Items</span>
            <span>Investment</span>
            <span>Orchestration</span>
         </div>

         <div class="logistics-card" *ngFor="let order of orders">
            <div class="col-id">
               <div class="id-hex">#{{ order._id.slice(-8).toUpperCase() }}</div>
               <div class="id-date">{{ order.createdAt | date:'MMM d, h:mm a' }}</div>
            </div>

            <div class="col-customer">
               <div class="cust-avatar">{{ (order.user?.name || 'G').charAt(0) }}</div>
               <div class="cust-details">
                  <div class="cust-name">{{ order.user?.name || 'Guest Explorer' }}</div>
                  <div class="cust-mail">{{ order.user?.email || 'No email registered' }}</div>
               </div>
            </div>

            <div class="col-status">
               <div class="status-indicator" [ngClass]="getStatusClass(order.status)">
                  <i class="fas" [ngClass]="getStatusIcon(order.status)"></i>
                  <span>{{ order.status }}</span>
               </div>
            </div>

            <div class="col-items" style="position: relative;">
               <div class="items-summary" (click)="order.expanded = !order.expanded" [class.open]="order.expanded">
                  <span class="item-count">{{ order.items.length }} Item(s)</span>
                  <i class="fas" [ngClass]="order.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
               </div>
               
               <!-- PREMIUM FLOATING POPOVER -->
               <div class="items-popover" *ngIf="order.expanded">
                  <div class="popover-arrow"></div>
                  <div class="popover-content">
                     <div class="popover-header">
                        <i class="fas fa-leaf"></i>
                        <span>Botanical Selection</span>
                     </div>
                     <div class="popover-list">
                        <div *ngFor="let item of order.items" class="item-row">
                           <div class="item-dot"></div>
                           <span class="name">{{ item.name }}</span>
                           <span class="qty-pill">x{{ item.quantity }}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="col-price">
               <div class="price-val">₹{{ order.totalAmount }}</div>
               <div class="price-method">{{ order.payment?.method || 'Standard' }}</div>
            </div>

            <div class="col-action">
               <div class="premium-select-box">
                  <select [ngModel]="order.status" (ngModelChange)="updateStatus(order, $event)">
                    <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
                  </select>
                  <i class="fas fa-magic"></i>
               </div>
            </div>
         </div>
      </div>

      <div *ngIf="!isLoading && orders.length === 0" class="empty-state-card">
         <div class="empty-icon"><i class="fas fa-box-open"></i></div>
         <p>No transactions registered yet.</p>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .logistics-list { display: flex; flex-direction: column; gap: 16px; width: 100%; }
    
    .logistics-row-header { 
       display: grid; 
       grid-template-columns: 160px 1fr 180px 180px 150px 180px;
       padding: 0 32px; margin-bottom: 8px;
       font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;
    }

    .logistics-card {
       display: grid;
       grid-template-columns: 160px 1fr 180px 180px 150px 180px;
       align-items: center;
       background: white; padding: 20px 32px; border-radius: 20px;
       box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
       border: 1px solid #f1f5f9;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
       position: relative;
    }

    .logistics-card:hover { 
       transform: translateX(10px); 
       border-color: #3b82f644; 
       box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
       background: #fdfdfd;
    }

    /* ID Col */
    .id-hex { font-family: monospace; font-weight: 800; color: #0f172a; font-size: 0.95rem; }
    .id-date { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; font-weight: 600; }

    /* Customer Col */
    .col-customer { display: flex; align-items: center; gap: 12px; }
    .cust-avatar { 
       width: 36px; height: 36px; border-radius: 10px; 
       background: linear-gradient(135deg, #3b82f6, #1d4ed8);
       color: white; display: flex; align-items: center; justify-content: center; font-weight: 800;
    }
    .cust-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
    .cust-mail { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

    /* Status Col */
    .status-indicator { 
       display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 10px;
       font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
       width: fit-content;
    }
    .status-indicator.status-pending { background: #fffbeb; color: #d97706; }
    .status-indicator.status-processing { background: #eff6ff; color: #1d4ed8; }
    .status-indicator.status-shipped { background: #f0fdf4; color: #166534; }
    .status-indicator.status-delivered { background: #ecfdf5; color: #065f46; border: 1px solid #05966922; }
    .status-indicator.status-cancelled { background: #fef2f2; color: #991b1b; }

    /* Items Col */
    .items-summary { 
       display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 12px; 
       background: #f8fafc; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: #475569;
       transition: all 0.3s ease;
       width: fit-content;
       border: 1px solid transparent;
    }
    .items-summary:hover { background: #f1f5f9; color: #1e293b; border-color: #e2e8f0; }
    .items-summary.open { background: #064e3b; color: white; box-shadow: 0 4px 12px rgba(6, 78, 59, 0.2); }

    .items-popover {
       position: absolute;
       bottom: calc(100% + 14px);
       left: 50%;
       transform: translateX(-50%);
       z-index: 1000;
       width: 280px;
       background: white;
       border-radius: 20px;
       box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
       border: 1px solid rgba(16, 185, 129, 0.1);
       overflow: hidden;
       animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes popIn {
       from { opacity: 0; transform: translateX(-50%) translateY(-15px) scale(0.9); }
       to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    }

    .popover-arrow {
       position: absolute;
       bottom: -6px;
       left: 50%;
       transform: translateX(-50%) rotate(45deg);
       width: 12px;
       height: 12px;
       background: white;
       border-right: 1px solid rgba(16, 185, 129, 0.1);
       border-bottom: 1px solid rgba(16, 185, 129, 0.1);
    }

    .popover-header {
       background: linear-gradient(135deg, #064e3b, #059669);
       padding: 14px 20px;
       color: white;
       font-size: 0.75rem;
       font-weight: 800;
       text-transform: uppercase;
       letter-spacing: 0.08em;
       display: flex;
       align-items: center;
       gap: 10px;
    }

    .popover-list {
       padding: 12px;
       max-height: 280px;
       overflow-y: auto;
       display: flex;
       flex-direction: column;
       gap: 4px;
    }

    .item-row {
       display: flex;
       align-items: center;
       gap: 12px;
       padding: 10px 14px;
       border-radius: 12px;
       transition: all 0.2s;
    }

    .item-row:hover { background: #f0fdf4; transform: translateX(4px); }

    .item-dot {
       width: 8px;
       height: 8px;
       border-radius: 50%;
       background: #10b981;
       box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }

    .item-row .name {
       flex: 1;
       font-size: 0.85rem;
       font-weight: 600;
       color: #1e293b;
    }

    .qty-pill {
       background: #ecfdf5;
       color: #059669;
       font-size: 0.7rem;
       font-weight: 800;
       padding: 3px 10px;
       border-radius: 8px;
       border: 1px solid #05966922;
    }

    /* Price Col */
    .price-val { font-weight: 800; color: #0f172a; font-size: 1.1rem; }
    .price-method { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }

    /* Action Col */
    .col-action { display: flex; justify-content: flex-end; }
    .premium-select-box { position: relative; width: 100%; max-width: 180px; }
    .premium-select-box select { 
       width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;
       background: #f8fafc; font-size: 0.85rem; font-weight: 700; color: #1e293b;
       appearance: none; cursor: pointer; transition: all 0.2s;
    }
    .premium-select-box select:focus { outline: none; border-color: #3b82f6; background: white; }
    .premium-select-box i { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #3b82f6; font-size: 0.8rem; }

    .loader-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; color: #94a3b8; gap: 20px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .stat-pill { background: white; padding: 12px 24px; border-radius: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--clr-border); }
    .stat-pill .label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
    .stat-pill .value { font-size: 1.5rem; font-weight: 900; color: #0f172a; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  totalRevenue = 0;

  constructor(private adminApi: AdminApiService, private notif: NotificationService) { }

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.isLoading = true;
    const token = localStorage.getItem('greenie.token') || '';
    let localOrders: any[] = [];
    try {
      const raw = localStorage.getItem('greenie.orders');
      if (raw) localOrders = JSON.parse(raw);
    } catch (e) { }

    if (!token) { this.orders = localOrders; this.calculateRevenue(); this.isLoading = false; return; }

    this.adminApi.listOrders(token).subscribe({
      next: (data) => {
        const combined = [...localOrders, ...data];
        const unique = Array.from(new Map(combined.map(item => [item._id, item])).values());
        this.orders = unique.map((o: any) => ({ ...o, expanded: false }))
                           .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.calculateRevenue();
        this.isLoading = false;
      },
      error: () => { this.orders = localOrders; this.calculateRevenue(); this.isLoading = false; }
    });
  }

  calculateRevenue() { this.totalRevenue = this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0); }

  updateStatus(order: any, newStatus: string) {
    if (confirm(`Authorize status move to ${newStatus}?`)) {
      const isLocal = order._id.startsWith('LOC-') || order._id.startsWith('MDG-') || !/^[0-9a-fA-F]{24}$/.test(order._id);
      if (isLocal) { this.updateLocalOrderStatus(order._id, newStatus); order.status = newStatus; this.notif.show('Local log updated.', 'success'); return; }

      const token = localStorage.getItem('greenie.token') || '';
      this.adminApi.updateOrderStatus(token, order._id, newStatus).subscribe({
        next: (res) => { order.status = res.status; this.notif.show('State synchronized.', 'success'); },
        error: () => this.notif.show('Sync error.', 'error')
      });
    }
  }

  updateLocalOrderStatus(id: string, status: string) {
    try {
      const raw = localStorage.getItem('greenie.orders');
      if (raw) {
        let os = JSON.parse(raw);
        const idx = os.findIndex((o: any) => o._id === id);
        if (idx !== -1) { os[idx].status = status; localStorage.setItem('greenie.orders', JSON.stringify(os)); }
      }
    } catch (e) { }
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pending': return 'fa-clock';
      case 'Processing': return 'fa-cog fa-spin';
      case 'Shipped': return 'fa-truck';
      case 'Delivered': return 'fa-check-circle';
      case 'Cancelled': return 'fa-times-circle';
      default: return 'fa-box';
    }
  }
}
