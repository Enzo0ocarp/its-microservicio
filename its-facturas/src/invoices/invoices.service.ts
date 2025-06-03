import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const total = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const created = new this.invoiceModel({ ...dto, total });
    return created.save();
  }

  findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    // Clonamos dto para no tocar la instancia original
    const updateData: Partial<Invoice> = { ...dto };
  
    // Si vienen items, recalculamos total
    if (dto.items) {
      updateData.total = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
  
    const updated = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  
    if (!updated) throw new NotFoundException(`Invoice ${id} not found`);
    return updated;
  }
  
  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Invoice ${id} not found`);
  }
}