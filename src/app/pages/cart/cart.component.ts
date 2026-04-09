import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PlantsApiService, Plant } from '../../services/plants.api';
import { CareTipsApiService } from '../../services/care-tips.api';
import { forkJoin, map, take, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-container">
      <header class="cart-header">
        <h1>Your Shopping Cart</h1>
        <button class="back-link" routerLink="/">← Continue Shopping</button>
      </header>

      <div *ngIf="isLoading" class="loading">Loading your cart...</div>

      <div *ngIf="!isLoading && cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items yet.</p>
        <button class="shop-btn" routerLink="/">Browse Plants</button>
      </div>

      <div *ngIf="!isLoading && cartItems.length > 0" class="cart-content">
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cartItems">
            <img [src]="item.product.image || 'assets/bg1.jpg'" [alt]="item.product.name" class="item-img">
            <div class="item-info">
              <h3>{{ item.product.name }}</h3>
              <p class="category">{{ item.product.category }}</p>
              <p class="price" *ngIf="item.product.price !== undefined">₹{{ item.product.discountPrice }} <span class="original">₹{{ item.product.price }}</span></p>
               <p class="price" *ngIf="item.product.price === undefined">Free</p>
            </div>
            <div class="item-actions">
              <div class="qty-control">
                <button (click)="decreaseQty(item.product._id)">-</button>
                <span>{{ item.qty }}</span>
                <button (click)="increaseQty(item.product._id)">+</button>
              </div>
              <button class="remove-btn" (click)="removeItem(item.product._id)">Remove</button>
            </div>
            <div class="item-total">
              ₹{{ (item.product.discountPrice || 0) * item.qty }}
            </div>
          </div>
        </div>

        <aside class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹{{ subtotal }}</span>
          </div>
          <div class="summary-row">
             <span>Delivery</span>
             <span class="free">FREE</span>
          </div>
          <hr>
           <div class="summary-row total">
             <span>Total</span>
             <span>₹{{ subtotal }}</span>
           </div>
           <button class="checkout-btn" (click)="checkout()">Proceed to Checkout</button>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

    :host {
      --clr-emerald-dark: #064e3b;
      --clr-emerald-mid: #059669;
      --clr-emerald-light: #10b981;
      --clr-slate-dark: #0f172a;
      --clr-slate-muted: #64748b;
      --shadow-premium: 0 20px 50px -20px rgba(6, 78, 59, 0.15);
      --font-classic: 'Playfair Display', serif;
      --font-modern: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
    }

    .cart-container { 
      max-width: 1200px; margin: 60px auto; padding: 0 24px; 
      font-family: var(--font-body);
      min-height: 85vh;
    }

    .cart-header { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 50px; padding-bottom: 30px; 
      border-bottom: 1.5px solid #f1f5f9; 
    }
    
    .cart-header h1 { 
      font-family: var(--font-classic); font-size: 3.2rem; font-weight: 800; 
      color: var(--clr-emerald-dark); margin: 0; letter-spacing: -1px; 
    }
    
    .back-link { 
      background: #f8fafc; border: 1px solid #e2e8f0; color: var(--clr-emerald-dark); padding: 12px 28px; 
      border-radius: 100px; font-weight: 700; cursor: pointer; font-size: 0.95rem; 
      transition: all 0.3s; display: flex; align-items: center; gap: 8px;
    }
    .back-link:hover { background: var(--clr-emerald-dark); color: white; transform: scale(1.05); }

    .loading, .empty-cart { 
      text-align: center; padding: 120px 40px; background: white; 
      border-radius: 40px; box-shadow: var(--shadow-premium); 
    }
    
    .empty-icon { font-size: 6rem; margin-bottom: 30px; display: block; filter: grayscale(0.5); }
    .empty-cart h2 { font-family: var(--font-classic); font-size: 2.5rem; color: var(--clr-emerald-dark); margin-bottom: 16px; }
    
    .shop-btn { 
      background: var(--clr-emerald-dark); color: white; border: none; padding: 20px 50px; border-radius: 100px; 
      font-size: 1.1rem; font-weight: 800; cursor: pointer; transition: all 0.3s;
    }
    .shop-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(6, 78, 59, 0.2); }

    .cart-content { display: grid; grid-template-columns: 1fr 420px; gap: 60px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 24px; }
    
    .cart-item { 
      display: grid; grid-template-columns: 140px 1fr auto 140px; align-items: center; gap: 32px;
      background: white; padding: 24px; border-radius: 32px; box-shadow: var(--shadow-premium);
      border: 1px solid #f8fafc; transition: all 0.4s;
    }
    .cart-item:hover { transform: scale(1.01); border-color: var(--clr-emerald-light); }

    .item-img { width: 140px; height: 140px; object-fit: cover; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    
    .item-info h3 { font-family: var(--font-classic); font-size: 1.6rem; font-weight: 700; color: var(--clr-slate-dark); margin: 0 0 6px; line-height: 1.2; }
    .category { color: var(--clr-emerald-mid); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    
    .price { font-family: var(--font-modern); font-weight: 700; color: var(--clr-emerald-dark); font-size: 1.25rem; margin: 0; }
    .original { text-decoration: line-through; color: #94a3b8; font-size: 0.9rem; font-weight: 500; margin-left: 10px; opacity: 0.6; }

    .item-actions { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    
    .qty-control { 
      display: flex; align-items: center; background: #f1f5f9; border-radius: 15px; padding: 6px; 
    }
    .qty-control button { 
      background: white; border: none; width: 34px; height: 34px; border-radius: 12px; 
      cursor: pointer; font-weight: 800; color: var(--clr-emerald-dark); transition: all 0.2s;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .qty-control button:hover { background: var(--clr-emerald-dark); color: white; }
    .qty-control span { margin: 0 16px; font-weight: 800; font-size: 1.1rem; color: var(--clr-slate-dark); min-width: 20px; text-align: center; font-family: var(--font-modern); }
    
    .remove-btn { 
      background: none; border: none; color: #ef4444; cursor: pointer; 
      font-size: 0.85rem; font-weight: 700; transition: all 0.2s; 
    }
    .remove-btn:hover { color: #dc2626; transform: scale(1.05); }

    .item-total { 
      font-family: var(--font-modern); font-weight: 800; font-size: 1.8rem; 
      color: var(--clr-emerald-dark); text-align: right; 
    }

    .cart-summary { 
      background: var(--clr-emerald-dark); padding: 50px 40px; border-radius: 40px; color: white;
      height: fit-content; position: sticky; top: 50px; box-shadow: 0 30px 60px -15px rgba(6, 78, 59, 0.4);
    }
    .cart-summary h2 { 
      font-family: var(--font-classic); font-size: 2.4rem; font-weight: 700; 
      margin: 0 0 32px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;
    }
    
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 1.1rem; color: rgba(255,255,255,0.7); }
    .summary-row.total { 
      margin-top: 30px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.2);
      font-weight: 800; font-size: 2.2rem; color: white; font-family: var(--font-modern);
    }
    
    .checkout-btn { 
      width: 100%; background: white; color: var(--clr-emerald-dark); border: none; 
      padding: 22px; border-radius: 100px; font-size: 1.2rem; font-weight: 800; 
      cursor: pointer; margin-top: 40px; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px;
    }
    .checkout-btn:hover { background: var(--clr-emerald-light); color: white; transform: translateY(-5px); }

    @media (max-width: 1150px) {
      .cart-content { grid-template-columns: 1fr; }
      .cart-summary { max-width: 500px; margin: 40px auto 0; position: static; }
    }

    @media (max-width: 850px) {
      .cart-item { grid-template-columns: 140px 1fr 140px; row-gap: 24px; }
      .item-actions { grid-row: 2; grid-column: 2; flex-direction: row; justify-content: flex-start; }
      .item-total { grid-row: 2; grid-column: 3; }
    }

    @media (max-width: 600px) {
      .cart-item { grid-template-columns: 1fr; text-align: center; }
      .item-img { width: 100%; height: 200px; margin: 0 auto; }
      .item-actions { justify-content: center; }
      .item-total { text-align: center; width: 100%; }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  isLoading = true;
  subtotal = 0;

  constructor(
    private cartService: CartService,
    private plantsApi: PlantsApiService,
    private careApi: CareTipsApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.loadItemDetails(items);
    });
  }

  loadItemDetails(items: any[]) {
    if (items.length === 0) {
      this.cartItems = [];
      this.subtotal = 0;
      this.isLoading = false;
      return;
    }

    // Parallel fetch of all possible products with error handling for each
    forkJoin({
      plants: this.plantsApi.list().pipe(
        take(1),
        catchError(err => {
          console.warn('Error loading plants', err);
          return of([]);
        })
      ),
      careTips: this.careApi.list().pipe(
        take(1),
        catchError(err => {
          console.warn('Error loading care tips', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ plants, careTips }) => {
        const validItems: any[] = [];
        const invalidIds: any[] = [];

        items.forEach(ci => {
          const idStr = ci.id.toString();

          // Try to find in plants first (using toString for safety)
          let product = plants.find((p: any) => p._id.toString() === idStr);

          // If not found, try care tips
          if (!product) {
            const tip = careTips.find((c: any) => c._id === idStr);
            if (tip) {
              // Normalize care tip to look like a product
              product = {
                _id: tip._id,
                name: tip.title,
                category: tip.category,
                description: tip.description,
                image: tip.image,
                price: 0,
                discountPrice: 0
              };
            }
          }

          if (product) {
            validItems.push({ ...ci, product });
          } else {
            invalidIds.push(ci.id);
          }
        });

        // Cleanup cart if invalid items found
        if (invalidIds.length > 0) {
          invalidIds.forEach(id => this.cartService.delete(id));
          console.log('Cleaned up invalid items from cart:', invalidIds);
        }

        this.cartItems = validItems;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load cart data', err);
        this.isLoading = false;
      }
    });
  }

  calculateTotal() {
    this.subtotal = this.cartItems.reduce((acc, item) => {
      return acc + ((item.product.discountPrice || 0) * item.qty);
    }, 0);
  }

  increaseQty(id: any) {
    this.cartService.add(id);
  }

  decreaseQty(id: any) {
    this.cartService.remove(id);
  }

  removeItem(id: any) {
    this.cartService.delete(id);
  }

  checkout() {
    if (!localStorage.getItem('greenie.loggedIn')) {
      alert('Please login to complete your purchase!');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/order']);
  }
}
