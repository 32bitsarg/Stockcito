import { db } from './db'
import crypto from 'crypto'

/**
 * Genera un código de negocio único y seguro
 * Formato: XXX-NNNN-CC
 * - XXX: 3 letras derivadas del nombre del negocio (consonantes)
 * - NNNN: 4 dígitos aleatorios
 * - CC: 2 caracteres de checksum alfanumérico
 * 
 * Ejemplo: "Kiosco María" → "KSC-4827-A3"
 */

const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'
const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión

/**
 * Extrae consonantes del nombre del negocio
 */
function extractConsonants(name: string): string {
  const normalized = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^A-Z]/g, '') // Solo letras
  
  let consonants = ''
  for (const char of normalized) {
    if (CONSONANTS.includes(char)) {
      consonants += char
    }
  }
  
  // Si no hay suficientes consonantes, usar las primeras letras
  if (consonants.length < 3) {
    consonants = normalized.slice(0, 3)
  }
  
  // Tomar las primeras 3 consonantes (o letras si no hay suficientes)
  return consonants.slice(0, 3).padEnd(3, 'X')
}

/**
 * Genera dígitos aleatorios seguros
 */
function generateRandomDigits(length: number): string {
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += (bytes[i] % 10).toString()
  }
  return result
}

/**
 * Genera checksum de 2 caracteres basado en las partes anteriores
 */
function generateChecksum(prefix: string, digits: string): string {
  const combined = prefix + digits
  const hash = crypto.createHash('sha256').update(combined + crypto.randomBytes(4).toString('hex')).digest('hex')
  
  // Tomar 2 caracteres del hash convertidos a nuestro alfabeto
  const char1 = ALPHANUMERIC[parseInt(hash.slice(0, 2), 16) % ALPHANUMERIC.length]
  const char2 = ALPHANUMERIC[parseInt(hash.slice(2, 4), 16) % ALPHANUMERIC.length]
  
  return char1 + char2
}

/**
 * Valida el formato de un código de negocio
 */
export function isValidBusinessCodeFormat(code: string): boolean {
  const pattern = /^[A-Z]{3}-\d{4}-[A-Z0-9]{2}$/
  return pattern.test(code.toUpperCase())
}

/**
 * Genera un código de negocio único
 * @param businessName - Nombre del negocio para derivar el prefijo
 * @param maxRetries - Número máximo de reintentos si hay colisión
 */
export async function generateBusinessCode(
  businessName: string, 
  maxRetries: number = 10
): Promise<string> {
  const prefix = extractConsonants(businessName)
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const digits = generateRandomDigits(4)
    const checksum = generateChecksum(prefix, digits)
    const code = `${prefix}-${digits}-${checksum}`
    
    // Verificar que no existe
    const existing = await db.organization.findUnique({
      where: { businessCode: code }
    })
    
    if (!existing) {
      return code
    }
  }
  
  // Fallback: usar timestamp para garantizar unicidad
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  const checksum = generateChecksum(prefix, timestamp)
  return `${prefix}-${timestamp}-${checksum}`
}

/**
 * Regenera el código de negocio para una organización existente
 * Usado cuando el owner quiere invalidar el código anterior
 */
export async function regenerateBusinessCode(
  organizationId: number,
  businessName: string
): Promise<string> {
  const newCode = await generateBusinessCode(businessName)
  
  await db.organization.update({
    where: { id: organizationId },
    data: { businessCode: newCode }
  })
  
  return newCode
}

/**
 * Verifica si un código de negocio existe y devuelve la organización
 */
export async function validateBusinessCode(code: string): Promise<{
  valid: boolean
  organizationId?: number
  organizationName?: string
}> {
  if (!isValidBusinessCodeFormat(code)) {
    return { valid: false }
  }
  
  const organization = await db.organization.findUnique({
    where: { businessCode: code.toUpperCase() },
    select: { id: true, name: true }
  })
  
  if (!organization) {
    return { valid: false }
  }
  
  return {
    valid: true,
    organizationId: organization.id,
    organizationName: organization.name
  }
}

/**
 * Obtiene la lista de empleados de una organización para el login
 * Solo devuelve empleados activos con PIN configurado
 */
export async function getEmployeesForLogin(organizationId: number): Promise<{
  id: number
  name: string
}[]> {
  const employees = await db.user.findMany({
    where: {
      organizationId,
      active: true,
      pin: { not: null },
      role: { not: 'owner' } // El owner usa login normal
    },
    select: {
      id: true,
      name: true
    },
    orderBy: { name: 'asc' }
  })
  
  return employees
}
