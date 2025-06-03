import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { envs } from './config/envs';
import { GatewayClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './controllers/auth.controller';
import { ProductsController } from './controllers/products.controller';
import { InvoicesController } from './controllers/invoices.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // Módulo que registra y provee los ClientProxy
    GatewayClientsModule,
    // Autenticación JWT
    AuthModule,
  ],
  controllers: [AuthController, ProductsController, InvoicesController],
})
export class AppModule {}