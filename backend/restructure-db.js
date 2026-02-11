const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database restructuring to match original schema mappings...');

  try {
    // 1. Rename tables
    console.log('Renaming tables...');
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "sales_invoices" RENAME TO "salesinvoices";`);
      console.log('✅ Table sales_invoices -> salesinvoices');
    } catch (e) {
      console.warn('⚠️ Table "sales_invoices" might already be renamed.');
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "sales_returns" RENAME TO "salesreturns";`);
      console.log('✅ Table sales_returns -> salesreturns');
    } catch (e) {
      console.warn('⚠️ Table "sales_returns" might already be renamed.');
    }

    // 2. Rename columns in salesinvoices
    console.log('Renaming columns in salesinvoices...');
    const salesInvoiceColumns = {
      'invoice_no': 'invoiceno',
      'branch_id': 'branchid',
      'customer_id': 'customerid',
      'total_tax': 'totaltax',
      'total_discount': 'totaldiscount',
      'payment_status': 'paymentstatus',
      'payment_method': 'paymentmethod',
      'created_by': 'createdby',
      'created_at': 'createdat',
      'updated_at': 'updatedat',
      'discount_amount': 'discountamount',
      'platform_commission': 'platformcommission',
      'cost_of_goods': 'costofgoods',
      'gross_profit': 'grossprofit',
      'net_profit': 'netprofit',
      'profit_margin': 'profitmargin',
      'delivery_date': 'deliverydate',
      'paid_amount': 'paidamount',
      'remaining_amount': 'remainingamount',
      'shipping_fee': 'shippingfee',
      'total_refunded': 'totalrefunded',
      'net_revenue': 'netrevenue'
    };

    for (const [oldName, newName] of Object.entries(salesInvoiceColumns)) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "salesinvoices" RENAME COLUMN "${oldName}" TO "${newName}";`);
        console.log(`✅ ${oldName} -> ${newName}`);
      } catch (e) {
        // console.warn(`⚠️ Could not rename column ${oldName}: ${e.message}`);
      }
    }

    // 3. Rename columns in salesreturns
    console.log('Renaming columns in salesreturns...');
    const salesReturnColumns = {
      'return_no': 'returnno',
      'sales_invoice_id': 'salesinvoiceid',
      'branch_id': 'branchid',
      'total_refund': 'totalrefund',
      'created_by': 'createdby',
      'created_at': 'createdat'
    };

    for (const [oldName, newName] of Object.entries(salesReturnColumns)) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "salesreturns" RENAME COLUMN "${oldName}" TO "${newName}";`);
        console.log(`✅ ${oldName} -> ${newName}`);
      } catch (e) {
        // console.warn(`⚠️ Could not rename column ${oldName}: ${e.message}`);
      }
    }

    console.log('\n✨ Database restructuring complete!');
  } catch (error) {
    console.error('❌ Error during restructuring:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
