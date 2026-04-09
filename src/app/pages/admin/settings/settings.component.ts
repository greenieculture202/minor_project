import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../services/auth.api';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-wrapper animate-fade-in">
      <div class="page-header">
        <div class="header-text">
          <h1 class="premium-title">Settings</h1>
          <p class="premium-subtitle">Orchestrate your security and administrative preferences.</p>
        </div>
        <button class="luxury-action-btn" (click)="showAdminModal = true">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Admin
        </button>
      </div>
      
      <div class="glass-card main-settings">
        <div class="card-header">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div class="header-meta">
            <h3>Change Password</h3>
            <p>Update your credentials periodically for maximum security.</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="luxury-form-group">
            <label>Current Password</label>
            <div class="luxury-input-wrapper">
              <input [type]="showCurrentPass ? 'text' : 'password'" [(ngModel)]="currentPassword" placeholder="••••••••">
              <button type="button" class="field-toggle" (click)="showCurrentPass = !showCurrentPass">
                <svg *ngIf="!showCurrentPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showCurrentPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24l6.4 6.4h.01M1 1l22 22"/></svg>
              </button>
            </div>
          </div>

          <div class="luxury-form-group">
            <label>New Password</label>
            <div class="luxury-input-wrapper">
              <input [type]="showNewPass ? 'text' : 'password'" [(ngModel)]="newPassword" placeholder="Minimum 8 characters">
              <button type="button" class="field-toggle" (click)="showNewPass = !showNewPass">
                <svg *ngIf="!showNewPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showNewPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24l6.4 6.4h.01M1 1l22 22"/></svg>
              </button>
            </div>
          </div>

          <div class="luxury-form-group">
            <label>Confirm New Password</label>
            <div class="luxury-input-wrapper">
              <input [type]="showConfirmPass ? 'text' : 'password'" [(ngModel)]="confirmPassword" placeholder="Repeat new password">
              <button type="button" class="field-toggle" (click)="showConfirmPass = !showConfirmPass">
                <svg *ngIf="!showConfirmPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showConfirmPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24l6.4 6.4h.01M1 1l22 22"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="message-area">
          <div class="luxury-error" *ngIf="errorMsg">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{{ errorMsg }}</span>
          </div>
          <div class="luxury-success" *ngIf="successMsg">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{{ successMsg }}</span>
          </div>
        </div>

        <button class="botanical-submit" (click)="updatePassword()" [disabled]="isLoading">
          <span *ngIf="!isLoading">Authorize & Update Password</span>
          <span *ngIf="isLoading" class="premium-loader"></span>
        </button>
      </div>

      <!-- Add New Admin Modal -->
      <div class="luxury-overlay" *ngIf="showAdminModal" (click)="closeAdminModal()">
        <div class="luxury-modal" (click)="$event.stopPropagation()">
          <div class="modal-identity">
            <div class="icon-sq">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
            </div>
            <div class="text-meta">
              <h3>Onboard New Admin</h3>
              <p>Strict Domain Enforcement: <strong>&#64;culture.com</strong></p>
            </div>
            <button class="modal-close" (click)="closeAdminModal()">&times;</button>
          </div>

          <div class="luxury-form-body">
            <div class="luxury-form-group">
              <label>Full Name</label>
              <div class="luxury-input-wrapper">
                <input type="text" [(ngModel)]="adminName" placeholder="Enter full legal name">
              </div>
            </div>

            <div class="luxury-form-group">
              <label>Administrative Email Address</label>
              <div class="luxury-input-wrapper">
                <input type="email" [(ngModel)]="adminEmail" placeholder="username&#64;culture.com">
              </div>
            </div>

            <div class="luxury-form-group">
              <label>Generated Password</label>
              <div class="luxury-input-wrapper">
                <input [type]="showAdminPass ? 'text' : 'password'" [(ngModel)]="adminPassword" placeholder="Strong security string">
                <button type="button" class="field-toggle" (click)="showAdminPass = !showAdminPass">
                   <svg *ngIf="!showAdminPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                   <svg *ngIf="showAdminPass" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24l6.4 6.4h.01M1 1l22 22"/></svg>
                </button>
              </div>
            </div>

            <div class="message-area">
              <div class="luxury-error" *ngIf="adminError">
                <span>{{ adminError }}</span>
              </div>
              <div class="luxury-success" *ngIf="adminSuccess">
                <span>{{ adminSuccess }}</span>
              </div>
            </div>

            <button class="botanical-submit secondary" (click)="createNewAdmin()" [disabled]="isAdminLoading">
              <span *ngIf="!isAdminLoading">Finalize Onboarding</span>
              <span *ngIf="isAdminLoading" class="premium-loader"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&display=swap');

    .admin-wrapper {
      padding: 40px;
      min-height: 100vh;
      background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 40%),
                  radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.03), transparent 40%);
    }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
    
    .premium-title { 
      font-family: 'Bricolage Grotesque', sans-serif; 
      font-size: 2.8rem; 
      font-weight: 800; 
      color: var(--clr-primary); 
      margin: 0;
      letter-spacing: -1.5px;
    }

    .premium-subtitle { color: #64748b; font-size: 1.1rem; margin-top: 5px; }

    .luxury-action-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white; border: none; padding: 14px 28px; border-radius: 16px;
      font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700;
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .luxury-action-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.3); }

    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 32px;
      padding: 48px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
      max-width: 800px;
      margin: 0 auto;
    }

    .card-header { display: flex; align-items: center; gap: 24px; margin-bottom: 40px; }
    
    .icon-circle {
      width: 60px; height: 60px; background: #eff6ff; color: #3b82f6;
      border-radius: 20px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
    }

    .header-meta h3 { 
      font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.8rem; 
      font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -0.5px;
    }
    .header-meta p { color: #64748b; margin: 4px 0 0; font-size: 1rem; }

    .form-grid { display: flex; flex-direction: column; gap: 28px; }

    .luxury-form-group label {
      display: block; margin-bottom: 10px; font-weight: 700; color: #334155;
      font-size: 0.9rem; letter-spacing: 0.02em; text-transform: uppercase;
    }

    .luxury-input-wrapper { position: relative; }

    .luxury-input-wrapper input {
      width: 100%; padding: 16px 20px; border-radius: 16px; border: 1.5px solid #e2e8f0;
      background: rgba(248, 250, 252, 0.8); font-size: 1.05rem; color: #1e293b;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .luxury-input-wrapper input:focus {
      background: #fff; border-color: #3b82f6; outline: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 16px rgba(0,0,0,0.02);
    }

    .field-toggle {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #94a3b8; cursor: pointer;
      padding: 6px; transition: color 0.2s;
    }
    .field-toggle:hover { color: #3b82f6; }

    .botanical-submit {
      width: 100%; margin-top: 40px; padding: 18px; border-radius: 18px;
      background: #1d4ed8; color: white; border: none;
      font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700;
      font-size: 1.1rem; cursor: pointer; transition: all 0.3s;
      box-shadow: 0 10px 20px rgba(29, 78, 216, 0.15);
    }
    .botanical-submit:hover:not(:disabled) { background: #1e3a8a; transform: translateY(-2px); box-shadow: 0 15px 30px rgba(29, 78, 216, 0.2); }
    .botanical-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Modal Styling */
    .luxury-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
      animation: backdropFade 0.3s ease;
    }

    .luxury-modal {
      background: white; width: 100%; max-width: 550px; padding: 40px;
      border-radius: 36px; box-shadow: 0 40px 80px -20px rgba(0,0,0,0.3);
      animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-identity { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; position: relative; }
    .icon-sq { 
      width: 54px; height: 54px; background: #1d4ed8; color: white;
      border-radius: 18px; display: flex; align-items: center; justify-content: center;
    }
    .modal-identity h3 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 1.6rem; font-weight: 800; color: #1e293b; margin: 0; }
    .modal-identity p { color: #64748b; margin: 2px 0 0; font-size: 0.95rem; }
    .modal-close { position: absolute; top: -10px; right: -10px; background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: all 0.2s; color: #64748b; }
    .modal-close:hover { background: #fee2e2; color: #ef4444; }

    .luxury-form-body { display: flex; flex-direction: column; gap: 24px; }
    .botanical-submit.secondary { background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%); }

    /* Feedback Styling */
    .message-area { margin-top: 15px; }
    .luxury-error, .luxury-success {
      display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 14px; font-weight: 600; font-size: 0.95rem;
    }
    .luxury-error { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
    .luxury-success { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }

    @keyframes backdropFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
  `]
})
export class AdminSettingsComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // New Admin Fields
  adminName = '';
  adminEmail = '';
  adminPassword = '';
  showAdminPass = false;
  isAdminLoading = false;
  adminError = '';
  adminSuccess = '';
  showAdminModal = false;

  showCurrentPass = false;
  showNewPass = false;
  showConfirmPass = false;

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private auth: AuthApiService, private router: Router) { }

  closeAdminModal() {
    this.showAdminModal = false;
    this.adminError = '';
    this.adminSuccess = '';
  }

  updatePassword() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMsg = 'Please fill in all fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'New passwords do not match';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;

    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.successMsg = 'Password updated successfully! Logging out...';
          setTimeout(() => {
            this.auth.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMsg = 'Failed to update password. Please check your current password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'An error occurred. Please try again.';
      }
    });
  }

  createNewAdmin() {
    this.adminError = '';
    this.adminSuccess = '';

    if (!this.adminName || !this.adminEmail || !this.adminPassword) {
      this.adminError = 'Please fill in all details for the new admin.';
      return;
    }

    if (!this.adminEmail.toLowerCase().endsWith('@culture.com')) {
      this.adminError = 'Security Policy: Admin emails MUST end with @culture.com';
      return;
    }

    if (this.adminPassword.length < 6) {
      this.adminError = 'Password must be at least 6 characters long.';
      return;
    }

    this.isAdminLoading = true;

    this.auth.register(
      this.adminName,
      this.adminEmail,
      this.adminPassword,
      '', // Phone optional
      '', // Address optional
      'admin'
    ).subscribe({
      next: (res) => {
        this.isAdminLoading = false;
        this.adminSuccess = `New Admin ${this.adminName} created successfully!`;
        // Reset fields
        this.adminName = '';
        this.adminEmail = '';
        this.adminPassword = '';
      },
      error: (err) => {
        this.isAdminLoading = false;
        this.adminError = 'Failed to create admin. Email might already be in use.';
      }
    });
  }
}
