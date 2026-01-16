// Input sanitization utilities

// Basic HTML sanitizer (removes all HTML tags)
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

// Sanitize string input (remove dangerous characters, normalize whitespace)
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

// Sanitize email
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  return email.toLowerCase().trim()
}

// Sanitize for SQL LIKE queries (escape wildcards)
export function sanitizeForLike(input: string): string {
  return sanitizeString(input)
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return ''
  
  return filename
    .trim()
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    // Keep only safe characters
    .replace(/[^a-zA-Z0-9_\-. ]/g, '_')
    // Remove leading/trailing dots
    .replace(/^\.+|\.+$/g, '')
    // Collapse multiple underscores
    .replace(/_+/g, '_')
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null
  
  try {
    const parsed = new URL(url.trim())
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

// Sanitize phone number (keep only digits and + at start)
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return ''
  
  const cleaned = phone.replace(/[^\d+]/g, '')
  // Ensure + only at start
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.slice(1).replace(/\+/g, '')
  }
  return cleaned.replace(/\+/g, '')
}

// Sanitize CUIT/CUIL (Argentine tax ID)
export function sanitizeTaxId(taxId: string): string {
  if (typeof taxId !== 'string') return ''
  // Keep only digits and hyphens in correct format
  return taxId.replace(/[^\d-]/g, '').slice(0, 13)
}

// Sanitize monetary amount string
export function sanitizeAmount(amount: string): string {
  if (typeof amount !== 'string') return ''
  // Keep only digits, dots, and commas
  return amount.replace(/[^\d.,]/g, '').replace(',', '.')
}

// Create a sanitized object from form data
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, 'string' | 'email' | 'phone' | 'url' | 'taxId' | 'amount' | 'none'>>
): T {
  const result = { ...data }

  for (const [key, rule] of Object.entries(rules)) {
    const value = result[key as keyof T]
    if (typeof value !== 'string') continue

    switch (rule) {
      case 'string':
        (result as Record<string, unknown>)[key] = sanitizeString(value)
        break
      case 'email':
        (result as Record<string, unknown>)[key] = sanitizeEmail(value)
        break
      case 'phone':
        (result as Record<string, unknown>)[key] = sanitizePhone(value)
        break
      case 'url':
        (result as Record<string, unknown>)[key] = sanitizeUrl(value) || ''
        break
      case 'taxId':
        (result as Record<string, unknown>)[key] = sanitizeTaxId(value)
        break
      case 'amount':
        (result as Record<string, unknown>)[key] = sanitizeAmount(value)
        break
      case 'none':
        // Don't sanitize
        break
      default:
        (result as Record<string, unknown>)[key] = sanitizeString(value)
    }
  }

  return result
}
