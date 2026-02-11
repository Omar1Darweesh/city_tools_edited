import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSaleDto } from './dto/sales.dto';
import {
  MovementType,
  PaymentStatus,
  Prisma,
  PaymentMethod,
} from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async createSale(createSaleDto: CreateSaleDto, userId: number) {
    const {
      branchId,
      customerId,
      lines,
      paymentMethod,
      totalDiscount = 0,
      stockLocationId,
      notes,
      channel,
      platformCommission = 0,
      shippingFee = 0,
      paidAmount, // ✅ NEW: Amount customer paid now
      delivered = false, // ✅ NEW: Whether to deliver immediately
    } = createSaleDto;

    // Find default stock location if not provided
    let locationId = stockLocationId;
    if (!locationId) {
      const defaultLocation = await this.prisma.stockLocation.findFirst({
        where: { branchId, active: true },
      });
      if (!defaultLocation) {
        throw new BadRequestException(
          'No active stock location found for this branch',
        );
      }
      locationId = defaultLocation.id;
    }

    // FIXED CALCULATION LOGIC
    let rawSubtotal = 0;
    const enrichedLines: any[] = [];

    // Step 1: Calculate raw subtotal and validate products
    const productIds = lines.map((l) => l.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const line of lines) {
      const product = productMap.get(line.productId);

      if (!product) {
        throw new NotFoundException(`Product ${line.productId} not found`);
      }

      if (!product.active) {
        throw new BadRequestException(`Product ${product.nameEn} is inactive`);
      }

      const lineSubtotal = line.qty * line.unitPrice;
      rawSubtotal += lineSubtotal;

      enrichedLines.push({
        ...line,
        lineDiscount: line.lineDiscount || 0,
        taxRate: line.taxRate || 0,
      });
    }

    // Step 2: Apply global discount
    const subtotalAfterDiscount = rawSubtotal - totalDiscount;

    // Step 3: Calculate tax proportionally
    let totalTax = 0;
    for (const line of enrichedLines) {
      const lineRawSubtotal = line.qty * line.unitPrice;
      const lineDiscountAmount =
        (lineRawSubtotal / rawSubtotal) * totalDiscount;
      const lineSubtotalAfterDiscount = lineRawSubtotal - lineDiscountAmount;
      const lineTax = (lineSubtotalAfterDiscount * line.taxRate) / 100;
      totalTax += lineTax;
      line.lineTotal = lineSubtotalAfterDiscount + lineTax;
    }

    // Step 4: Calculate final total
    const total = subtotalAfterDiscount + totalTax + shippingFee;

    // Step 5: Calculate Profit
    let costOfGoods = 0;
    for (const line of enrichedLines) {
      const product = productMap.get(line.productId);
      // product is guaranteed to exist here due to earlier validation (unless deleted mid-request, which we assume transactional integrity or don't care for read)

      if (product && product.costAvg) {
        costOfGoods += Number(product.costAvg) * line.qty;
      }
    }

    // CORRECTED PROFIT CALCULATION
    // Customer pays: (Subtotal - Discount) + Tax + Shipping = Total
    const customerPayment = total;

    // Net Profit = Revenue - ALL COSTS (including tax & shipping)
    // Revenue = Subtotal after discount (what you actually earned from selling)
    const revenue = subtotalAfterDiscount;

    // All costs
    const totalCosts =
      costOfGoods + platformCommission + totalTax + shippingFee;

    // Net Profit
    const netProfit = revenue - totalCosts;

    // Gross Profit (before commission, tax, shipping)
    const grossProfit = revenue - costOfGoods;

    // Profit Margin = (Net Profit / Revenue) × 100
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    console.log('💰 Profit Calculation:');
    console.log(`Customer Paid (Total): ${customerPayment.toFixed(2)}`);
    console.log(`Revenue (Subtotal after discount): ${revenue.toFixed(2)}`);
    console.log(`Cost of Goods: -${costOfGoods.toFixed(2)}`);
    console.log(`Platform Commission: -${platformCommission.toFixed(2)}`);
    console.log(`Tax: -${totalTax.toFixed(2)}`);
    console.log(`Shipping Fee: -${shippingFee.toFixed(2)}`);
    console.log(`Total Costs: -${totalCosts.toFixed(2)}`);
    console.log(`Gross Profit: ${grossProfit.toFixed(2)}`);
    console.log(`Net Profit: ${netProfit.toFixed(2)}`);
    console.log(`Profit Margin: ${profitMargin.toFixed(2)}%`);
    console.log(
      ' ^ Calculated as: (' +
        netProfit.toFixed(2) +
        ' / ' +
        customerPayment.toFixed(2) +
        ') × 100',
    );

    // ✅ NEW: Determine payment status
    let paymentStatus: PaymentStatus;
    let actualPaidAmount = paidAmount ?? total; // If not specified, assume full payment
    let remainingAmount = total - actualPaidAmount;

    if (actualPaidAmount >= total) {
      paymentStatus = PaymentStatus.PAID;
      actualPaidAmount = total;
      remainingAmount = 0;
    } else if (actualPaidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    } else {
      paymentStatus = PaymentStatus.UNPAID;
      actualPaidAmount = 0;
      remainingAmount = total;
    }

    // Generate invoice number
    const invoiceNo = await this.generateInvoiceNo(branchId);

    // Create sale in transaction
    return this.prisma.$transaction(async (tx) => {
      // Create sales invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          invoiceNo,
          branchId,
          customerId,
          subtotal: new Prisma.Decimal(rawSubtotal),
          total: new Prisma.Decimal(total),
          totalTax: new Prisma.Decimal(totalTax),
          totalDiscount: new Prisma.Decimal(totalDiscount),

          // ✅ NEW: Payment tracking
          paymentStatus,
          paidAmount: new Prisma.Decimal(actualPaidAmount),
          remainingAmount: new Prisma.Decimal(remainingAmount),

          // ✅ NEW: Delivery tracking
          delivered,
          deliveryDate: delivered ? new Date() : null,

          paymentMethod,
          notes,
          createdBy: userId,
          lines: {
            create: enrichedLines.map((line) => ({
              productId: line.productId,
              qty: line.qty,
              unitPrice: new Prisma.Decimal(line.unitPrice),
              lineDiscount: new Prisma.Decimal(line.lineDiscount),
              taxRate: new Prisma.Decimal(line.taxRate),
              lineTotal: new Prisma.Decimal(line.lineTotal),
              priceType: line.priceType || null, // ADD THIS LINE
            })),
          },
          channel,
          platformCommission: new Prisma.Decimal(platformCommission),
          shippingFee: new Prisma.Decimal(shippingFee),
          // ✅ NEW: Add profit and return fields
          costOfGoods: new Prisma.Decimal(costOfGoods),
          grossProfit: new Prisma.Decimal(grossProfit),
          netProfit: new Prisma.Decimal(netProfit),
          profitMargin: new Prisma.Decimal(profitMargin),
          totalRefunded: new Prisma.Decimal(0),
          netRevenue: new Prisma.Decimal(total),
        },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
        },
      });

      // ✅ NEW: Create initial payment record if amount paid
      if (actualPaidAmount > 0) {
        await tx.payment.create({
          data: {
            salesInvoiceId: invoice.id,
            amount: new Prisma.Decimal(actualPaidAmount),
            paymentMethod,
            notes: 'Initial payment',
            createdBy: userId,
          },
        });
      }

      // ✅ MODIFIED: Only deduct stock if delivered
      if (delivered && enrichedLines.length > 0) {
        await tx.stockMovement.createMany({
          data: enrichedLines.map((line) => ({
            productId: line.productId,
            stockLocationId: locationId,
            qtyChange: -line.qty,
            movementType: MovementType.SALE,
            refTable: 'sales_invoices',
            refId: invoice.id,
            createdBy: userId,
          })),
        });
      }

      return invoice;
    });
  }

  // NEW: Add additional payment UPDATED: Add additional payment and auto-deliver if paid in full
  async addPayment(
    salesInvoiceId: number,
    amount: number,
    paymentMethod: PaymentMethod,
    userId: number,
    notes?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 🔒 Lock the invoice row to prevent race conditions
      const invoices = await tx.$queryRaw<any[]>`
  SELECT * FROM "salesinvoices" 
  WHERE id = ${salesInvoiceId}
  FOR UPDATE
`;

      if (!invoices || invoices.length === 0) {
        throw new NotFoundException('Invoice not found');
      }

      const invoice = invoices[0];

      // Load lines separately (already inside transaction)
      const lines = await tx.salesLine.findMany({
        where: { salesInvoiceId },
      });

      invoice.lines = lines;

      // 🐛 Debug logging
      console.log('🔍 Payment Debug:', {
        invoiceId: salesInvoiceId,
        paidamount: invoice.paidamount,
        paidamountType: typeof invoice.paidamount,
        total: invoice.total,
        totalType: typeof invoice.total,
        paymentAmount: amount,
        paymentstatus: invoice.paymentstatus,
      });

      if (invoice.paymentstatus === PaymentStatus.PAID) {
        throw new BadRequestException('Invoice already fully paid');
      }

      // ✅ Safe number conversion with defaults
      // PostgreSQL raw queries return Decimals as strings!
      const currentPaid = parseFloat(invoice.paidamount) || 0;
      const totalAmount = parseFloat(invoice.total) || 0;
      const paymentAmount = Number(amount) || 0;

      console.log('🔢 Calculated values:', {
        currentPaid,
        totalAmount,
        paymentAmount,
        isCurrentPaidNaN: isNaN(currentPaid),
        isTotalNaN: isNaN(totalAmount),
        isPaymentNaN: isNaN(paymentAmount),
      });

      if (isNaN(currentPaid) || isNaN(totalAmount) || isNaN(paymentAmount)) {
        throw new BadRequestException(
          `Invalid payment data: paid=${currentPaid}, total=${totalAmount}, amount=${paymentAmount}`,
        );
      }

      const newPaidAmount = currentPaid + paymentAmount;
      const newRemainingAmount = totalAmount - newPaidAmount;

      if (newPaidAmount > totalAmount) {
        throw new BadRequestException(
          'Payment amount exceeds remaining balance',
        );
      }

      const newPaymentStatus =
        newRemainingAmount <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

      // Update invoice
      const updatedInvoice = await tx.salesInvoice.update({
        where: { id: salesInvoiceId },
        data: {
          paidAmount: new Prisma.Decimal(newPaidAmount),
          remainingAmount: new Prisma.Decimal(Math.max(0, newRemainingAmount)),
          paymentStatus: newPaymentStatus,
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          salesInvoiceId,
          amount: new Prisma.Decimal(amount),
          paymentMethod,
          notes,
          createdBy: userId,
        },
      });

      // NEW: Auto-deliver if fully paid and not yet delivered
      if (newPaymentStatus === PaymentStatus.PAID && !invoice.delivered) {
        // Find stock location
        const stockLocation = await tx.stockLocation.findFirst({
          where: {
            branchId: invoice.branchid, // ✅ Fixed: lowercase column name
            active: true,
          },
        });

        if (stockLocation) {
          // Deduct stock
          if (lines.length > 0) {
            await tx.stockMovement.createMany({
              data: lines.map((line) => ({
                productId: line.productId,
                stockLocationId: stockLocation.id,
                qtyChange: -line.qty,
                movementType: MovementType.SALE,
                refTable: 'sales_invoices', // Standardized to sales_invoices
                refId: invoice.id,
                createdBy: userId,
              })),
            });
          }

          // Mark as delivered
          await tx.salesInvoice.update({
            where: { id: salesInvoiceId },
            data: {
              delivered: true,
              deliveryDate: new Date(),
            },
          });
        }
      }

      return { invoice: updatedInvoice, payment };
    });
  }

  // ✅ NEW: Deliver products (after full payment)
  async deliverSale(salesInvoiceId: number, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.salesInvoice.findUnique({
        where: { id: salesInvoiceId },
        include: { lines: true },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (invoice.delivered) {
        throw new BadRequestException('Products already delivered');
      }

      if (invoice.paymentStatus !== PaymentStatus.PAID) {
        throw new BadRequestException('Cannot deliver - payment not complete');
      }

      // Find stock location
      const stockLocation = await tx.stockLocation.findFirst({
        where: { branchId: invoice.branchId, active: true },
      });

      if (!stockLocation) {
        throw new BadRequestException('No active stock location found');
      }

      // Deduct stock
      if (invoice.lines.length > 0) {
        await tx.stockMovement.createMany({
          data: invoice.lines.map((line) => ({
            productId: line.productId,
            stockLocationId: stockLocation.id,
            qtyChange: -line.qty,
            movementType: MovementType.SALE,
            refTable: 'sales_invoices',
            refId: invoice.id,
            createdBy: userId,
          })),
        });
      }

      // Mark as delivered
      return tx.salesInvoice.update({
        where: { id: salesInvoiceId },
        data: {
          delivered: true,
          deliveryDate: new Date(),
        },
      });
    });
  }

  // ✅ NEW: Get customer pending payments
  async getCustomerPendingPayments(customerId: number) {
    const invoices = await this.prisma.salesInvoice.findMany({
      where: {
        customerId,
        paymentStatus: {
          in: [PaymentStatus.PARTIAL, PaymentStatus.UNPAID],
        },
      },
      include: {
        payments: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
          orderBy: { paymentDate: 'desc' },
        },
        branch: {
          select: { name: true },
        },
        lines: {
          include: {
            product: {
              select: {
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((inv) => ({
      ...inv,
      total: Number(inv.total),
      paidAmount: Number(inv.paidAmount),
      remainingAmount: Number(inv.remainingAmount),
      payments: inv.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
      lines: inv.lines.map((line) => ({
        ...line,
        unitPrice: Number(line.unitPrice),
        lineTotal: Number(line.lineTotal),
        productName:
          line.product?.nameEn || line.product?.nameAr || 'منتج غير معروف',
      })),
    }));
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    branchId?: number;
    customerId?: number;
    userId?: number; // ✅ NEW
    channel?: string; // ✅ NEW
    search?: string;
    paymentMethod?: string;
    dateFilter?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      skip,
      take,
      branchId,
      customerId,
      userId, // ✅ NEW
      channel, // ✅ NEW
      search,
      paymentMethod,
      dateFilter,
      startDate,
      endDate,
    } = params;

    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;

    // ✅ NEW: User filter
    if (userId) where.createdBy = userId;

    // ✅ NEW: Channel filter
    if (channel) where.channel = channel;

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod;
    }

    // Date filter logic
    if (dateFilter || (startDate && endDate)) {
      let start: Date | undefined;
      let end: Date | undefined;
      const now = new Date();

      switch (dateFilter) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          start = new Date(yesterday.setHours(0, 0, 0, 0));
          end = new Date(yesterday.setHours(23, 59, 59, 999));
          break;
        case 'thisWeek':
          const weekStart = new Date();
          const dayOfWeek = weekStart.getDay();
          weekStart.setDate(weekStart.getDate() - dayOfWeek);
          start = new Date(weekStart.setHours(0, 0, 0, 0));
          end = new Date();
          end.setHours(23, 59, 59, 999);
          break;
        case 'thisMonth':
          const monthStart = new Date();
          start = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            1,
            0,
            0,
            0,
            0,
          );
          end = new Date();
          end.setHours(23, 59, 59, 999);
          break;
        case 'custom':
          if (startDate && endDate) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
          }
          break;
      }

      if (start && end) {
        where.createdAt = {
          gte: start,
          lte: end,
        };
      }
    }

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.salesInvoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.salesInvoice.count({ where }),
    ]);

    // ✅ Fetch platform names for channels
    const platformCodes = [
      ...new Set(items.map((sale) => sale.channel).filter(Boolean)),
    ];
    const platformMap = new Map<string, string>();

    if (platformCodes.length > 0) {
      const platforms = await this.prisma.platformSettings.findMany({
        where: {
          platform: { in: platformCodes as string[] },
        },
        select: {
          platform: true,
          name: true,
        },
      });
      platforms.forEach((p) => {
        platformMap.set(p.platform, p.name || p.platform);
      });
    }

    const itemsWithNumbers = items.map((sale) => ({
      ...sale,
      // ✅ Add platform name
      channelName: sale.channel
        ? platformMap.get(sale.channel) || sale.channel
        : null,
      subtotal: Number(sale.subtotal),
      total: Number(sale.total),
      totalTax: Number(sale.totalTax),
      totalDiscount: Number(sale.totalDiscount),
      platformCommission: Number(sale.platformCommission),
      shippingFee: Number(sale.shippingFee),
      paidAmount: Number(sale.paidAmount),
      remainingAmount: Number(sale.remainingAmount),

      // ADD THESE:
      totalRefunded:
        sale.totalRefunded !== null && sale.totalRefunded !== undefined
          ? Number(sale.totalRefunded)
          : 0,
      netRevenue:
        sale.netRevenue !== null && sale.netRevenue !== undefined
          ? Number(sale.netRevenue)
          : Number(sale.total),

      // FIX PROFIT FIELDS - Check for null/undefined properly:
      costOfGoods:
        sale.costOfGoods !== null && sale.costOfGoods !== undefined
          ? Number(sale.costOfGoods)
          : undefined,
      grossProfit:
        sale.grossProfit !== null && sale.grossProfit !== undefined
          ? Number(sale.grossProfit)
          : undefined,
      netProfit:
        sale.netProfit !== null && sale.netProfit !== undefined
          ? Number(sale.netProfit)
          : undefined,
      profitMargin:
        sale.profitMargin !== null && sale.profitMargin !== undefined
          ? Number(sale.profitMargin)
          : undefined,
    }));

    return {
      data: itemsWithNumbers,
      total,
    };
  }

  // ✅ NEW: Get all customers
  async getAllCustomers() {
    const customers = await this.prisma.customer.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: { name: 'asc' },
    });

    return customers;
  }

  // ✅ NEW: Get unique channels from database
  async getUniqueChannels() {
    const channels = await this.prisma.salesInvoice.findMany({
      where: {
        channel: {
          not: null,
        },
      },
      select: {
        channel: true,
      },
      distinct: ['channel'],
    });

    // Extract unique channel values
    const uniqueChannels = channels
      .map((sale) => sale.channel)
      .filter((channel) => channel !== null && channel !== '');

    return uniqueChannels;
  }

  async findOne(id: number) {
    const invoice = await this.prisma.salesInvoice.findUnique({
      where: { id },
      include: {
        branch: {
          select: { name: true },
        },
        customer: {
          select: { name: true, type: true },
        },
        user: {
          select: { id: true, username: true, fullName: true },
        },
        lines: {
          include: {
            product: {
              select: {
                nameAr: true,
                nameEn: true,
                barcode: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Fetch platform name if channel exists
    let channelName = invoice.channel;
    if (invoice.channel) {
      const platform = await this.prisma.platformSettings.findUnique({
        where: { platform: invoice.channel },
        select: { name: true },
      });
      if (platform?.name) {
        channelName = platform.name;
      }
    }

    // ✅ Convert Decimal to number
    return {
      ...invoice,
      channelName,
      subtotal: Number(invoice.subtotal),
      total: Number(invoice.total),
      totalTax: Number(invoice.totalTax),
      totalDiscount: Number(invoice.totalDiscount),
      platformCommission: Number(invoice.platformCommission),
      shippingFee: Number(invoice.shippingFee),
      paidAmount: Number(invoice.paidAmount), // ✅ NEW
      remainingAmount: Number(invoice.remainingAmount), // ✅ NEW
      costOfGoods: invoice.costOfGoods
        ? Number(invoice.costOfGoods)
        : undefined,
      grossProfit: invoice.grossProfit
        ? Number(invoice.grossProfit)
        : undefined,
      netProfit: invoice.netProfit ? Number(invoice.netProfit) : undefined,
      profitMargin: invoice.profitMargin
        ? Number(invoice.profitMargin)
        : undefined,
      lines: invoice.lines.map((line) => ({
        ...line,
        unitPrice: Number(line.unitPrice),
        lineDiscount: Number(line.lineDiscount),
        taxRate: Number(line.taxRate),
        lineTotal: Number(line.lineTotal),
        priceType: line.priceType || null,
      })),
    };
  }

  async getDailySummary(branchId: number, date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const invoices = await this.prisma.salesInvoice.findMany({
      where: {
        branchId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        invoiceNo: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    const summary = invoices.reduce(
      (acc, invoice) => {
        const method = invoice.paymentMethod;
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count++;
        acc[method].total += Number(invoice.total);
        return acc;
      },
      {} as Record<string, { count: number; total: number }>,
    );

    const grandTotal = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );

    return {
      date: targetDate,
      branchId,
      summary,
      grandTotal,
      invoiceCount: invoices.length,
      recentSales: invoices.map((inv) => ({
        ...inv,
        total: Number(inv.total),
      })),
    };
  }

  private async generateInvoiceNo(branchId: number): Promise<string> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const lastInvoice = await this.prisma.salesInvoice.findFirst({
      where: {
        branchId,
        invoiceNo: {
          startsWith: `${branch.code}-${datePrefix}`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoiceNo.split('-').pop() || '0');
      sequence = lastSeq + 1;
    }

    return `${branch.code}-${datePrefix}-${String(sequence).padStart(4, '0')}`;
  }
  // ✅ NEW: Recalculate profit after returns
  async recalculateProfitAfterReturn(salesInvoiceId: number) {
    const invoice = await this.prisma.salesInvoice.findUnique({
      where: { id: salesInvoiceId },
      include: {
        lines: {
          include: { product: true },
        },
        returns: {
          include: {
            lines: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${salesInvoiceId} not found`);
    }

    // STEP 1: Calculate total refunded amount (what customer got back)
    const totalRefunded = invoice.returns.reduce(
      (sum, ret) => sum + Number(ret.totalRefund || 0),
      0,
    );

    const originalTotal = Number(invoice.total);
    const netRevenue = originalTotal - totalRefunded; // For display only

    // STEP 2: Calculate RETURNED revenue (proportional basis for cost calculation)
    // Revenue = Subtotal after discount (before tax and shipping)
    const originalSubtotal = Number(invoice.subtotal || 0);
    const originalDiscount = Number(invoice.totalDiscount || 0);
    const originalRevenue = originalSubtotal - originalDiscount;

    // Calculate how much revenue was returned (based on unit prices after discount)
    let returnedRevenue = 0;
    for (const returnRecord of invoice.returns) {
      for (const returnLine of returnRecord.lines) {
        // Find the original line to get the unit price
        const originalLine = invoice.lines.find(
          (l) => l.productId === returnLine.productId,
        );
        if (originalLine) {
          const unitPrice = Number(originalLine.unitPrice);
          returnedRevenue += unitPrice * returnLine.qtyReturned;
        }
      }
    }

    const remainingRevenue = originalRevenue - returnedRevenue;

    // STEP 3: Calculate remaining cost (using proportional method)
    // ✅ FIX: Use proportion of original cost, not current costAvg
    // WHY: Product costs may have changed since the sale. We need to use the
    // historical cost from the original transaction, not today's costAvg.
    // Since we don't store unit cost per line, we calculate proportionally:
    // If 50% of revenue was returned, we assume 50% of cost was returned.
    const originalCost = Number(invoice.costOfGoods || 0);
    const returnProportion =
      originalRevenue > 0 ? returnedRevenue / originalRevenue : 0;
    const returnedCost = originalCost * returnProportion;
    const remainingCost = originalCost - returnedCost;

    // STEP 4: Adjust costs proportionally based on REVENUE ratio (not total ratio)
    const remainingProportion =
      originalRevenue > 0 ? remainingRevenue / originalRevenue : 1;

    // ✅ Tax and Commission: Adjust proportionally
    const adjustedTax = Number(invoice.totalTax || 0) * remainingProportion;
    const adjustedCommission =
      Number(invoice.platformCommission || 0) * remainingProportion;

    // ✅ Shipping: Keep FIXED (no proportion adjustment)
    const fixedShipping = Number(invoice.shippingFee || 0);

    // STEP 5: Calculate profit (matching createSale logic)
    // Net Profit = Revenue - (Cost + Commission + Tax + Shipping)
    const totalCosts =
      remainingCost + adjustedCommission + adjustedTax + fixedShipping;
    const netProfit = remainingRevenue - totalCosts;
    const grossProfit = remainingRevenue - remainingCost;
    const profitMargin =
      remainingRevenue > 0 ? (netProfit / remainingRevenue) * 100 : 0;

    // STEP 6: Update the invoice
    await this.prisma.salesInvoice.update({
      where: { id: salesInvoiceId },
      data: {
        totalRefunded: new Prisma.Decimal(totalRefunded),
        netRevenue: new Prisma.Decimal(netRevenue), // For display
        costOfGoods: new Prisma.Decimal(remainingCost),
        grossProfit: new Prisma.Decimal(grossProfit),
        netProfit: new Prisma.Decimal(netProfit),
        profitMargin: new Prisma.Decimal(profitMargin),
      },
    });

    console.log(`✅ Profit recalculated for invoice ${invoice.invoiceNo}`);
    console.log(`\n📊 Revenue Analysis:`);
    console.log(`   Original Revenue: ${originalRevenue.toFixed(2)} ر.س`);
    console.log(`   Returned Revenue: ${returnedRevenue.toFixed(2)} ر.س`);
    console.log(`   Remaining Revenue: ${remainingRevenue.toFixed(2)} ر.س`);
    console.log(`\n💰 Cost Analysis:`);
    console.log(`   Original Cost: ${originalCost.toFixed(2)} ر.س`);
    console.log(
      `   Returned Cost (${(returnProportion * 100).toFixed(1)}% based on revenue): ${returnedCost.toFixed(2)} ر.س`,
    );
    console.log(`   Remaining Cost: ${remainingCost.toFixed(2)} ر.س`);
    console.log(`\n📈 Expenses:`);
    console.log(
      `   Adjusted Tax: ${adjustedTax.toFixed(2)} ر.س (${(remainingProportion * 100).toFixed(1)}% of original)`,
    );
    console.log(
      `   Adjusted Commission: ${adjustedCommission.toFixed(2)} ر.س (${(remainingProportion * 100).toFixed(1)}% of original)`,
    );
    console.log(
      `   Fixed Shipping: ${fixedShipping.toFixed(2)} ر.س (FIXED - NO CHANGE)`,
    );
    console.log(`\n✨ Final Results:`);
    console.log(`   Gross Profit: ${grossProfit.toFixed(2)} ر.س`);
    console.log(`   Net Profit: ${netProfit.toFixed(2)} ر.س`);
    console.log(`   Profit Margin: ${profitMargin.toFixed(2)}%`);

    return {
      originalTotal,
      totalRefunded,
      netRevenue,
      netProfit,
      profitMargin,
    };
  }
}
