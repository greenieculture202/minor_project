import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../services/admin.api';
import { CareTipsApiService, CareTip } from '../../../services/care-tips.api';
import { NotificationService } from '../../../services/notification.service';
import { AuthApiService } from '../../../services/auth.api';

@Component({
  selector: 'app-admin-care-tips',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Knowledge Repository</h1>
          <p>Curate artisanal care guides and botanical wisdom for your community.</p>
        </div>
        <div class="header-actions">
           <div class="search-box">
             <div class="input-with-icon">
                <i class="fas fa-search"></i>
                <input type="text" [(ngModel)]="searchTerm" placeholder="Search wisdom..." (input)="applyFilters()" class="search-input">
             </div>
           </div>
           <button class="btn-luxury-add" (click)="openModal()">
             <i class="fas fa-feather-alt"></i> Author New Tip
           </button>
        </div>
      </div>

      <div class="panel" style="padding: 0; overflow: hidden; margin-top: 20px;">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Visual Aid</th>
              <th>Topic & Resonance</th>
              <th>Valuation</th>
              <th>Précis</th>
              <th>Governance</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filteredTips">
              <td>
                <div class="tip-visual-wrapper">
                  <img [src]="t.image" [alt]="t.title" (error)="t.image='assets/bg1.jpg'">
                </div>
              </td>
              <td>
                 <div class="user-info">
                    <strong>{{ t.title }}</strong>
                    <small>ID: T-{{ t._id?.substring(20) || 'LCL' }}</small>
                 </div>
              </td>
              <td><span class="badge user">₹{{ t.price || 0 }}</span></td>
              <td class="desc-cell-premium">{{ t.description | slice:0:60 }}{{ t.description.length > 60 ? '...' : '' }}</td>
              <td>
                <div class="action-btn-group">
                  <button class="mini-btn edit" (click)="editTip(t)" title="Refine"><i class="fas fa-pen-fancy"></i></button>
                  <button class="mini-btn delete" (click)="deleteTip(t._id)" title="Archive"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTips.length === 0">
              <td colspan="5" class="empty-state">The archives are currently silent. No findings match your search.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL: CARE TIP -->
      <div class="modal-overlay" *ngIf="showModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h2><i class="fas fa-book-open"></i> {{ isEditing ? 'Refine Botanical Wisdom' : 'Author New Guidance' }}</h2>
            <button class="close-x" (click)="closeModal()">&times;</button>
          </div>
          
          <form (ngSubmit)="saveTip()" class="luxury-form">
            <div class="form-field">
              <label>Guidance Title</label>
              <input [(ngModel)]="tipForm.title" name="title" required placeholder="e.g. The Secrets of Humidity">
            </div>
            
            <div class="form-field">
              <label>Imagery URL</label>
              <input [(ngModel)]="tipForm.image" name="image" placeholder="Vibrant visual source link">
            </div>

            <div class="form-grid">
               <div class="form-field">
                  <label>Knowledge Access Fee (₹)</label>
                  <input type="number" [(ngModel)]="tipForm.price" name="price" placeholder="0">
               </div>
               <div class="form-field">
                  <label>Deep Narrative (Detailed Info)</label>
                  <input [(ngModel)]="tipForm.details" name="details" placeholder="Full scholarly details...">
               </div>
            </div>

            <div class="form-field">
              <label>Abstract Summary</label>
              <textarea [(ngModel)]="tipForm.description" name="description" rows="4" placeholder="Briefly summarize the essence of this guidance..."></textarea>
            </div>
            
            <div class="form-actions">
               <button type="button" class="btn-ghost" (click)="closeModal()">Discard Draft</button>
                <button type="submit" class="btn-luxury-add" style="font-size: 0.95rem; padding: 12px 24px;">
                  {{ isEditing ? 'Publish Updates' : 'Enshrine Guidance' }}
                </button>
            </div>
          </form>
        </div>
      </div>

      <!-- DUPLICATE DIALOG -->
      <div class="modal-overlay" *ngIf="showDuplicateModal" style="z-index: 1200;">
        <div class="alert-panel">
           <div class="alert-icon-main"><i class="fas fa-scroll"></i></div>
           <h3>Wisdom Duplication</h3>
           <p>A similar guidance already exists in our repository. Would you like to refine the existing scrolls or start fresh?</p>
           <div class="alert-group">
               <button class="btn-luxury-add" style="width: 100%;" (click)="confirmEditDuplicate()">Update Existing Scrolls</button>
              <button class="btn-ghost" (click)="closeDuplicateModal()">Dismiss Discovery</button>
           </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .tip-visual-wrapper { width: 56px; height: 56px; border-radius: 16px; overflow: hidden; border: 2px solid white; box-shadow: var(--shadow-sm); }
    .tip-visual-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    
    .desc-cell-premium { color: #64748b; font-size: 0.9rem; font-weight: 500; font-style: italic; }
    
    .action-btn-group { display: flex; gap: 8px; }
    .mini-btn { width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .mini-btn.edit { background: #eff6ff; color: #1e40af; }
    .mini-btn.delete { background: #fef2f2; color: #991b1b; }
    .mini-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(59, 130, 246, 0.2); }
    
    .luxury-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.6rem; }
    .form-field label { font-family: var(--admin-font-display); font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
    
    .form-field input, .form-field select, .form-field textarea {
       padding: 14px 18px; border-radius: 16px; border: 1px solid var(--clr-border); 
       background: #f8fafc; font-weight: 500; transition: all 0.3s; font-size: 0.95rem;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
       outline: none; border-color: var(--clr-primary-light); background: white; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.1);
    }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .close-x { background: none; border: none; font-size: 2.2rem; color: #cbd5e1; cursor: pointer; line-height: 1; transition: color 0.2s; }
    .close-x:hover { color: #94a3b8; }
    
    .alert-panel { background: white; padding: 50px; border-radius: 40px; width: 460px; text-align: center; box-shadow: var(--shadow-xl); border: 1px solid var(--clr-border); animation: zoomIn 0.3s ease-out; }
    @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .alert-icon-main { font-size: 3.5rem; color: #1e3a8a; margin-bottom: 24px; }
    .alert-panel h3 { color: #1e3a8a; font-weight: 800; font-family: var(--admin-font-display); font-size: 1.8rem; margin: 0 0 12px; }
    .alert-group { display: flex; flex-direction: column; gap: 14px; margin-top: 36px; }
    
    .empty-state { text-align: center; padding: 100px; color: #cbd5e1; font-style: italic; font-size: 1.15rem; font-family: var(--admin-font-display); }
  `]
})
export class AdminCareTipsComponent implements OnInit {
  tips: CareTip[] = [];
  filteredTips: CareTip[] = [];
  showModal = false;
  isEditing = false;
  showDuplicateModal = false;
  duplicateTip: any = null;
  searchTerm = '';

  tipForm: any = { title: '', description: '', image: '', price: 0, details: '' };

  constructor(
    private careApi: CareTipsApiService,
    private adminApi: AdminApiService,
    private notify: NotificationService,
    private authApi: AuthApiService
  ) { }

  ngOnInit() { this.loadTips(); }

  loadTips() {
    this.careApi.list().subscribe(data => {
      this.tips = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredTips = this.tips.filter(t => (t.title || '').toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  openModal() {
    this.showModal = true;
    this.isEditing = false;
    this.tipForm = { title: '', description: '', image: '', price: 0, details: '' };
  }

  editTip(tip: any) {
    this.isEditing = true;
    this.tipForm = { ...tip };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  private token(): string {
    return localStorage.getItem('greenie.token') || '';
  }

  saveTip() {
    const token = this.token();
    if (!this.isEditing) {
      const newTitle = this.tipForm.title?.trim().toLowerCase();
      const existing = this.tips.find(t => t.title?.trim().toLowerCase() === newTitle);
      if (existing) { this.duplicateTip = existing; this.showDuplicateModal = true; return; }
    }

    if (this.isEditing) {
      this.adminApi.updateCareTip(token, this.tipForm._id, this.tipForm).subscribe({
        next: () => { this.loadTips(); this.closeModal(); this.notify.show('Wisdom refined.', 'success'); },
        error: () => this.notify.show('Error updating tip', 'error')
      });
    } else {
      this.adminApi.addCareTip(token, this.tipForm).subscribe({
        next: () => { this.loadTips(); this.closeModal(); this.notify.show('Wisdom enshrined.', 'success'); },
        error: () => this.notify.show('Error adding tip', 'error')
      });
    }
  }

  deleteTip(id: string | undefined) {
    if (!id || !confirm('Are you certain about removing this guidance?')) return;
    this.adminApi.deleteCareTip(this.token(), id).subscribe({
      next: () => { this.loadTips(); this.notify.show('Guidance archived.', 'success'); },
      error: () => this.notify.show('Error deleting tip', 'error')
    });
  }

  confirmEditDuplicate() { this.showDuplicateModal = false; this.editTip(this.duplicateTip); }
  closeDuplicateModal() { this.showDuplicateModal = false; this.duplicateTip = null; }
}
