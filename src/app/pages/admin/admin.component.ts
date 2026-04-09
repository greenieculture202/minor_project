import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthApiService } from '../../services/auth.api';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="admin-root">
    <aside class="admin-side">
      <div class="brand">
        <i class="fas fa-leaf"></i>
        <span>Greenie Admin</span>
      </div>
      
      <nav>
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <i class="fas fa-chart-line"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/admin/plants" routerLinkActive="active">
          <i class="fas fa-seedling"></i>
          <span>Manage Plants</span>
        </a>
        <a routerLink="/admin/care-tips" routerLinkActive="active">
          <i class="fas fa-hand-holding-heart"></i>
          <span>Care Tips</span>
        </a>
        <a routerLink="/admin/users" routerLinkActive="active">
          <i class="fas fa-users-cog"></i>
          <span>Manage Users</span>
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active">
          <i class="fas fa-shopping-bag"></i>
          <span>Manage Orders</span>
        </a>
        <a routerLink="/admin/carts" routerLinkActive="active">
          <i class="fas fa-shopping-cart"></i>
          <span>Active Carts</span>
        </a>
        <a routerLink="/admin/blog" routerLinkActive="active">
          <i class="fas fa-newspaper"></i>
          <span>Manage Blogs</span>
        </a>
        <a routerLink="/admin/faq" routerLinkActive="active">
          <i class="fas fa-question-circle"></i>
          <span>Manage FAQs</span>
        </a>
        <a routerLink="/admin/settings" routerLinkActive="active">
          <i class="fas fa-cog"></i>
          <span>Settings</span>
        </a>
      </nav>

      <div class="side-footer">
          <button class="logout-pill" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
      </div>
    </aside>

    <main class="admin-main">
        <router-outlet></router-outlet>
    </main>
  </div>
  `,
  styleUrls: ['./admin-shared.css'],
  styles: [`
    :host { display: block; height: 100vh; }
    .admin-root { display: flex; height: 100vh; background: #f8fafc; }
    
    .admin-side { 
      width: 280px; 
      background: #0f172a !important; /* Premium Midnight Navy */
      color: white !important;
      display: flex;
      flex-direction: column;
      padding: 40px 24px;
      box-shadow: 10px 0 40px rgba(0,0,0,0.15);
      z-index: 100;
      position: relative;
      border-right: 1px solid rgba(255,255,255,0.05);
    }

    .admin-side .brand {
      font-size: 1.75rem;
      font-weight: 800;
      color: white;
      margin-bottom: 48px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .admin-side nav {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .admin-side nav a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .admin-side nav a:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .admin-side nav a.active {
      background: #3b82f6; /* Modern Blue Active State */
      color: white;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .side-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-pill {
       width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
       padding: 12px; background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2);
       border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s;
    }
    .logout-pill:hover { background: #ef4444; color: white; border-color: #ef4444; }
  `]
})
export class AdminComponent implements OnInit {
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  ngOnInit() {
    if (!this.authApi.isAdmin()) {
      console.warn('Unauthorized access to admin panel. Redirecting...');
      this.router.navigate(['/']);
    }
  }

  logout() {
    this.authApi.logout();
    this.router.navigate(['/login']);
  }
}
