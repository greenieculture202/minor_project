import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../services/admin.api';
import { PlantsApiService } from '../../../services/plants.api';
import { NotificationService } from '../../../services/notification.service';
import { AuthApiService } from '../../../services/auth.api';

@Component({
  selector: 'app-admin-plants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Botanical Inventory</h1>
          <p>Curate your collection of premium plants and sustainable greenery.</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <div class="input-with-icon">
              <i class="fas fa-search"></i>
              <input type="text" [(ngModel)]="searchTerm" placeholder="Search specimens..." (input)="applyFilters()" class="search-input">
            </div>
            <select [(ngModel)]="filterCategory" (change)="applyFilters()" class="search-select">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>
          <button class="btn-luxury-add" (click)="openModal()">
            <i class="fas fa-plus"></i> Add New Plant
          </button>
        </div>
      </div>

      <!-- Plant List -->
      <div class="panel" style="padding: 0; overflow: hidden; margin-top: 20px;">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Imagery</th>
              <th>Specimen Identity</th>
              <th>Category</th>
              <th>Investment</th>
              <th>Status</th>
              <th>Management</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPlants">
              <td>
                <div class="plant-visual">
                  <img [src]="p.image" [alt]="p.name" (error)="p.image='assets/bg1.jpg'">
                </div>
              </td>
              <td>
                <div class="user-info">
                  <strong>{{ p.name }}</strong>
                  <small>REF: #GRN-{{ p._id?.substring(18) || 'LOC' }}</small>
                </div>
              </td>
              <td><span class="badge user">{{ p.category }}</span></td>
              <td>
                <div class="price-stack">
                  <div class="current-price">₹{{ p.discountPrice || p.price }}</div>
                  <div class="old-price" *ngIf="p.price > p.discountPrice">₹{{ p.price }}</div>
                </div>
              </td>
              <td>
                <span class="badge" [style.background]="p.price > 0 ? '#f0fdf4' : '#fee2e2'" [style.color]="p.price > 0 ? '#166534' : '#991b1b'">
                   {{ p.price > 0 ? 'Live' : 'Draft' }}
                </span>
              </td>
              <td>
                <div class="action-btn-group">
                  <button class="mini-btn edit" (click)="editPlant(p)" title="Refine"><i class="fas fa-edit"></i></button>
                  <button class="mini-btn delete" (click)="deletePlant(p._id)" title="Archive"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredPlants.length === 0">
              <td colspan="6" class="empty-state">No specimens matching your criteria were found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL: ADD/EDIT -->
      <div class="modal-overlay" *ngIf="showModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <h2><i class="fas fa-seedling"></i> {{ isEditing ? 'Edit Specimen' : 'Catalog New Plant' }}</h2>
            <button class="close-x" (click)="closeModal()">&times;</button>
          </div>
          
          <form (ngSubmit)="savePlant()" class="luxury-form">
            <div class="form-grid">
              <div class="form-field">
                <label>Plant Identity</label>
                <input [(ngModel)]="plantForm.name" name="name" required placeholder="Common or Scientific Name">
              </div>
              <div class="form-field">
                <label>Botanical Class</label>
                <select [(ngModel)]="plantForm.category" name="category" (change)="checkCategory($event)">
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                  <option value="NEW_CAT">+ Add New Class</option>
                </select>
              </div>
            </div>

            <!-- DYNAMIC CUSTOM CATEGORY INPUT -->
            <div class="form-field" *ngIf="showCustomCategory" style="margin-top: -10px;">
              <label style="color: #3b82f6;">Define New Botanical Class</label>
              <input [(ngModel)]="customCategory" name="customCategory" required placeholder="e.g. Succulent, Medicinal, Tropical" style="border-color: #3b82f6; background: #eff6ff;">
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>Valuation (₹)</label>
                <input type="number" [(ngModel)]="plantForm.price" name="price" required placeholder="0.00">
              </div>
              <div class="form-field">
                <label>Visual Path (URL)</label>
                <input [(ngModel)]="plantForm.image" name="image" placeholder="Image direct link">
              </div>
            </div>

            <div class="form-field">
              <label>Characteristics & Care</label>
              <textarea [(ngModel)]="plantForm.description" name="description" rows="3" placeholder="Briefly describe the plants persona..."></textarea>
            </div>
            
            <div class="form-actions">
               <button type="button" class="btn-ghost" (click)="closeModal()">Discard</button>
               <button type="submit" class="btn-luxury-add" style="font-size: 0.95rem; padding: 12px 24px;">
                 {{ isEditing ? 'Push Updates' : 'Catalog Identity' }}
               </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: DUPLICATE ALERT -->
      <div class="modal-overlay glass-overlay" *ngIf="showDuplicateModal">
        <div class="luxury-alert-panel">
           <div class="alert-glass-decoration"></div>
           <div class="alert-icon-wrapper">
             <i class="fas fa-clone"></i>
           </div>
           
           <h3 class="alert-title">Catalog Duplicate Found</h3>
           <p class="alert-description">
             "{{ duplicatePlant?.name }}" is already part of the collection. 
             Would you like to refine the existing entry or dismiss this discovery?
           </p>

           <div class="alert-action-stack">
              <button class="btn-luxury-add" style="width: 100%;" (click)="confirmEditDuplicate()">
                <i class="fas fa-pen-fancy"></i> Update Legacy Entry
              </button>
              <button class="btn-luxury-ghost" (click)="closeDuplicateModal()">
                Dismiss Discovery
              </button>
           </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .btn-luxury-add {
      background: #3b82f6; /* Solid Vibrant Blue */
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff !important;
      border: none;
      padding: 12px 32px;
      border-radius: 50px;
      font-weight: 800;
      font-size: 1rem;
      white-space: nowrap;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-family: var(--admin-font-display);
      box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
      min-width: 180px;
      opacity: 1 !important;
      visibility: visible !important;
      z-index: 10;
    }

    .btn-luxury-add:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5);
      filter: brightness(1.1);
    }
    
    .btn-luxury-add:active {
      transform: translateY(-1px) scale(0.98);
    }

    .btn-luxury-add i {
      font-size: 1.1rem;
      transition: transform 0.4s ease;
    }

    .btn-luxury-add:hover i {
      transform: rotate(90deg);
    }

    .plant-visual { width: 54px; height: 54px; border-radius: 14px; overflow: hidden; border: 2px solid white; box-shadow: var(--shadow-sm); transition: transform 0.3s; }
    .plant-visual:hover { transform: scale(1.1); box-shadow: var(--shadow-md); }
    .plant-visual img { width: 100%; height: 100%; object-fit: cover; }
    
    .price-stack { display: flex; flex-direction: column; }
    .current-price { font-weight: 800; color: var(--clr-primary); font-size: 1.05rem; }
    .old-price { font-size: 0.8rem; color: #94a3b8; text-decoration: line-through; opacity: 0.7; }
    
    .action-btn-group { display: flex; gap: 8px; }
    .mini-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .mini-btn.edit { background: #f0fdf4; color: #166534; }
    .mini-btn.delete { background: #fef2f2; color: #991b1b; }
    .mini-btn:hover { transform: translateY(-2px); filter: brightness(0.9); box-shadow: var(--shadow-sm); }
    
    .luxury-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field label { font-family: var(--admin-font-display); font-size: 0.8rem; font-weight: 800; color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
    
    .form-field input, .form-field select, .form-field textarea {
       padding: 14px 18px; border-radius: 14px; border: 1px solid var(--clr-border); 
       background: #f8fafc; font-weight: 500; transition: all 0.3s; font-size: 0.95rem;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
       outline: none; border-color: var(--clr-primary-light); background: white; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.1);
    }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
    .close-x { background: none; border: none; font-size: 2rem; color: #94a3b8; cursor: pointer; line-height: 1; }
    
    /* --- PREMIUM DUPLICATE ALERT --- */
    .glass-overlay { 
      backdrop-filter: blur(12px); 
      background: rgba(15, 23, 42, 0.4); 
      z-index: 2000;
    }

    .luxury-alert-panel {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      padding: 54px;
      border-radius: 40px;
      width: 520px;
      text-align: center;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.25);
      animation: alertScaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .alert-glass-decoration {
      position: absolute; top: -100px; right: -100px;
      width: 250px; height: 250px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    .alert-icon-wrapper {
      width: 84px; height: 84px;
      background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
      color: white; border-radius: 28px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 32px; font-size: 2.5rem;
      box-shadow: 0 15px 35px rgba(37, 99, 235, 0.3);
      transform: rotate(-5deg);
    }

    .alert-title {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: 1.85rem; font-weight: 800;
      color: #1e3a8a; margin: 0 0 16px;
      letter-spacing: -0.5px;
    }

    .alert-description {
      color: #64748b; font-size: 1.05rem; line-height: 1.6;
      margin-bottom: 40px;
    }

    .alert-action-stack { display: flex; flex-direction: column; gap: 14px; }

    .btn-luxury-primary {
      background: #064e3b; color: white; border: none;
      padding: 18px; border-radius: 18px; font-weight: 700;
      font-size: 1.05rem; cursor: pointer; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      box-shadow: 0 10px 20px rgba(6, 78, 59, 0.1);
    }

    .btn-luxury-primary:hover { 
      background: var(--clr-primary-dark); transform: translateY(-3px); 
      box-shadow: 0 15px 30px rgba(59, 130, 246, 0.2); 
    }

    .btn-luxury-ghost {
      background: #f1f5f9; color: #475569; border: none;
      padding: 16px; border-radius: 18px; font-weight: 600;
      font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
    }

    .btn-luxury-ghost:hover { background: #eff6ff; color: var(--clr-primary); }

    @keyframes alertScaleIn {
      from { transform: scale(0.95) translateY(20px); opacity: 0; filter: blur(10px); }
      to { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
    }
    .empty-state { text-align: center; padding: 80px; color: #94a3b8; font-style: italic; font-size: 1.1rem; }
  `]
})
export class AdminPlantsComponent implements OnInit {
  plants: any[] = [];
  filteredPlants: any[] = [];
  showModal = false;
  isEditing = false;
  showDuplicateModal = false;
  duplicatePlant: any = null;
  categories = ['Indoor Plant', 'Outdoor Plant', 'Flowering Plant', 'Trending Plant'];
  showCustomCategory = false;
  customCategory = '';
  searchTerm = '';
  filterCategory = '';

  plantForm: any = { name: '', category: '', price: 0, description: '', image: '' };
  Math = Math;

  constructor(
    private plantsApi: PlantsApiService,
    private adminApi: AdminApiService,
    private notify: NotificationService,
    private authApi: AuthApiService
  ) { }

  ngOnInit() { this.loadPlants(); }

  loadPlants() {
    this.plantsApi.list().subscribe(data => {
      this.plants = data;
      this.extractCategories();
      this.applyFilters();
    });
  }

  extractCategories() {
    const defaults = ['Indoor Plant', 'Outdoor Plant', 'Flowering Plant', 'Trending Plant'];
    const fromData = this.plants.map(p => p.category).filter(c => c && !defaults.includes(c));
    this.categories = [...defaults, ...Array.from(new Set(fromData))];
  }

  applyFilters() {
    this.filteredPlants = this.plants.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.filterCategory ? p.category === this.filterCategory : true;
      return matchesSearch && matchesCategory;
    });
  }

  openModal() {
    this.showModal = true;
    this.isEditing = false;
    this.showCustomCategory = false;
    this.customCategory = '';
    this.plantForm = { name: '', category: 'Indoor Plant', price: 0, description: '', image: '' };
  }

  editPlant(plant: any) {
    this.isEditing = true;
    this.plantForm = { ...plant };
    this.showCustomCategory = false;
    this.customCategory = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  checkCategory(event: any) {
    this.showCustomCategory = (event.target.value === 'NEW_CAT');
  }

  private token(): string {
    return localStorage.getItem('greenie.token') || '';
  }

  savePlant() {
    const token = this.token();
    
    // Process new category if active
    if (this.showCustomCategory && this.customCategory.trim()) {
      this.plantForm.category = this.customCategory.trim();
    }

    if (!this.isEditing) {
      const newName = this.plantForm.name?.trim().toLowerCase();
      const existing = this.plants.find(p => p.name?.trim().toLowerCase() === newName);
      if (existing) {
        this.duplicatePlant = existing;
        this.showDuplicateModal = true;
        return;
      }
    }

    const payload = { ...this.plantForm };
    delete payload.discountPrice;

    if (this.isEditing) {
      const id = this.plantForm._id;
      const updateData = { ...payload };
      delete updateData._id;

      this.adminApi.updatePlant(token, id, updateData).subscribe({
        next: () => { this.loadPlants(); this.closeModal(); this.notify.show('Specimen updated.', 'success'); },
        error: () => this.notify.show('Error updating plant', 'error')
      });
    } else {
      this.adminApi.addPlant(token, payload).subscribe({
        next: () => { this.loadPlants(); this.closeModal(); this.notify.show('Discovery logged.', 'success'); },
        error: () => this.notify.show('Error adding plant', 'error')
      });
    }
  }

  deletePlant(id: string) {
    if (!confirm('Are you certain?')) return;
    this.adminApi.deletePlant(this.token(), id).subscribe({
      next: () => { this.loadPlants(); this.notify.show('Plant removed.', 'success'); },
      error: () => this.notify.show('Error deleting plant', 'error')
    });
  }

  confirmEditDuplicate() { this.showDuplicateModal = false; this.editPlant(this.duplicatePlant); }
  closeDuplicateModal() { this.showDuplicateModal = false; this.duplicatePlant = null; }
}
