const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      category: true,
      subcategory: true
    }
  });

  const map = {};
  for (const p of products) {
    if (!map[p.category]) map[p.category] = new Set();
    map[p.category].add(p.subcategory);
  }

  for (const cat in map) {
    console.log(`\nCategory: ${cat}`);
    console.log(`Subcategories: ${[...map[cat]].join(', ')}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
