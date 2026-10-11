// Prisma 6 config file.
// When prisma.config.ts exists, Prisma stops auto-loading .env
// so we load it explicitly to make DATABASE_URL available.
// Reference: https://www.prisma.io/docs/orm/reference/prisma-config-reference
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
});