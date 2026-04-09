import { Injectable } from '@angular/core';
import { ApiBase } from './api.base';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface User {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private sessionExpiredSubject = new BehaviorSubject<boolean>(false);
  public sessionExpired$ = this.sessionExpiredSubject.asObservable();

  triggerSessionExpired() {
    this.logout();
    this.sessionExpiredSubject.next(true);
  }

  constructor(private api: ApiBase) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const stored = localStorage.getItem('greenie.loggedIn');
      const token = localStorage.getItem('greenie.token');
      if ((stored === '1' || stored === 'true') && token) {
        const rawUser = localStorage.getItem('greenie.currentUser');
        const user = rawUser ? JSON.parse(rawUser) : null;
        this.currentUserSubject.next(user);
      } else {
        this.setCurrentUser(null); // Clear inconsistent state
      }
    } catch (e) {
      this.currentUserSubject.next(null);
    }
  }

  setCurrentUser(user: User | null) {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('greenie.loggedIn', '1');
      localStorage.setItem('greenie.currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('greenie.loggedIn');
      localStorage.removeItem('greenie.currentUser');
      localStorage.removeItem('greenie.token');
    }
  }

  register(name: string, email: string, password: string, phone: string, address: string, role = 'user'): Observable<AuthResponse> {
    const payload = { name, email, password, phone, address, role };
    return this.api.post<AuthResponse>('auth/register', payload).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('greenie.token', res.token);
          this.setCurrentUser(res.user);
        }
      }),
      catchError(err => {
        console.error('Registration failed:', err);
        throw err;
      })
    );
  }

  // Helper to save to local admin list
  private saveLocalUser(user: any, password?: string) {
    try {
      const raw = localStorage.getItem('greenie.users');
      const users = raw ? JSON.parse(raw) : [];
      // Check duplicate
      if (!users.find((u: any) => u.email === user.email)) {
        users.push({ ...user, password, isLocal: true, createdAt: new Date().toISOString() });
        localStorage.setItem('greenie.users', JSON.stringify(users));
      }
    } catch (e) { }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', { email, password }).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('greenie.token', res.token);
          this.setCurrentUser(res.user);
        }
      }),
      catchError(err => {
        console.error('Login failed:', err);
        throw err;
      })
    );
  }

  logout() {
    this.setCurrentUser(null);
  }

  checkStatus(): Observable<any> {
    const token = localStorage.getItem('greenie.token');

    // If it's a local/dummy session, check localStorage
    if (token && token.startsWith('dummy-token-')) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        try {
          const raw = localStorage.getItem('greenie.users');
          const users = raw ? JSON.parse(raw) : [];
          const found = users.find((u: any) => u.email === currentUser.email);
          if (found && found.isBlocked) {
            return of({ isBlocked: true });
          }
        } catch (e) { }
      }
      return of({ isBlocked: false });
    }

    // Default to API check
    return this.api.get<any>('auth/status', token || '');
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return of(false);

    const token = localStorage.getItem('greenie.token');

    // 1. Try API if it's NOT a dummy-token
    if (token && !token.startsWith('dummy-token-')) {
      return this.api.post<any>('auth/change-password', { oldPassword, newPassword }, token).pipe(
        map(() => true),
        catchError((err) => {
          console.error('API Password change failed', err);
          return of(false);
        })
      );
    }

    // 2. Fallback to Local Storage for dummy-tokens
    try {
      const raw = localStorage.getItem('greenie.users');
      const users: any[] = raw ? JSON.parse(raw) : [];
      const index = users.findIndex((u: any) => u.email === currentUser.email);

      if (index !== -1) {
        if (users[index].password !== oldPassword) {
          return of(false);
        }
        users[index].password = newPassword;
        localStorage.setItem('greenie.users', JSON.stringify(users));
        return of(true);
      }
    } catch (e) {
      console.error('Local Password change failed', e);
    }
    return of(false);
  }
}

