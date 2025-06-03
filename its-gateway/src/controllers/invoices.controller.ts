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
  import { InvoicesProxyService } from '../clients/invoices-proxy.service';
  
  @Controller('invoices')
  export class InvoicesController {
    constructor(private readonly invoices: InvoicesProxyService) {}
  
    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() dto: any) {
      return this.invoices.create(dto);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
      return this.invoices.findAll();
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.invoices.findOne(id);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any) {
      return this.invoices.update(id, dto);
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.invoices.remove(id);
    }
  }