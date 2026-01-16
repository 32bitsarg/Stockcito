// Upload validation utilities
// Validates file size, type, and basic security checks

import { logWarn } from '@/lib/logger'

export interface UploadConfig {
  maxSizeBytes: number
  allowedMimeTypes: string[]
  allowedExtensions: string[]
}

// Preset configurations for common upload types
export const UPLOAD_CONFIGS = {
  image: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  document: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
  csv: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['text/csv', 'application/csv'],
    allowedExtensions: ['.csv'],
  },
  any: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['*'],
    allowedExtensions: ['*'],
  },
} satisfies Record<string, UploadConfig>

export type UploadType = keyof typeof UPLOAD_CONFIGS

export interface UploadValidationResult {
  valid: boolean
  error?: string
  sanitizedName?: string
}

// Magic bytes for common file types
const FILE_SIGNATURES: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
  'image/webp': ['52494646'],
  'application/pdf': ['25504446'],
}

/**
 * Check if file magic bytes match the claimed MIME type
 */
function checkMagicBytes(buffer: ArrayBuffer, claimedType: string): boolean {
  const signatures = FILE_SIGNATURES[claimedType]
  if (!signatures) return true // No signature check available
  
  const bytes = new Uint8Array(buffer.slice(0, 8))
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  
  return signatures.some(sig => hex.startsWith(sig))
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '')
  
  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '')
  
  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '')
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    sanitized = sanitized.substring(0, 255 - ext.length) + ext
  }
  
  // If empty after sanitization, generate a random name
  if (!sanitized || sanitized === '') {
    sanitized = `file_${Date.now()}`
  }
  
  return sanitized
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.substring(lastDot).toLowerCase()
}

/**
 * Validate an uploaded file
 */
export async function validateUpload(
  file: File,
  type: UploadType = 'image'
): Promise<UploadValidationResult> {
  const config = UPLOAD_CONFIGS[type]
  
  // Check file size
  if (file.size > config.maxSizeBytes) {
    const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxMB}MB`
    }
  }
  
  // Check MIME type
  if (config.allowedMimeTypes[0] !== '*') {
    if (!config.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido: ${file.type}`
      }
    }
  }
  
  // Check extension
  const extension = getExtension(file.name)
  if (config.allowedExtensions[0] !== '*') {
    if (!config.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Extensión de archivo no permitida: ${extension}`
      }
    }
  }
  
  // Verify magic bytes for known types
  try {
    const buffer = await file.arrayBuffer()
    if (!checkMagicBytes(buffer, file.type)) {
      logWarn('File magic bytes mismatch', {
        filename: file.name,
        claimedType: file.type
      })
      return {
        valid: false,
        error: 'El contenido del archivo no coincide con su tipo declarado'
      }
    }
  } catch {
    return {
      valid: false,
      error: 'No se pudo verificar el archivo'
    }
  }
  
  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name)
  
  return {
    valid: true,
    sanitizedName
  }
}

/**
 * Validate multiple files
 */
export async function validateUploads(
  files: File[],
  type: UploadType = 'image',
  maxFiles: number = 10
): Promise<{ valid: boolean; errors: string[]; validFiles: File[] }> {
  if (files.length > maxFiles) {
    return {
      valid: false,
      errors: [`Máximo ${maxFiles} archivos permitidos`],
      validFiles: []
    }
  }
  
  const errors: string[] = []
  const validFiles: File[] = []
  
  for (const file of files) {
    const result = await validateUpload(file, type)
    if (result.valid) {
      validFiles.push(file)
    } else {
      errors.push(`${file.name}: ${result.error}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    validFiles
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
