import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesProxyService } from '../clients/invoices-proxy.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesProxyService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: any, @Request() req) {
    // Solo el propio usuario puede crear sus facturas
    dto.userId = req.user.userId;
    return this.invoices.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req) {
    // Solo ADMINISTRADORES pueden ver todas las facturas
    if (req.user.username !== 'admin') {
      throw new ForbiddenException('Only administrators can view all invoices');
    }
    return this.invoices.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  findMyInvoices(@Request() req) {
    // Usuarios normales solo ven sus propias facturas
    const userId = req.user.userId;
    return this.invoices.findByUserId(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoices.findOne(id);
    
    // Solo el dueño de la factura o admin puede verla
    if (invoice.userId !== req.user.userId && req.user.username !== 'admin') {
      throw new ForbiddenException('You can only view your own invoices');
    }
    
    return invoice;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    const invoice = await this.invoices.findOne(id);
    
    // Solo el dueño puede modificar su factura
    if (invoice.userId !== req.user.userId) {
      throw new ForbiddenException('You can only modify your own invoices');
    }
    
    return this.invoices.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Solo ADMINISTRADORES pueden eliminar facturas
    if (req.user.username !== 'admin') {
      throw new ForbiddenException('Only administrators can delete invoices');
    }
    
    return this.invoices.remove(id);
  }
}