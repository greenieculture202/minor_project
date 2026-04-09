import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../services/admin.api';
import { PlantsApiService } from '../../services/plants.api';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="admin-root">
    <aside class="admin-side">
      <div class="brand" routerLink="/">
        <img src="/assets/logo.png" alt="Logo" style="width: 32px; height: 32px; object-fit: contain; margin-right: 10px; filter: brightness(0) saturate(100%) invert(42%) sepia(91%) saturate(1636%) hue-rotate(202deg) brightness(101%) contrast(106%);">
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
      <div class="main-container">
        <!-- HEADER -->
        <header class="dash-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div class="header-right">
             <div class="admin-badge">
                 <img src="assets/bg1.jpg" alt="Avatar" class="avatar-img">
                 <div class="admin-info">
                     <strong>Admin Culture</strong>
                     <small>Level 1 Admin</small>
                 </div>
             </div>
          </div>
        </header>

        <!-- STAT CARDS -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="card-icon-wrapper"><i class="fas fa-tree"></i></div>
            <div class="stat-info">
               <span class="stat-label">Total Plants</span>
               <span class="stat-value">{{ totalPlants }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="card-icon-wrapper"><i class="fas fa-shopping-cart"></i></div>
            <div class="stat-info">
               <span class="stat-label">Total Orders</span>
               <span class="stat-value">124</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-icon-wrapper"><i class="fas fa-user-friends"></i></div>
            <div class="stat-info">
               <span class="stat-label">Registered Users</span>
               <span class="stat-value">{{ totalUsers }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-icon-wrapper"><i class="fas fa-wallet"></i></div>
            <div class="stat-info">
               <span class="stat-label">Revenue</span>
               <span class="stat-value">₹46,311</span>
            </div>
          </div>
        </div>

        <!-- RECENT ACTIVITY GRID -->
        <div class="dashboard-grid">
           <!-- RECENT USERS -->
           <section class="panel">
              <div class="panel-header">
                 <h3><i class="fas fa-user-plus"></i> Recently Joined Users</h3>
                 <button routerLink="/admin/users" class="btn-ghost">View All</button>
              </div>
              <table class="premium-table">
                 <thead>
                    <tr><th>User Identity</th><th>Role</th><th>Registered</th></tr>
                 </thead>
                 <tbody>
                    <tr *ngFor="let u of recentUsers">
                       <td>
                          <div class="user-identity">
                             <div class="user-avatar">{{ u.name.charAt(0) }}</div>
                             <div class="user-info">
                                <strong>{{ u.name }}</strong>
                                <small>{{ u.email }}</small>
                             </div>
                          </div>
                       </td>
                       <td><span class="badge" [class.admin]="u.role === 'admin'" [class.user]="u.role === 'user'">{{ u.role }}</span></td>
                       <td>{{ u.createdAt | date:'mediumDate' }}</td>
                    </tr>
                    <tr *ngIf="recentUsers.length === 0">
                       <td colspan="3" class="empty-msg">No users found. Login to access cloud data.</td>
                    </tr>
                 </tbody>
              </table>
           </section>

           <!-- VISITOR LOG -->
           <section class="panel">
              <div class="panel-header">
                 <h3><i class="fas fa-clock"></i> Live Visitor Log</h3>
                 <span class="badge admin">{{ totalVisits }} active</span>
              </div>
              <table class="premium-table">
                 <thead>
                    <tr><th>Visitor</th><th>Location</th><th>Time</th></tr>
                 </thead>
                 <tbody>
                    <tr *ngFor="let v of recentVisitors">
                       <td>
                          <div class="user-info">
                             <strong>{{ v.name || 'Incognito' }}</strong>
                             <small>{{ v.email }}</small>
                          </div>
                       </td>
                       <td><small>Localhost / Hidden</small></td>
                       <td>{{ v.lastVisit | date:'shortTime' }}</td>
                    </tr>
                 </tbody>
              </table>
           </section>
        </div>
      </div>
    </main>
  </div>
  `,
  styleUrls: ['./admin-shared.css'],
  styles: [`
    .header-right { display: flex; align-items: center; gap: 20px; }
    .admin-badge {
       display: flex; align-items: center; gap: 12px; background: white; padding: 6px 16px 6px 6px;
       border-radius: 40px; border: 1px solid var(--clr-border); box-shadow: var(--shadow-sm);
    }
    .avatar-img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
    .admin-info { display: flex; flex-direction: column; }
    .admin-info strong { font-size: 0.85rem; color: var(--clr-text-main); font-weight: 700; }
    .admin-info small { font-size: 0.7rem; color: var(--clr-text-muted); }
    
    .side-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-pill {
       width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
       padding: 12px; background: rgba(239, 68, 68, 0.1); color: #fecaca; border: 1px solid rgba(239, 68, 68, 0.2);
       border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-bottom: 20px;
    }
    .logout-pill:hover { background: #ef4444; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
    
    .empty-msg { text-align: center; padding: 40px; color: #94a3b8; font-style: italic; }
  `]
})
export class AdminComponent implements OnInit {
  totalPlants = 0;
  totalUsers = 0;
  totalVisits = 0;
  revenue = '₹46,311';
  recentPlants: any[] = [];
  recentVisitors: any[] = [];
  recentUsers: any[] = [];

  constructor(private plantsApi: PlantsApiService, private adminApi: AdminApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadStats();
  }

  logout() {
    localStorage.removeItem('greenie.token');
    localStorage.removeItem('greenie.loggedIn');
    localStorage.removeItem('greenie.currentUser');
    this.router.navigate(['/login']);
  }

  private token(): string | null { try { return localStorage.getItem('greenie.token'); } catch { return null; } }

  loadStats() {
    const t = this.token();

    this.plantsApi.list().subscribe({ next: (p) => { this.totalPlants = p.length; this.recentPlants = p.slice(0, 5); } });

    if (t) {
      this.adminApi.listUsers(t).subscribe({
        next: (u: any) => {
          let localUsers = [];
          try {
            const raw = localStorage.getItem('greenie.users');
            localUsers = raw ? JSON.parse(raw) : [];
          } catch (e) { }

          const merged = [...u];
          localUsers.forEach((lu: any) => {
            if (!merged.find(su => su.email === lu.email)) merged.push(lu);
          });

          // Sort by creation date (Newest first)
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          this.totalUsers = merged.length;
          this.recentUsers = merged.slice(0, 5);

        }
      });

      this.adminApi.listVisitors(t).subscribe({
        next: (v) => {
          this.totalVisits = v.length;
          this.recentVisitors = v.slice(0, 5);
        }
      });
    }
  }
}
