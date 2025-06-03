import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersProxyService } from '../clients/users-proxy.service';
import { ProductsProxyService } from '../clients/products-proxy.service';
import { InvoicesProxyService } from '../clients/invoices-proxy.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from '../dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly usersProxy: UsersProxyService,
    private readonly productsProxy: ProductsProxyService,
    private readonly invoicesProxy: InvoicesProxyService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    const userId = req.user.userId;

    // 1. Verificar que el producto existe
    try {
      await this.productsProxy.findOne(dto.productId);
    } catch (error) {
      throw new BadRequestException('Product not found');
    }

    // 2. Verificar stock disponible
    const stockCheck = await this.productsProxy.checkAvailableStock({
      productId: dto.productId,
      quantity: dto.quantity,
    });

    if (!stockCheck.canReserve) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockCheck.availableStock}, Requested: ${dto.quantity}`
      );
    }

    // 3. Crear reserva en Products MS
    const reservation = await this.productsProxy.createReservation({
      productId: dto.productId,
      userId,
      quantity: dto.quantity,
    });

    // 4. Agregar al carrito en Users MS
    return this.usersProxy.addToCart({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getCart(@Request() req) {
    const userId = req.user.userId;
    const cart = await this.usersProxy.getCart(userId);

    // Enriquecer con información de productos
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await this.productsProxy.findOne(item.productId);
          return {
            ...item,
            productName: product.name,
            productPrice: product.price,
            productDescription: product.description,
            subtotal: product.price * item.quantity,
          };
        } catch (error) {
          return {
            ...item,
            productName: 'Product not found',
            productPrice: 0,
            productDescription: null,
            subtotal: 0,
          };
        }
      })
    );

    const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      ...cart,
      items: enrichedItems,
      total,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('item')
  async updateCartItem(@Request() req, @Body() dto: UpdateCartItemDto) {
    const userId = req.user.userId;

    // Verificar stock disponible para la nueva cantidad
    const stockCheck = await this.productsProxy.checkAvailableStock({
      productId: dto.productId,
      quantity: dto.quantity,
    });

    if (!stockCheck.canReserve) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockCheck.availableStock}, Requested: ${dto.quantity}`
      );
    }

    return this.usersProxy.updateCartItem({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('item')
  async removeFromCart(@Request() req, @Body() dto: RemoveFromCartDto) {
    const userId = req.user.userId;

    // Cancelar reserva en Products MS
    const userReservations = await this.productsProxy.getUserReservations(userId);
    const reservation = userReservations.find(r => r.productId === dto.productId);
    
    if (reservation) {
      await this.productsProxy.cancelReservation(reservation.id);
    }

    return this.usersProxy.removeFromCart({
      userId,
      productId: dto.productId,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('clear')
  async clearCart(@Request() req) {
    const userId = req.user.userId;

    // Cancelar todas las reservas del usuario
    const userReservations = await this.productsProxy.getUserReservations(userId);
    await Promise.all(
      userReservations.map(reservation => 
        this.productsProxy.cancelReservation(reservation.id)
      )
    );

    return this.usersProxy.clearCart(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  async checkout(@Request() req) {
    const userId = req.user.userId;

    // 1. Obtener carrito
    const cart = await this.usersProxy.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Confirmar todas las reservas
    const userReservations = await this.productsProxy.getUserReservations(userId);
    await Promise.all(
      userReservations.map(reservation => 
        this.productsProxy.confirmReservation(reservation.id)
      )
    );

    // 3. Crear factura
    const invoiceItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productsProxy.findOne(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const invoice = await this.invoicesProxy.create({
      userId,
      items: invoiceItems,
    });

    // 4. Limpiar carrito
    await this.usersProxy.clearCart(userId);

    return {
      message: 'Purchase completed successfully',
      invoice,
    };
  }
}