import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../../services/admin.api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-user-carts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Active User Carts</h1>
          <p>Monitor real-time shopping activity and intent across your customer base.</p>
        </div>
      </div>

      <div class="panel" style="padding: 0; overflow: hidden; margin-top: 20px;">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Customer Entity</th>
              <th>Items in Cache</th>
              <th>Collective Valuation</th>
              <th>Last Activity</th>
              <th>Operational</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cart of carts">
              <td>
                <div class="user-identity">
                  <div class="avatar-circle">{{ (cart.user?.name || 'G')[0] }}</div>
                  <div class="info">
                    <strong>{{ cart.user?.name || 'Anonymous User' }}</strong>
                    <small>{{ cart.user?.email || 'Guest Session' }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="item-stack">
                  <div class="mini-item" *ngFor="let item of cart.items.slice(0, 3)">
                    <img [src]="item.plant?.image" [alt]="item.plant?.name" (error)="item.plant.image='assets/bg1.jpg'">
                    <span class="qty-badge">{{ item.qty }}</span>
                  </div>
                  <div class="more-items" *ngIf="cart.items.length > 3">+{{ cart.items.length - 3 }}</div>
                </div>
              </td>
              <td>
                <div class="valuation">
                  <strong>₹{{ calculateTotal(cart) }}</strong>
                </div>
              </td>
              <td>
                <span class="activity-timestamp">
                  {{ cart.updatedAt | date:'medium' }}
                </span>
              </td>
              <td>
                <button class="ghost-btn-small" (click)="viewCartDetails(cart)">
                  <i class="fas fa-eye"></i> View Detail
                </button>
              </td>
            </tr>
            <tr *ngIf="carts.length === 0">
              <td colspan="5" class="empty-state">No active carts found in the database.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL: CART DETAIL -->
      <div class="modal-overlay glass-overlay" *ngIf="selectedCart">
        <div class="luxury-modal">
          <div class="modal-header">
             <h2><i class="fas fa-shopping-basket"></i> Cart Payload: {{ selectedCart.user?.name }}</h2>
             <button class="close-x" (click)="selectedCart = null">&times;</button>
          </div>
          
          <div class="modal-body">
             <div class="cart-items-list">
                <div class="cart-row" *ngFor="let item of selectedCart.items">
                   <img [src]="item.plant?.image" [alt]="item.plant?.name" class="row-img">
                   <div class="row-info">
                      <strong>{{ item.plant?.name }}</strong>
                      <small>Category: {{ item.plant?.category }}</small>
                   </div>
                   <div class="row-qty">Quantity: {{ item.qty }}</div>
                   <div class="row-price">₹{{ item.plant?.price }}</div>
                </div>
             </div>
             
             <div class="modal-summary">
                <div class="summary-line">
                   <span>Items Count:</span>
                   <span>{{ selectedCart.items.length }} specimens</span>
                </div>
                <div class="summary-line grand">
                   <span>Estimated Value:</span>
                   <span>₹{{ calculateTotal(selectedCart) }}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .user-identity { display: flex; align-items: center; gap: 12px; }
    .avatar-circle { 
        width: 40px; height: 40px; background: #3b82f6; color: white; 
        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
        font-weight: 800; font-size: 1.1rem;
    }
    .info { display: flex; flex-direction: column; }
    .info strong { color: #1e293b; font-size: 0.95rem; }
    .info small { color: #64748b; font-size: 0.8rem; }

    .item-stack { display: flex; align-items: center; gap: -10px; }
    .mini-item { 
        width: 32px; height: 32px; border-radius: 8px; border: 2px solid white; 
        overflow: hidden; position: relative; margin-right: -12px;
        box-shadow: var(--shadow-sm); transition: transform 0.2s;
    }
    .mini-item:hover { transform: translateY(-5px) scale(1.1); z-index: 10; }
    .mini-item img { width: 100%; height: 100%; object-fit: cover; }
    .qty-badge {
        position: absolute; top: 0; right: 0; background: var(--clr-primary);
        color: white; font-size: 0.6rem; padding: 2px 4px; border-radius: 4px;
    }
    .more-items { margin-left: 20px; font-size: 0.8rem; font-weight: 700; color: #94a3b8; }

    .valuation strong { color: #059669; font-size: 1.05rem; }
    .activity-timestamp { font-size: 0.85rem; color: #64748b; font-weight: 500; }

    .ghost-btn-small {
        background: none; border: 1px solid #e2e8f0; padding: 8px 12px;
        border-radius: 8px; color: #475569; font-size: 0.8rem; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
    }
    .ghost-btn-small:hover { background: #f8fafc; color: #3b82f6; border-color: #3b82f6; }

    .luxury-modal {
        background: white; border-radius: 30px; width: 600px; max-height: 80vh;
        overflow-y: auto; padding: 32px; box-shadow: var(--shadow-2xl);
        animation: modalFadeIn 0.3s ease-out;
    }
    .cart-items-list { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }
    .cart-row {
        display: flex; align-items: center; gap: 15px; padding-bottom: 16px; 
        border-bottom: 1px solid #f1f5f9;
    }
    .row-img { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; }
    .row-info { flex: 1; display: flex; flex-direction: column; }
    .row-info strong { font-size: 0.95rem; color: #1e293b; }
    .row-qty { font-weight: 600; color: #64748b; font-size: 0.9rem; width: 100px; }
    .row-price { font-weight: 800; color: #059669; }

    .modal-summary { background: #f8fafc; padding: 20px; border-radius: 16px; margin-top: 24px; }
    .summary-line { display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b; font-weight: 500; }
    .summary-line.grand { margin-top: 12px; padding-top: 12px; border-top: 2px dashed #e2e8f0; color: #1e293b; font-size: 1.1rem; font-weight: 800; }

    @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class AdminUserCartsComponent implements OnInit {
  carts: any[] = [];
  selectedCart: any = null;

  constructor(private adminApi: AdminApiService, private notify: NotificationService) {}

  ngOnInit() { this.loadCarts(); }

  loadCarts() {
    // We'll need to update the AdminApiService to have a fetchCarts method
    (this.adminApi as any).fetchCarts(localStorage.getItem('greenie.token')).subscribe({
      next: (data: any) => this.carts = data,
      error: () => this.notify.show('Error loading carts', 'error')
    });
  }

  calculateTotal(cart: any): number {
    return cart.items.reduce((acc: number, item: any) => acc + (item.plant?.price || 0) * item.qty, 0);
  }

  viewCartDetails(cart: any) { this.selectedCart = cart; }
}
