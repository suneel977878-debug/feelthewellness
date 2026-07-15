require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then(res => console.log("Root products count:", res.length)).catch(console.error).finally(() => prisma.$disconnect());
