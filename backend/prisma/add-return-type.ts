import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addReturnType() {
    console.log('🔄 Starting return_type migration...');

    try {
        // Step 1: Create ReturnType enum
        console.log('📝 Creating ReturnType enum...');
        await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "ReturnType" AS ENUM ('STOCK', 'DEFECTIVE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

        // Step 2: Add return_type column to sales_return_lines
        console.log('📝 Adding return_type column to sales_return_lines...');
        await prisma.$executeRaw`
      ALTER TABLE "sales_return_lines" 
      ADD COLUMN IF NOT EXISTS "return_type" "ReturnType" NOT NULL DEFAULT 'STOCK';
    `;

        // Step 3: Create index for performance
        console.log('📝 Creating index on return_type...');
        await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "sales_return_lines_return_type_idx" 
      ON "sales_return_lines"("return_type");
    `;

        console.log('✅ Return type migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if executed directly
if (require.main === module) {
    addReturnType()
        .then(() => {
            console.log('🎉 Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error:', error);
            process.exit(1);
        });
}

export default addReturnType;
