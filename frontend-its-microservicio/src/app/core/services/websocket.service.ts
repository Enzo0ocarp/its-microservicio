// src/app/core/services/websocket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface StockUpdateMessage {
  type: 'STOCK_UPDATE';
  data: {
    productId: string;
    newStock: number;
    productName: string;
  };
}

export interface UserActivityMessage {
  type: 'USER_ACTIVITY';
  data: {
    userId: string;
    action: string;
    details: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private messagesSubject = new Subject<WebSocketMessage>();
  private destroy$ = new Subject<void>();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: any;

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();

  private readonly WS_URL = 'ws://localhost:3001'; // WebSocket server URL

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    // Auto-conectar cuando el usuario esté autenticado
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = this.authService.getToken();
      const url = `${this.WS_URL}?token=${token}`;
      
      this.socket = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connectionStatusSubject.next(false);
    this.reconnectAttempts = 0;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
      // Unirse a salas específicas
      this.joinRooms();
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
        this.messagesSubject.next(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionStatusSubject.next(false);
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.stopHeartbeat();
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'STOCK_UPDATE':
        this.handleStockUpdate(message as StockUpdateMessage);
        break;
      case 'USER_ACTIVITY':
        this.handleUserActivity(message as UserActivityMessage);
        break;
      case 'PONG':
        // Heartbeat response
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleStockUpdate(message: StockUpdateMessage): void {
    const { productId, newStock, productName } = message.data;
    
    if (newStock === 0) {
      this.notificationService.outOfStock(productName);
    } else if (newStock <= 5) {
      this.notificationService.lowStock(productName, newStock);
    }

    // Emitir evento para que los componentes puedan reaccionar
    // Se emite el mensaje completo que ya incluye timestamp
    this.messagesSubject.next(message as WebSocketMessage);
  }

  private handleUserActivity(message: UserActivityMessage): void {
    // Manejar actividad de usuarios (para admin)
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.username === 'admin') {
      const { userId, action, details } = message.data;
      
      if (action === 'NEW_PURCHASE') {
        this.notificationService.info(
          'Nueva compra',
          `Usuario ${details.username} realizó una compra por ${details.total}`,
          { duration: 6000 }
        );
      }
    }
  }

  private joinRooms(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Unirse a sala de usuario
    this.send({
      type: 'JOIN_ROOM',
      data: { room: `user_${user.userId}` }
    });

    // Si es admin, unirse a sala de administradores
    if (user.username === 'admin') {
      this.send({
        type: 'JOIN_ROOM',
        data: { room: 'admin' }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'PING', data: {} });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.notificationService.error(
        'Conexión perdida',
        'No se pudo reconectar al servidor. Recarga la página para intentar nuevamente.',
        {
          persistent: true,
          action: {
            label: 'Recargar',
            handler: () => window.location.reload()
          }
        }
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(message: Partial<WebSocketMessage>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        timestamp: Date.now(),
        ...message
      } as WebSocketMessage;
      
      this.socket.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Métodos de conveniencia para escuchar tipos específicos de mensajes
  onStockUpdates(): Observable<StockUpdateMessage> {
    return this.messages$.pipe(
      filter(message => message.type === 'STOCK_UPDATE'),
      map(message => message as StockUpdateMessage)
    );
  }

  onUserActivity(): Observable<UserActivityMessage> {
    return this.messages$.pipe(
      filter(message => message.type === 'USER_ACTIVITY'),
      map(message => message as UserActivityMessage)
    );
  }

  // Enviar actualizaciones de stock (para admin)
  notifyStockUpdate(productId: string, newStock: number, productName: string): void {
    this.send({
      type: 'STOCK_UPDATE',
      data: { productId, newStock, productName }
    });
  }

  // Notificar actividad de usuario
  notifyUserActivity(action: string, details: any): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.send({
        type: 'USER_ACTIVITY',
        data: {
          userId: user.userId,
          action,
          details
        }
      });
    }
  }}