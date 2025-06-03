import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './controllers/auth.controller';
import { ProductsController } from './controllers/products.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { CartController } from './controllers/cart.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GatewayClientsModule,
    AuthModule,
  ],
  controllers: [
    AuthController, 
    ProductsController, 
    InvoicesController,
    CartController,
  ],
})
export class AppModule {}