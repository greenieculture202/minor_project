import { Injectable } from '@angular/core';
import { ApiBase } from './api.base';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  constructor(private api: ApiBase) {}

  getCart(): Observable<any> {
    const token = localStorage.getItem('greenie.token');
    return this.api.get<any>('cart', token || '');
  }

  addToCart(plantId: string, qty: number = 1): Observable<any> {
    const token = localStorage.getItem('greenie.token');
    return this.api.post<any>('cart', { plantId, qty }, token || '');
  }

  removeFromCart(plantId: string): Observable<any> {
    const token = localStorage.getItem('greenie.token');
    return this.api.delete<any>(`cart/${plantId}`, token || '');
  }

  clearCart(): Observable<any> {
    const token = localStorage.getItem('greenie.token');
    return this.api.delete<any>('cart', token || '');
  }

  syncCart(items: any[]): Observable<any> {
    const token = localStorage.getItem('greenie.token');
    return this.api.post<any>('cart/sync', { items }, token || '');
  }
}
