import { PrismaClient } from '@agroconnect/database'

const g = globalThis as typeof globalThis & { __prisma?: PrismaClient }
export const prisma = (g.__prisma ??= new PrismaClient())
