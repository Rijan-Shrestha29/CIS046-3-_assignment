// Prisma client singleton.
// Prevents connection exhaustion during dev hot-reload.
// Reference: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
const { PrismaClient } = require('../../generated/prisma');

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;