import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPost } from '../../../services/blog.service';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="main-container">
      <div class="page-header">
        <div class="header-text">
          <h1>Editorial Management</h1>
          <p>Compose and curate inspiring botanical narratives for your readers.</p>
        </div>
        <div class="header-actions">
           <button class="btn-luxury-add" (click)="openForm()">
             <i class="fas fa-pen-nib"></i> Compose Story
           </button>
        </div>
      </div>

      <div class="panel" style="padding: 0; overflow: hidden; margin-top: 20px;">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Article Banner</th>
              <th>Story Title & resonance</th>
              <th>Category</th>
              <th>Publish Date</th>
              <th>Management</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let post of posts">
              <td>
                <div class="article-img-wrapper">
                  <img [src]="post.image || 'assets/bg1.jpg'" [alt]="post.title" (error)="post.image='assets/bg1.jpg'">
                </div>
              </td>
              <td>
                 <div class="user-info">
                    <strong>{{ post.title }}</strong>
                    <small>{{ post.excerpt | slice:0:40 }}...</small>
                 </div>
              </td>
              <td><span class="badge user">{{ post.category }}</span></td>
              <td><span class="date-badge">{{ post.date }}</span></td>
              <td>
                <div class="action-btn-group">
                  <button class="mini-btn edit" (click)="editPost(post)" title="Refine Story"><i class="fas fa-edit"></i></button>
                  <button class="mini-btn delete" (click)="deletePost(post.id!)" title="Archive Story"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="posts.length === 0">
              <td colspan="5" class="empty-state">No editorial drafts found in the archives.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL: COMPOSE/EDIT -->
      <div class="modal-overlay" *ngIf="showForm">
        <div class="modal-dialog">
          <div class="modal-header">
            <h2><i class="fas fa-newspaper"></i> {{ newPost.id ? 'Refine Botanical Story' : 'New Editorial Draft' }}</h2>
            <button class="close-x" (click)="showForm = false">&times;</button>
          </div>
          
          <form (ngSubmit)="savePost($event)" class="luxury-form">
            <div class="form-grid">
              <div class="form-field">
                <label>Story Headline</label>
                <input [(ngModel)]="newPost.title" name="title" required placeholder="Catchy title...">
              </div>
              <div class="form-field">
                <label>Editorial Category</label>
                <select [(ngModel)]="newPost.category" name="category">
                  <option value="Guide">Guide</option>
                  <option value="Health">Health</option>
                  <option value="Design">Design</option>
                  <option value="Style">Style</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Hero Image URL</label>
              <input [(ngModel)]="newPost.image" name="image" placeholder="Vivid banner photo link">
            </div>

            <div class="form-field">
              <label>Abstract / Excerpt</label>
              <input [(ngModel)]="newPost.excerpt" name="excerpt" placeholder="Short hook for readers...">
            </div>

            <div class="form-field">
              <label>Story Content</label>
              <textarea [(ngModel)]="newPost.content" name="content" rows="6" placeholder="Unfold the narrative here..."></textarea>
            </div>
            
            <div class="form-actions">
               <button type="button" class="btn-ghost" (click)="showForm = false">Discard Draft</button>
               <button type="submit" class="btn-luxury-add" style="font-size: 0.95rem; padding: 12px 24px;">
                 {{ newPost.id ? 'Publish Updates' : 'Publish Story' }}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../admin-shared.css'],
  styles: [`
    .article-img-wrapper { width: 64px; height: 44px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .article-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    
    .date-badge { color: #64748b; font-size: 0.85rem; font-weight: 600; font-family: var(--admin-font-display); }
    
    .action-btn-group { display: flex; gap: 8px; }
    .mini-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .mini-btn.edit { background: #eff6ff; color: #1e40af; }
    .mini-btn.delete { background: #fef2f2; color: #991b1b; }
    .mini-btn:hover { transform: translateY(-2px); filter: brightness(0.9); }
    
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
    .close-x { background: none; border: none; font-size: 2rem; color: #cbd5e1; cursor: pointer; line-height: 1; }
    .empty-state { text-align: center; padding: 80px; color: #94a3b8; font-style: italic; font-size: 1.1rem; }
  `]
})
export class AdminBlogComponent implements OnInit {
  posts: BlogPost[] = [];
  showForm = false;

  newPost: Partial<BlogPost> = {
    title: '',
    category: 'Guide',
    image: '',
    excerpt: '',
    content: ''
  };

  constructor(private blogService: BlogService) { }

  ngOnInit() {
    this.blogService.posts$.subscribe(p => this.posts = p);
  }

  savePost(event: Event) {
    event.preventDefault();
    if (!this.newPost.title) return;

    if (this.newPost.id) {
      this.blogService.updatePost(this.newPost as BlogPost);
    } else {
      this.blogService.addPost(this.newPost);
    }

    this.showForm = false;
    this.resetForm();
  }

  openForm() {
    this.resetForm();
    this.showForm = true;
  }

  editPost(post: BlogPost) {
    this.newPost = { ...post };
    this.showForm = true;
  }

  deletePost(id: string) {
    if (confirm('Are you certain you want to archive this editorial story?')) {
      this.blogService.deletePost(id);
    }
  }

  resetForm() {
    this.newPost = {
      title: '',
      category: 'Guide',
      image: '',
      excerpt: '',
      content: ''
    };
    delete this.newPost.id;
  }
}
