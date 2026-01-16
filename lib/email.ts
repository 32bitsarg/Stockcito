import nodemailer from 'nodemailer'
import { logError } from '@/lib/logger'
import crypto from 'crypto'

// Configuración del transporter con Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true para 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@stockcito.com'
const APP_NAME = 'Stockcito'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Genera un token de verificación seguro
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Plantilla base de emails
 */
function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .code-box { background: #1f2937; color: #10b981; font-family: monospace; font-size: 24px; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 3px; margin: 20px 0; }
    .info-box { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
    .credentials { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .credentials dt { font-weight: bold; color: #92400e; }
    .credentials dd { margin: 5px 0 15px 0; font-family: monospace; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME}. Todos los derechos reservados.</p>
      <p>Este es un email automático, por favor no responda a este mensaje.</p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * Envía email de verificación al owner
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${APP_URL}/api/verify-email?token=${token}`
  
  const html = emailTemplate(`
    <div class="header">
      <h1>¡Bienvenido a ${APP_NAME}!</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${name}</strong>,</p>
      <p>Gracias por registrarte en ${APP_NAME}. Para completar tu registro y desbloquear todas las funcionalidades, por favor verifica tu correo electrónico.</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verificar mi email</a>
      </div>
      
      <div class="info-box">
        <strong>¿Por qué verificar?</strong>
        <p style="margin: 5px 0 0 0;">Una vez verificado tu email podrás crear empleados y acceder a todas las funciones de tu cuenta.</p>
      </div>
      
      <p style="color: #6b7280; font-size: 13px;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
      <p style="color: #6b7280; font-size: 13px;">Este enlace expira en 24 horas.</p>
    </div>
  `)
  
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Verifica tu email - ${APP_NAME}`,
      html,
    })
    return true
  } catch (error) {
    logError('Error sending verification email:', error)
    return false
  }
}

/**
 * Envía credenciales a un nuevo empleado
 */
export async function sendEmployeeCredentials(
  to: string,
  employeeName: string,
  businessName: string,
  businessCode: string,
  pin?: string,
  password?: string
): Promise<boolean> {
  const loginUrl = `${APP_URL}/login`
  
  // Build credentials section based on what was provided
  let credentialsHtml = `
    <dt>📍 Código de Negocio</dt>
    <dd>${businessCode}</dd>
  `
  
  if (pin) {
    credentialsHtml += `
      <dt>🔐 Tu PIN de acceso</dt>
      <dd>${pin}</dd>
    `
  }
  
  if (password) {
    credentialsHtml += `
      <dt>🔑 Tu Contraseña</dt>
      <dd>${password}</dd>
    `
  }

  // Build instructions based on credentials type
  const instructionsHtml = pin ? `
    <div class="info-box">
      <strong>¿Cómo ingresar?</strong>
      <ol style="margin: 10px 0 0 20px; padding: 0;">
        <li>Ingresa a ${APP_NAME} y selecciona "Empleado"</li>
        <li>Escribe el código de negocio: <strong>${businessCode}</strong></li>
        <li>Selecciona tu nombre de la lista</li>
        <li>Ingresa tu PIN</li>
      </ol>
    </div>
  ` : `
    <div class="info-box">
      <strong>¿Cómo ingresar?</strong>
      <ol style="margin: 10px 0 0 20px; padding: 0;">
        <li>Ingresa a ${APP_NAME} y selecciona "Propietario"</li>
        <li>Escribe tu email: <strong>${to}</strong></li>
        <li>Ingresa tu contraseña</li>
      </ol>
    </div>
  `
  
  const html = emailTemplate(`
    <div class="header">
      <h1>¡Bienvenido al equipo!</h1>
      <p style="margin: 0; opacity: 0.9;">${businessName}</p>
    </div>
    <div class="content">
      <p>Hola <strong>${employeeName}</strong>,</p>
      <p>Tu cuenta de ${APP_NAME} ha sido creada. A continuación encontrarás tus credenciales de acceso:</p>
      
      <div class="credentials">
        <dl>
          ${credentialsHtml}
        </dl>
      </div>
      
      ${instructionsHtml}
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Ir a ${APP_NAME}</a>
      </div>
      
      <p style="color: #dc2626; font-size: 13px;"><strong>⚠️ Importante:</strong> No compartas tus credenciales con nadie. Son personales e intransferibles.</p>
    </div>
  `)
  
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Tus credenciales de acceso - ${businessName}`,
      html,
    })
    return true
  } catch (error) {
    logError('Error sending employee credentials:', error)
    return false
  }
}

/**
 * Envía confirmación de regeneración de código de negocio
 */
export async function sendBusinessCodeRegenerated(
  to: string,
  ownerName: string,
  businessName: string,
  oldCode: string,
  newCode: string
): Promise<boolean> {
  const html = emailTemplate(`
    <div class="header">
      <h1>Código de Negocio Actualizado</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${ownerName}</strong>,</p>
      <p>El código de negocio de <strong>${businessName}</strong> ha sido regenerado exitosamente.</p>
      
      <div class="code-box">
        ${newCode}
      </div>
      
      <div class="info-box" style="background: #fef2f2; border-color: #dc2626;">
        <strong>⚠️ Acción requerida</strong>
        <p style="margin: 5px 0 0 0;">El código anterior (<s>${oldCode}</s>) ya no funcionará. Debes compartir el nuevo código con todos tus empleados.</p>
      </div>
      
      <p>Si no solicitaste este cambio, por favor contacta a soporte inmediatamente.</p>
    </div>
  `)
  
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Nuevo código de negocio - ${businessName}`,
      html,
    })
    return true
  } catch (error) {
    logError('Error sending business code regenerated email:', error)
    return false
  }
}

/**
 * Envía código de confirmación para regenerar el código de negocio
 */
export async function sendRegenerateCodeConfirmation(
  to: string,
  ownerName: string,
  confirmationCode: string
): Promise<boolean> {
  const html = emailTemplate(`
    <div class="header">
      <h1>Confirma el cambio de código</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${ownerName}</strong>,</p>
      <p>Recibimos una solicitud para regenerar el código de negocio. Para confirmar, ingresa el siguiente código:</p>
      
      <div class="code-box">
        ${confirmationCode}
      </div>
      
      <div class="info-box" style="background: #fef2f2; border-color: #dc2626;">
        <strong>⚠️ Importante</strong>
        <p style="margin: 5px 0 0 0;">Si regeneras el código, el código anterior dejará de funcionar y todos tus empleados necesitarán el nuevo código para ingresar.</p>
      </div>
      
      <p style="color: #6b7280; font-size: 13px;">Este código expira en 10 minutos.</p>
      <p style="color: #6b7280; font-size: 13px;">Si no solicitaste este cambio, ignora este email.</p>
    </div>
  `)
  
  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Código de confirmación - Regenerar código de negocio`,
      html,
    })
    return true
  } catch (error) {
    logError('Error sending regenerate confirmation email:', error)
    return false
  }
}

/**
 * Reenvía email de verificación
 */
export async function resendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<boolean> {
  return sendVerificationEmail(to, name, token)
}

/**
 * Verifica que el transporter está configurado correctamente
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    logError('Email configuration error:', error)
    return false
  }
}
