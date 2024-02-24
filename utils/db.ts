import { PrismaClient } from '@prisma/client'
import chalk from 'chalk'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getPrisma = () => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const logThreshold = 50 // ms

  const prisma = new PrismaClient({
    log: [
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'query', emit: 'event' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

  prisma.$on('query', (event) => {
    const duration = event.duration

    let colour: 'red' | 'green' = 'red'
    if (duration <= logThreshold * 1.5) {
      colour = 'green'
    }

    const queryStatus = chalk[colour](`${duration}ms ${event.query}`)
    console.log(`${queryStatus}`)
  })

  return prisma
}

export const db = getPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
