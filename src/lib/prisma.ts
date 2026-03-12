import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

let globalForPrisma = global as unknown as { prisma?: PrismaClient, adapter?: PrismaPg };
const adapter = globalForPrisma?.adapter ?? new PrismaPg({ connectionString: process.env.DATABASE_CONNECTION_STRING });
const prisma = globalForPrisma?.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma = { adapter, prisma }
}

export { prisma };