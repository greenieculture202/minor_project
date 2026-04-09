import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiBase } from './api.base';

export interface FaqItem {
    id: string; // Changed from number to string for MongoDB compatibility
    question: string;
    answer: string;
    category?: string;
    updatedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class FaqService {
    private faqsSubject = new BehaviorSubject<FaqItem[]>([]);
    faqs$ = this.faqsSubject.asObservable();

    constructor(private api: ApiBase) {
        this.load();
    }

    load() {
        this.api.get<any[]>('faqs').pipe(
            map(items => items.map(item => ({
                id: item._id,
                question: item.question,
                answer: item.answer,
                category: item.category,
                updatedAt: new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            })))
        ).subscribe({
            next: (faqs) => this.faqsSubject.next(faqs),
            error: (err) => console.error('Error loading FAQs from DB', err)
        });
    }

    getFaqs(): Observable<FaqItem[]> {
        return this.faqs$;
    }

    addFaq(faq: Partial<FaqItem>) {
        const token = localStorage.getItem('greenie.token');
        this.api.post<any>('faqs', faq, token || '').subscribe({
            next: () => this.load(),
            error: (err) => console.error('Error adding FAQ', err)
        });
    }

    updateFaq(id: string, updates: Partial<FaqItem>) {
        const token = localStorage.getItem('greenie.token');
        this.api.put<any>(`faqs/${id}`, updates, token || '').subscribe({
            next: () => this.load(),
            error: (err) => console.error('Error updating FAQ', err)
        });
    }

    deleteFaq(id: string) {
        const token = localStorage.getItem('greenie.token');
        this.api.delete<any>(`faqs/${id}`, token || '').subscribe({
            next: () => this.load(),
            error: (err) => console.error('Error deleting FAQ', err)
        });
    }
}
