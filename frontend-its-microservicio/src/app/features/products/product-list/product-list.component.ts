// src/app/features/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <button (click)="goBack()" class="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button class="relative p-2 text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H2.6M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v2a1 1 0 001 1h1M17 21v-2a1 1 0 00-1-1h-4a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1z"></path>
                </svg>
                <span *ngIf="cartItems > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {{ cartItems }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Products Grid -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Cargando productos...</p>
        </div>

        <div *ngIf="!loading && products.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p class="text-gray-600">No hay productos disponibles</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let product of products" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <!-- Product Image Placeholder -->
            <div class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            
            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ product.description || 'Sin descripción' }}</p>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-gray-900">\${{ product.price | number:'1.2-2' }}</span>
                <span class="text-sm text-gray-500">Stock: {{ product.stock }}</span>
              </div>
              
              <button 
                (click)="addToCart(product)"
                [disabled]="product.stock === 0"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                <span *ngIf="product.stock > 0">Agregar al Carrito</span>
                <span *ngIf="product.stock === 0">Sin Stock</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  cartItems = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.cartService.cartItems$.subscribe(count => {
      this.cartItems = count;
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  addToCart(product: any) {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        console.log('Producto agregado al carrito');
        // Opcional: mostrar toast o notificación
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}