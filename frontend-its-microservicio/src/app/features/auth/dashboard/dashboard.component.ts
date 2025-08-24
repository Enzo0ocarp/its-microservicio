// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3"></div>
              <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Hola, {{ currentUser?.username || 'Usuario' }}</span>
              <button 
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Total Productos</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Mis Facturas</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.totalInvoices }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Total Gastado</p>
                <p class="text-2xl font-bold text-gray-900">\${{ stats.totalSpent | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Ver Productos</p>
                <p class="text-sm text-gray-600">Explorar catálogo</p>
              </div>
            </button>

            <button class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H2.6M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v2a1 1 0 001 1h1M17 21v-2a1 1 0 00-1-1h-4a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1z"></path>
              </svg>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Mi Carrito</p>
                <p class="text-sm text-gray-600">Revisar compras</p>
              </div>
            </button>

            <button class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <svg class="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Mis Facturas</p>
                <p class="text-sm text-gray-600">Historial compras</p>
              </div>
            </button>

            <button class="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <svg class="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Configuración</p>
                <p class="text-sm text-gray-600">Ajustes cuenta</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          </div>
          <div class="p-6">
            <div *ngIf="recentInvoices.length === 0" class="text-center py-8">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-gray-500">No hay facturas recientes</p>
            </div>
            
            <div *ngFor="let invoice of recentInvoices" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p class="font-medium text-gray-900">Factura #{{ invoice.id.substring(0, 8) }}</p>
                <p class="text-sm text-gray-600">{{ invoice.items.length }} productos</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">\${{ invoice.total | number:'1.2-2' }}</p>
                <p class="text-sm text-gray-500">{{ invoice.createdAt | date:'short' }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  stats = {
    totalProducts: 0,
    totalInvoices: 0,
    totalSpent: 0
  };
  recentInvoices: any[] = [];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Cargar productos
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
      },
      error: (error) => console.error('Error loading products:', error)
    });

    // Cargar mis facturas
    this.invoiceService.getMyInvoices().subscribe({
      next: (invoices) => {
        this.stats.totalInvoices = invoices.length;
        this.stats.totalSpent = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        this.recentInvoices = invoices.slice(0, 5); // Las últimas 5
      },
      error: (error) => console.error('Error loading invoices:', error)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}