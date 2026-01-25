import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
    @IsNumber()
    salesInvoiceId: number;

    @IsNumber()
    amount: number;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class DeliverSaleDto {
    @IsNumber()
    salesInvoiceId: number;
}
