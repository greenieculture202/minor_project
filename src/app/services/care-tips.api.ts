import { Injectable } from '@angular/core';
import { ApiBase } from './api.base';
import { Observable } from 'rxjs';

export interface CareTip {
    _id?: string;
    title: string;
    category: string;
    description: string;
    image: string;
    createdAt?: string;
    price?: number;
    details?: string;
}

@Injectable({ providedIn: 'root' })
export class CareTipsApiService {
    constructor(private api: ApiBase) { }

    list(): Observable<CareTip[]> {
        return this.api.get<CareTip[]>('care-tips');
    }
}

