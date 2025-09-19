// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Global Error Handler
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error caught by ErrorHandler:', error);
    
    // En producción, aquí enviarías el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    if (error?.rejection) {
      // Unhandled promise rejection
      console.error('Unhandled promise rejection:', error.rejection);
    }
    
    // No relanzar el error para evitar crashes de la aplicación
    // En desarrollo, puedes descomentar la siguiente línea:
    // throw error;
  }
}

// Loading Interceptor for global loading states
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Incrementar contador de requests activos
    this.activeRequests++;
    this.updateLoadingState();
    
    return next.handle(req).pipe(
      finalize(() => {
        // Decrementar contador cuando el request termine
        this.activeRequests--;
        this.updateLoadingState();
      })
    );
  }
  
  private updateLoadingState(): void {
    // Emitir evento personalizado para el estado de loading
    const isLoading = this.activeRequests > 0;
    window.dispatchEvent(new CustomEvent('globalLoading', { detail: { isLoading } }));
  }
}

// Cache Interceptor for optimized requests
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, { response: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo cachear requests GET que no sean sensibles
    if (req.method !== 'GET' || this.isSensitiveUrl(req.url)) {
      return next.handle(req);
    }
    
    const cachedResponse = this.getFromCache(req.url);
    if (cachedResponse) {
      // Retornar respuesta cacheada
      return new Observable(observer => {
        observer.next(cachedResponse);
        observer.complete();
      });
    }
    
    return next.handle(req).pipe(
      finalize(() => {
        // Guardar en cache si es exitoso
        // Implementación simplificada
      })
    );
  }
  
  private isSensitiveUrl(url: string): boolean {
    const sensitivePatterns = ['/auth', '/cart', '/checkout', '/profile'];
    return sensitivePatterns.some(pattern => url.includes(pattern));
  }
  
  private getFromCache(url: string): any {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }
    return null;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Router configuration
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // Preload all lazy-loaded routes
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([])
    ),
    
    // HTTP Interceptors (legacy style for complex interceptors)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    },
    
    // Global Error Handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    
    // Browser features
    importProvidersFrom(BrowserAnimationsModule),
    provideClientHydration(),
    
    // Environment-specific providers
    ...(getEnvironmentProviders())
  ]
};

// Environment-specific configuration
function getEnvironmentProviders() {
  const isProduction = window.location.hostname !== 'localhost';
  
  if (isProduction) {
    return [
      // Production-specific providers
      // Por ejemplo: Analytics, Error reporting, etc.
    ];
  } else {
    return [
      // Development-specific providers
      // Por ejemplo: Mock services, debugging tools, etc.
    ];
  }
}

// Application Constants
export const APP_CONFIG = {
  APP_NAME: 'E-Commerce Platform',
  VERSION: '2.0.0',
  API_BASE_URL: 'http://localhost:3000',
  WS_BASE_URL: 'ws://localhost:3001',
  
  // Feature flags
  FEATURES: {
    WEBSOCKETS: true,
    OFFLINE_SUPPORT: true,
    PUSH_NOTIFICATIONS: false,
    DARK_MODE: true,
    ANALYTICS: false
  },
  
  // UI Configuration
  UI: {
    ITEMS_PER_PAGE: 12,
    NOTIFICATION_DURATION: 5000,
    LOADING_DELAY: 300, // Delay before showing loading spinner
    DEBOUNCE_TIME: 300,
    ANIMATION_DURATION: 200
  },
  
  // Cache configuration
  CACHE: {
    PRODUCTS_TTL: 5 * 60 * 1000, // 5 minutes
    USER_DATA_TTL: 10 * 60 * 1000, // 10 minutes
    STATIC_DATA_TTL: 30 * 60 * 1000 // 30 minutes
  },
  
  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    MAX_CART_ITEMS: 50,
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
  },
  
  // External services
  EXTERNAL: {
    GOOGLE_ANALYTICS_ID: 'GA_MEASUREMENT_ID',
    SENTRY_DSN: 'SENTRY_DSN_URL',
    STRIPE_PUBLIC_KEY: 'STRIPE_PUBLIC_KEY'
  }
};

// Type definitions for configuration
export interface AppFeatures {
  WEBSOCKETS: boolean;
  OFFLINE_SUPPORT: boolean;
  PUSH_NOTIFICATIONS: boolean;
  DARK_MODE: boolean;
  ANALYTICS: boolean;
}

export interface UIConfig {
  ITEMS_PER_PAGE: number;
  NOTIFICATION_DURATION: number;
  LOADING_DELAY: number;
  DEBOUNCE_TIME: number;
  ANIMATION_DURATION: number;
}

// Utility function to get configuration
export function getConfig<T = any>(path: string): T {
  return path.split('.').reduce((obj, key) => obj?.[key], APP_CONFIG as any);
}

// Feature flag checker
export function isFeatureEnabled(feature: keyof AppFeatures): boolean {
  return APP_CONFIG.FEATURES[feature];
}