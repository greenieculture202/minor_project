import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqService, FaqItem } from '../../../services/faq.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Knowledge Base & FAQs</h1>
          <p>Curate a repository of answers to empower your community and green enthusiasts.</p>
        </div>
        <div class="header-actions">
            <button class="btn-luxury-add" (click)="openAddForm()">
              <i class="fas fa-question-circle"></i> New Inquiry Path
            </button>
        </div>
      </div>

      <div class="panel" style="padding: 0; overflow: hidden; margin-top: 20px;">
        <table class="premium-table">
          <thead>
            <tr>
              <th style="width: 45%;">Inquiry & Explanation</th>
              <th>Category</th>
              <th>Last Synchronized</th>
              <th>Governance</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let faq of faqs$ | async">
              <td>
                <div class="faq-content-stack">
                  <strong class="faq-question">{{ faq.question }}</strong>
                  <div class="faq-answer-preview">{{ faq.answer }}</div>
                </div>
              </td>
              <td><span class="badge user">{{ faq.category }}</span></td>
              <td><small class="text-muted-premium">{{ faq.updatedAt }}</small></td>
              <td>
                <div class="action-btn-group">
                  <button class="mini-btn edit" (click)="editFaq(faq)" title="Refine Answer"><i class="fas fa-edit"></i></button>
                  <button class="mini-btn delete" (click)="deleteFaq(faq.id)" title="Archive Inquiry"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="(faqs$ | async)?.length === 0">
              <td colspan="4" class="empty-state">No inquiries found in the wisdom repository.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL: FAQ COMPOSER -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-dialog">
          <div class="modal-header">
            <h2><i class="fas fa-lightbulb"></i> {{ editingId ? 'Refine Knowledge Path' : 'Enshrine New Wisdom' }}</h2>
            <button class="close-x" (click)="closeForm()">&times;</button>
          </div>

          <form (ngSubmit)="onSubmit()" class="luxury-form">
            <div class="form-field">
              <label>The Core Inquiry (Question)</label>
              <input type="text" [(ngModel)]="currentFaq.question" name="question" required placeholder="e.g., What is the soul of a Monstera?">
            </div>
            
            <div class="form-field">
              <label>Knowledge Classification</label>
              <select [(ngModel)]="currentFaq.category" name="category">
                <option value="General">General Wisdom</option>
                <option value="Shipping">Botanical Logistics</option>
                <option value="Returns">Returns & Harmony</option>
                <option value="Care">Nurturing Guides</option>
                <option value="Payment">Financial Exchange</option>
              </select>
            </div>

            <div class="form-field">
              <label>The Detailed Enlightenment (Answer)</label>
              <textarea [(ngModel)]="currentFaq.answer" name="answer" required rows="5" placeholder="Unfold the detailed answer here..."></textarea>
            </div>
            
            <div class="form-actions">
               <button type="button" class="btn-ghost" (click)="closeForm()">Discard Enlightenment</button>
                <button type="submit" class="btn-luxury-add" style="font-size: 0.95rem; padding: 12px 24px;">
                  {{ editingId ? 'Update Knowledge' : 'Enshrine Wisdom' }}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .faq-content-stack { display: flex; flex-direction: column; gap: 6px; }
    .faq-question { font-size: 1rem; color: var(--clr-primary); font-weight: 700; font-family: var(--admin-font-display); }
    .faq-answer-preview { 
      font-size: 0.85rem; color: #64748b; font-weight: 500;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; 
    }
    
    .text-muted-premium { color: #94a3b8; font-weight: 600; font-family: var(--admin-font-display); }
    
    .action-btn-group { display: flex; gap: 8px; }
    .mini-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .mini-btn.edit { background: #eff6ff; color: #1e40af; }
    .mini-btn.delete { background: #fef2f2; color: #991b1b; }
    .mini-btn:hover { transform: translateY(-2px); filter: brightness(0.9); }
    
    .luxury-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.6rem; }
    .form-field label { font-family: var(--admin-font-display); font-size: 0.8rem; font-weight: 800; color: var(--clr-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
    
    .form-field input, .form-field select, .form-field textarea {
       padding: 14px 18px; border-radius: 14px; border: 1px solid var(--clr-border); 
       background: #f8fafc; font-weight: 500; transition: all 0.3s; font-size: 0.95rem;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
       outline: none; border-color: var(--clr-primary-light); background: white; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.1);
    }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .close-x { background: none; border: none; font-size: 2.22rem; color: #cbd5e1; cursor: pointer; line-height: 1; }
    .empty-state { text-align: center; padding: 100px; color: #94a3b8; font-style: italic; font-size: 1.1rem; }
  `]
})
export class AdminFaqComponent implements OnInit {
  faqs$!: Observable<FaqItem[]>;
  showForm = false;
  editingId: string | null = null;
  currentFaq: Partial<FaqItem> = {
    question: '',
    answer: '',
    category: 'General'
  };

  constructor(private faqService: FaqService) { }

  ngOnInit() { this.faqs$ = this.faqService.getFaqs(); }

  openAddForm() { this.resetForm(); this.showForm = true; }
  closeForm() { this.showForm = false; this.resetForm(); }

  onSubmit() {
    if (this.currentFaq.question && this.currentFaq.answer) {
      if (this.editingId) {
        this.faqService.updateFaq(this.editingId, this.currentFaq);
      } else {
        this.faqService.addFaq(this.currentFaq);
      }
      this.closeForm();
    }
  }

  editFaq(faq: FaqItem) {
    this.editingId = faq.id;
    this.currentFaq = { ...faq };
    this.showForm = true;
  }

  deleteFaq(id: string) {
    if (confirm('Are you certain about removing this enlightenment pathway?')) {
      this.faqService.deleteFaq(id);
    }
  }

  resetForm() {
    this.editingId = null;
    this.currentFaq = { question: '', answer: '', category: 'General' };
  }
}
