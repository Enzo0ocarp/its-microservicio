import 'reflect-metadata';
import {
    IsString,
    IsNotEmpty,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateInvoiceItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;
  
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    quantity: number;
  
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;
  }
  
  export class CreateInvoiceDto {
    @IsString()
    @IsNotEmpty()
    userId: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
  }