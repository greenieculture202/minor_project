import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiBase } from './api.base';

export interface BlogPost {
    id: string; // Changed from number to string for MongoDB compatibility
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    date: string;
}

@Injectable({
    providedIn: 'root'
})
export class BlogService {
    private postsSubject = new BehaviorSubject<BlogPost[]>([]);
    posts$ = this.postsSubject.asObservable();

    constructor(private api: ApiBase) {
        this.load();
    }

    load() {
        this.api.get<any[]>('blogs').pipe(
            map(items => items.map(item => ({
                id: item._id,
                title: item.title,
                excerpt: item.excerpt,
                content: item.content,
                image: item.image,
                category: item.category,
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            })))
        ).subscribe({
            next: (posts) => this.postsSubject.next(posts),
            error: (err) => console.error('Error loading blogs from DB', err)
        });
    }

    getPosts(): Observable<BlogPost[]> {
        return this.posts$;
    }

    addPost(post: Partial<BlogPost>) {
        const token = localStorage.getItem('greenie.token');
        this.api.post<any>('blogs', post, token || '').subscribe({
            next: () => this.load(),
            error: (err) => console.error('Error adding blog', err)
        });
    }

    deletePost(id: string) {
        const token = localStorage.getItem('greenie.token');
        this.api.delete<any>(`blogs/${id}`, token || '').subscribe({
            next: () => this.load(),
            error: (err) => console.error('Error deleting blog', err)
        });
    }

    updatePost(updatedPost: BlogPost) {
        const token = localStorage.getItem('greenie.token');
        // Map id back to _id if necessary or just pass directly if the backend handles it
        this.api.put<any>(`blogs/${updatedPost.id}`, updatedPost, token || '').subscribe({
            next: () => this.load(),
            error: (err) => console.error('Error updating blog', err)
        });
    }
}
