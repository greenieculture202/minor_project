import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../services/admin.api';
import { AuthApiService } from '../../../services/auth.api';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Identity Management</h1>
          <p>Govern platform access and monitor user registrations.</p>
        </div>
        <button (click)="loadUsers()" class="btn-luxury-add" title="Sync Data">
          <i class="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>

      <!-- INFOGRAPHIC STATUS -->
      <div class="stat-cards" style="margin-bottom: 30px;">
        <div class="stat-card">
          <div class="card-icon-wrapper"><i class="fas fa-database"></i></div>
          <div class="stat-info">
            <span class="stat-label">Cloud Records</span>
            <span class="stat-value">{{ getServerCount() }}</span>
          </div>
          <div class="pulse-indicator" [class.success]="serverStatus==='Success'"></div>
        </div>
        <div class="stat-card">
          <div class="card-icon-wrapper"><i class="fas fa-hdd"></i></div>
          <div class="stat-info">
            <span class="stat-label">Local Cache</span>
            <span class="stat-value">{{ getLocalCount() }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon-wrapper"><i class="fas fa-shield-alt"></i></div>
          <div class="stat-info">
            <span class="stat-label">Auth Sync</span>
            <span class="stat-value">{{ hasToken() ? 'Connected' : 'Offline' }}</span>
          </div>
        </div>
      </div>

      <!-- ADMINS SECTION -->
      <div class="panel" style="margin-bottom: 40px;">
        <div class="panel-header">
           <h3><i class="fas fa-user-shield"></i> System Administrators</h3>
           <span class="badge admin">{{ getAdmins().length }} Active</span>
        </div>
        
        <table class="premium-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Email Frequency</th>
              <th>Access Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of getAdmins()">
              <td>
                <div class="user-identity">
                  <div class="user-avatar admin">{{ user.name.charAt(0) }}</div>
                  <div class="user-info">
                    <strong>{{ user.name }}</strong>
                    <small *ngIf="user.isLocal" class="badge user">Local Admin</small>
                  </div>
                </div>
              </td>
              <td><strong>{{ user.email }}</strong></td>
              <td><span class="badge admin">Super Admin</span></td>
              <td>
                <button (click)="deleteUser(user)" class="action-btn delete" title="Revoke Access">
                  <i class="fas fa-user-minus"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="getAdmins().length === 0">
              <td colspan="4" class="empty-state">No administrators found in your current node.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- USERS SECTION -->
      <div class="panel">
        <div class="panel-header">
           <h3><i class="fas fa-users"></i> Platform Users</h3>
           <div class="panel-actions">
              <div class="search-input-wrapper">
                 <i class="fas fa-search"></i>
                 <input type="email" [(ngModel)]="searchEmail" placeholder="Search / Block by identity..." class="premium-input">
              </div>
              <button (click)="toggleBlockByEmail()" class="btn-dark"><i class="fas fa-lock"></i> Toggle Shield</button>
           </div>
        </div>

        <table class="premium-table">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Security Level</th>
              <th>Contact Details</th>
              <th>Governance</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of getNormalUsers()" [class.row-blocked]="user.isBlocked">
              <td>
                <div class="user-identity">
                  <div class="user-avatar user">{{ user.name.charAt(0) }}</div>
                  <div class="user-info">
                    <strong>{{ user.name }}</strong>
                    <small>{{ user.email }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" [class.blocked]="user.isBlocked" [class.active-user]="!user.isBlocked">
                  {{ user.isBlocked ? 'Blocked' : 'Active' }}
                </span>
              </td>
              <td>
                <div class="contact-details">
                   <div *ngIf="user.phone" class="detail-bit"><i class="fas fa-phone-alt"></i> {{ user.phone }}</div>
                   <div *ngIf="user.address" class="detail-bit"><i class="fas fa-map-marker-alt"></i> {{ user.address | slice:0:30 }}...</div>
                </div>
              </td>
              <td>
                <div class="governance-actions">
                  <button (click)="toggleBlock(user)" class="btn-outline" [class.danger]="!user.isBlocked" [class.success]="user.isBlocked">
                    {{ user.isBlocked ? 'Unblock' : 'Block' }}
                  </button>
                  <button (click)="deleteUser(user)" class="action-btn delete"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .user-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; }
    .user-avatar.admin { background: linear-gradient(135deg, #f97316, #c2410c); }
    .user-avatar.user { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    
    .pulse-indicator { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; position: absolute; top: 20px; right: 20px; }
    .pulse-indicator.success { background: #3b82f6; box-shadow: 0 0 0 rgba(59, 130, 246, 0.4); animation: pulse 2s infinite; }
    
    @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
    
    .panel-actions { display: flex; gap: 1rem; }
    .search-input-wrapper { position: relative; }
    .search-input-wrapper i { position: absolute; left: 14px; top: 12px; color: #94a3b8; }
    .premium-input { padding: 10px 16px 10px 40px; border-radius: 12px; border: 1px solid var(--clr-border); background: #f8fafc; font-weight: 500; font-size: 0.9rem; width: 280px; }
    
    .btn-dark { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
    .btn-dark:hover { background: #000; transform: translateY(-2px); }
    
    .badge.active-user { background: #eff6ff; color: #1e40af; }
    .badge.blocked { background: #fef2f2; color: #991b1b; }
    
    .contact-details { font-size: 0.8rem; color: #64748b; font-weight: 500; }
    .detail-bit { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
    
    .governance-actions { display: flex; align-items: center; gap: 10px; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-outline.danger { color: #ef4444; border-color: #fecaca; }
    .btn-outline.success { color: #3b82f6; border-color: #bfdbfe; }
    .btn-outline:hover { background: #f8fafc; transform: translateY(-1px); }
    
    .row-blocked { opacity: 0.7; }
    .empty-state { text-align: center; padding: 60px; color: #94a3b8; font-style: italic; }
    
    .action-btn.delete { width: 34px; height: 34px; border-radius: 8px; border: none; background: #fef2f2; color: #991b1b; cursor: pointer; transition: all 0.2s; }
    .action-btn.delete:hover { background: #ef4444; color: white; transform: translateY(-2px); }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  searchEmail = '';
  serverStatus: 'Pending' | 'Success' | 'Error' = 'Pending';

  constructor(private adminApi: AdminApiService, private authApi: AuthApiService) { }

  ngOnInit() { this.loadUsers(); }

  getServerCount(): number { return this.users.filter(u => !u.isLocal).length; }
  getLocalCount(): number {
    try {
      const raw = localStorage.getItem('greenie.users');
      return raw ? JSON.parse(raw).length : 0;
    } catch { return 0; }
  }

  hasToken(): boolean { return !!localStorage.getItem('greenie.token'); }
  getAdmins() { return this.users.filter(u => u.role === 'admin'); }
  getNormalUsers() { return this.users.filter(u => u.role !== 'admin'); }

  loadUsers() {
    const token = localStorage.getItem('greenie.token');
    this.serverStatus = 'Pending';
    let localUsers: any[] = [];
    try {
      const raw = localStorage.getItem('greenie.users');
      localUsers = raw ? JSON.parse(raw) : [];
      localUsers = localUsers.map(u => ({ ...u, isLocal: true, createdAt: u.createdAt || new Date().toISOString() }));
    } catch (e) { }

    if (!token) { this.users = localUsers; this.serverStatus = 'Error'; return; }

    this.adminApi.listUsers(token).subscribe({
      next: (res) => {
        this.serverStatus = 'Success';
        const serverUsers = Array.isArray(res) ? res : [];
        const merged = [...serverUsers];
        localUsers.forEach(lu => { if (!merged.find(su => su.email === lu.email)) merged.push(lu); });
        merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        this.users = merged;
      },
      error: () => { this.serverStatus = 'Error'; this.users = localUsers; }
    });
  }

  toggleBlock(user: any) {
    const token = localStorage.getItem('greenie.token');
    const action = user.isBlocked ? 'unblock' : 'block';
    if (confirm(`Are you certain about ${action}ing ${user.name}?`)) {
      if (user.isLocal || !token) {
        this.toggleLocalBlock(user);
      } else {
        this.adminApi.toggleUserBlock(token, user._id).subscribe({
          next: (res) => { user.isBlocked = res.isBlocked; this.syncBlockToLocal(user.email, res.isBlocked); }
        });
      }
    }
  }

  private toggleLocalBlock(user: any) {
    try {
      const raw = localStorage.getItem('greenie.users');
      let localUsers = raw ? JSON.parse(raw) : [];
      const index = localUsers.findIndex((u: any) => u.email === user.email);
      if (index !== -1) {
        localUsers[index].isBlocked = !localUsers[index].isBlocked;
        localStorage.setItem('greenie.users', JSON.stringify(localUsers));
        user.isBlocked = localUsers[index].isBlocked;
      }
    } catch (e) { }
  }

  private syncBlockToLocal(email: string, isBlocked: boolean) {
    try {
      const raw = localStorage.getItem('greenie.users');
      if (!raw) return;
      let localUsers = JSON.parse(raw);
      const index = localUsers.findIndex((u: any) => u.email === email);
      if (index !== -1) { localUsers[index].isBlocked = isBlocked; localStorage.setItem('greenie.users', JSON.stringify(localUsers)); }
    } catch (e) { }
  }

  toggleBlockByEmail() {
    const token = localStorage.getItem('greenie.token');
    if (!this.searchEmail.trim()) return;
    const email = this.searchEmail.trim();
    if (confirm(`Toggle block for ${email}?`)) {
       this.adminApi.toggleBlockByEmail(token || '', email).subscribe({ next: () => this.loadUsers() });
    }
  }

  deleteUser(user: any) {
    const token = localStorage.getItem('greenie.token');
    if (confirm(`PERMANENTLY delete user ${user.name}?`)) {
      if (user.isLocal || !token) {
        this.deleteLocalUser(user.email);
        this.loadUsers();
      } else {
        this.adminApi.deleteUser(token, user._id).subscribe({ next: () => this.loadUsers() });
      }
    }
  }

  private deleteLocalUser(email: string) {
    try {
      const raw = localStorage.getItem('greenie.users');
      if (!raw) return;
      let users = JSON.parse(raw);
      users = users.filter((u: any) => u.email !== email);
      localStorage.setItem('greenie.users', JSON.stringify(users));
    } catch (e) { }
  }
}
