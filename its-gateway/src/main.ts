// its-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('ITS Microservices Gateway API')
    .setDescription(`
      API Gateway para el sistema de microservicios ITS.
      
      **Funcionalidades principales:**
      - 🔐 Autenticación y autorización JWT
      - 👥 Gestión de usuarios
      - 📦 Catálogo de productos con control de stock
      - 🛒 Sistema de carrito de compras con reservas
      - 🧾 Gestión de facturas
      
      **Arquitectura:**
      Este gateway conecta con múltiples microservicios:
      - **Users Service**: Gestión de usuarios y carritos
      - **Products Service**: Catálogo y control de inventario
      - **Invoices Service**: Facturación y reportes
    `)
    .setVersion('1.0.0')
    .setContact(
      'Equipo ITS',
      'https://github.com/tu-usuario/its-microservicio',
      'contacto@its.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el JWT token',
        in: 'header',
      },
      'JWT-auth' // Este nombre se usa en los controladores
    )
    .addTag('Auth', 'Endpoints de autenticación y registro')
    .addTag('Products', 'Gestión del catálogo de productos')
    .addTag('Cart', 'Sistema de carrito de compras')
    .addTag('Invoices', 'Gestión de facturas y compras')
    .addServer(`http://localhost:${envs.port}`, 'Servidor de desarrollo')
    .addServer('https://api.its.com', 'Servidor de producción')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Configurar la ruta de Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ITS API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  await app.listen(envs.port);
  console.log(`🚀 Gateway listening on port ${envs.port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${envs.port}/api/docs`);
}
bootstrap();