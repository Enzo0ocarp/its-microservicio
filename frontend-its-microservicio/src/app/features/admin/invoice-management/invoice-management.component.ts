// src/app/features/admin/invoice-management/invoice-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-invoice-management',
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
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Facturas</h1>
              <span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Total Facturas</p>
                <p class="text-2xl font-bold text-gray-900">{{ invoices.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Ventas Totales</p>
                <p class="text-2xl font-bold text-gray-900">\${{ getTotalSales() | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Productos Vendidos</p>
                <p class="text-2xl font-bold text-gray-900">{{ getTotalItems() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Promedio por Venta</p>
                <p class="text-2xl font-bold text-gray-900">\${{ getAverageSale() | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div *ngIf="successMessage" class="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-700">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
          {{ errorMessage }}
        </div>

        <!-- Invoices List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">Todas las Facturas</h2>
              <div class="text-sm text-gray-600">
                {{ invoices.length }} factura(s) registrada(s)
              </div>
            </div>
          </div>
          
          <div *ngIf="loading" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando facturas...</p>
          </div>

          <div *ngIf="!loading && invoices.length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-gray-600">No hay facturas registradas</p>
          </div>

          <div *ngIf="!loading && invoices.length > 0" class="divide-y divide-gray-200">
            <div *ngFor="let invoice of invoices" class="p-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      Factura #{{ invoice.id.substring(0, 8) }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ invoice.items.length }} producto(s) - 
                      Cliente: {{ invoice.userInfo?.username || 'Usuario desconocido' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ invoice.createdAt | date:'medium' }}
                    </p>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">
                    \${{ invoice.total | number:'1.2-2' }}
                  </p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completada
                  </span>
                </div>
              </div>
              
              <!-- Invoice Items -->
              <div class="mt-4 pl-16">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">Productos comprados:</h4>
                  <div class="space-y-2">
                    <div *ngFor="let item of invoice.items" class="flex justify-between items-center text-sm">
                      <span class="text-gray-600">
                        Producto {{ item.productId.substring(0, 8) }} x{{ item.quantity }}
                      </span>
                      <span class="font-medium text-gray-900">
                        \${{ (item.quantity * item.price) | number:'1.2-2' }}
                      </span>
                    </div>
                  </div>
                  <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span class="font-medium text-gray-900">Total:</span>
                    <span class="font-bold text-lg text-gray-900">
                      \${{ invoice.total | number:'1.2-2' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-4 pl-16 flex space-x-3">
                <button
                  (click)="viewInvoiceDetails(invoice)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver Detalles
                </button>
                <button
                  (click)="downloadInvoice(invoice)"
                  class="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Descargar PDF
                </button>
                <button
                  (click)="deleteInvoice(invoice)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class InvoiceManagementComponent implements OnInit {
  invoices: any[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.adminService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.errorMessage = 'Error al cargar las facturas';
        this.loading = false;
      }
    });
  }

  viewInvoiceDetails(invoice: any) {
    alert(`Detalles de la factura:\n\nID: ${invoice.id}\nCliente: ${invoice.userInfo?.username}\nTotal: ${invoice.total}\nFecha: ${new Date(invoice.createdAt).toLocaleDateString()}\nProductos: ${invoice.items.length}`);
  }

  downloadInvoice(invoice: any) {
    alert('Función de descarga en desarrollo');
  }

  deleteInvoice(invoice: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar la factura #${invoice.id.substring(0, 8)}?`)) {
      this.adminService.deleteInvoice(invoice.id).subscribe({
        next: (response) => {
          this.successMessage = 'Factura eliminada exitosamente';
          this.loadInvoices();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar la factura';
        }
      });
    }
  }

  getTotalSales(): number {
    return this.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }

  getTotalItems(): number {
    return this.invoices.reduce((sum, invoice) => 
      sum + invoice.items.reduce((itemSum: any, item: { quantity: any; }) => itemSum + item.quantity, 0), 0
    );
  }

  getAverageSale(): number {
    return this.invoices.length > 0 ? this.getTotalSales() / this.invoices.length : 0;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}