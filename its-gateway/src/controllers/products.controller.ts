import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { ProductsProxyService } from '../clients/products-proxy.service';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsProxy: ProductsProxyService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() dto: any) {
      return this.productsProxy.create(dto);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
      return this.productsProxy.findAll();
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.productsProxy.findOne(id);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any) {
      return this.productsProxy.update(id, dto);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.productsProxy.remove(id);
    }
  }