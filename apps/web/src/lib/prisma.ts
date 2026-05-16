import { PrismaClient } from '@/generated/prisma'

const g = globalThis as typeof globalThis & { __prisma?: PrismaClient }
export const prisma = (g.__prisma ??= new PrismaClient())
