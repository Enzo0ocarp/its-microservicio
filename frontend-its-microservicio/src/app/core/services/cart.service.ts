// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart';
  private cartItemsSubject = new BehaviorSubject<number>(0);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartCount();
  }

  getCart(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(cart => {
        this.cartItemsSubject.next(cart.totalItems || 0);
      })
    );
  }

  addToCart(productId: string, quantity: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, { productId, quantity }).pipe(
      tap(() => this.loadCartCount())
    );
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/item`, { 
      body: { productId } 
    }).pipe(
      tap(() => this.loadCartCount())
    );
  }

  updateCartItem(productId: string, quantity: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/item`, { productId, quantity }).pipe(
      tap(() => this.loadCartCount())
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartItemsSubject.next(0))
    );
  }

  checkout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkout`, {}).pipe(
      tap(() => this.cartItemsSubject.next(0))
    );
  }

  private loadCartCount(): void {
    this.getCart().subscribe({
      next: (cart) => {
        // El tap ya maneja la actualización
      },
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }
}