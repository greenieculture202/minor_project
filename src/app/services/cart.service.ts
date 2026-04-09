import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { CartApiService } from './cart.api.service';
import { AuthApiService } from './auth.api';

interface CartEntry {
  id: any;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartApi = inject(CartApiService);
  private authApi = inject(AuthApiService);

  private items = new Map<any, CartEntry>();
  private itemsSubject = new BehaviorSubject<CartEntry[]>([]);
  readonly items$ = this.itemsSubject.asObservable();
  private count$ = new BehaviorSubject<number>(0);
  readonly cartCount$ = this.count$.asObservable();

  constructor() {
    this.load();
    // Listen for storage events to sync across tabs (Guest only)
    window.addEventListener('storage', (event) => {
      if (event.key === 'greenie.cart.guest') {
        this.load();
      }
    });

    // Subscribe to auth changes to sync cart
    this.authApi.currentUser$.subscribe(user => {
        if (user) {
            this.syncWithDatabase();
        } else {
            this.load(); // Re-load guest cart on logout
        }
    });
  }

  async add(id: any) {
    if (this.authApi.isLoggedIn()) {
        try {
            await firstValueFrom(this.cartApi.addToCart(id, 1));
            this.load(); // Refresh from DB
        } catch (e: any) { 
            console.error('DB Add failed', e);
            if (e.status === 401) {
                this.authApi.triggerSessionExpired();
            } else {
               // Use internal notification if available or silent fail to console
               console.warn('Network error adding to cart');
            }
        }
        return;
    }

    const existing = this.items.get(id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.set(id, { id, qty: 1 });
    }
    this.save();
    this.updateCount();
  }

  async remove(id: any) {
    if (this.authApi.isLoggedIn()) {
        try {
            await firstValueFrom(this.cartApi.addToCart(id, -1));
            this.load(); // Refresh from DB
        } catch (e) { console.error('DB remove failed', e); }
        return;
    }

    const existing = this.items.get(id);
    if (!existing) return;
    if (existing.qty > 1) {
      existing.qty--;
    } else {
      this.items.delete(id);
    }
    this.save();
    this.updateCount();
  }

  async delete(id: any) {
    if (this.authApi.isLoggedIn()) {
        try {
            await firstValueFrom(this.cartApi.removeFromCart(id));
            this.load(); // Refresh from DB
        } catch (e) { console.error('DB delete failed', e); }
        return;
    }

    if (this.items.has(id)) {
      this.items.delete(id);
      this.save();
      this.updateCount();
    }
  }

  quantity(id: any) {
    return this.items.get(id)?.qty ?? 0;
  }

  getItems(): CartEntry[] {
    return Array.from(this.items.values());
  }

  async clear() {
    if (this.authApi.isLoggedIn()) {
        try {
            await firstValueFrom(this.cartApi.clearCart());
            this.load(); // Refresh from DB
        } catch (e) { console.error('DB clear failed', e); }
        return;
    }

    this.items.clear();
    this.save();
    this.updateCount();
  }

  private updateCount() {
    let total = 0;
    const entries: CartEntry[] = [];
    this.items.forEach((v) => {
      total += v.qty;
      entries.push(v);
    });
    this.count$.next(total);
    this.itemsSubject.next(entries);
  }

  private getStorageKey(): string {
    return 'greenie.cart.guest';
  }

  private save() {
    const entries = Array.from(this.items.values());
    localStorage.setItem(this.getStorageKey(), JSON.stringify(entries));
  }

  async syncWithDatabase() {
     const guestItems = JSON.parse(localStorage.getItem('greenie.cart.guest') || '[]');
     if (guestItems.length > 0) {
        try {
            await firstValueFrom(this.cartApi.syncCart(guestItems));
            localStorage.removeItem('greenie.cart.guest'); // Clear guest cart after sync
        } catch (e) { console.error('Sync failed', e); }
     }
     this.load(); // Load from DB after sync/login
  }

  async load() {
    if (this.authApi.isLoggedIn()) {
        try {
            const res = await firstValueFrom(this.cartApi.getCart());
            this.items.clear();
            if (res && res.items) {
                res.items.forEach((it: any) => {
                    // Centralized ID resolution
                    const pid = it.plant?._id || it.plant;
                    if (pid) {
                        this.items.set(pid.toString(), { id: pid.toString(), qty: it.qty });
                    }
                });
            }
            this.updateCount();
        } catch (e) {
            console.error('Failed to load DB cart', e);
        }
        return;
    }

    try {
      const key = this.getStorageKey();
      const raw = localStorage.getItem(key);
      this.items.clear(); 
      if (raw) {
        const entries: CartEntry[] = JSON.parse(raw);
        entries.forEach(e => {
            if (e.id) this.items.set(e.id.toString(), e);
        });
      }
      this.updateCount();
    } catch (e) {
      console.error('Failed to load local cart', e);
    }
  }
}
