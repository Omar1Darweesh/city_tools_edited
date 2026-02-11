import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Adding page-based permissions...');

    // Create pages table
    await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      key VARCHAR(50) UNIQUE NOT NULL,
      name_en VARCHAR(100) NOT NULL,
      name_ar VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      icon VARCHAR(50),
      route VARCHAR(100),
      sort_order INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    // Create junction table
    await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS role_pages (
      role_id INTEGER NOT NULL,
      page_id INTEGER NOT NULL,
      PRIMARY KEY (role_id, page_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `;

    console.log('✅ Tables created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
