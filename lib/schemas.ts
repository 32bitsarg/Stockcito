import { z } from "zod"

// Auth schemas
// Password must have: 8+ chars, uppercase, lowercase, number, special character
const passwordSchema = z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número")
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/, "La contraseña debe tener al menos un caracter especial")

export const registerSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email inválido"),
    password: passwordSchema,
    businessName: z.string().min(1, "El nombre del negocio es requerido")
})

export type RegisterFormValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es requerida")
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const productSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    sku: z.string().optional().transform(val => val === '' ? undefined : val),
    price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    cost: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
    stock: z.coerce.number().int().min(0, "El stock debe ser mayor o igual a 0"),
    minStock: z.coerce.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0").default(0),
    taxRate: z.coerce.number().min(0, "El IVA debe ser mayor o igual a 0").default(21),
    categoryId: z.coerce.number().int().optional(),
    supplierId: z.coerce.number().int().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const clientSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>

export const supplierSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    notes: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

export const discountSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().min(0, "El valor debe ser mayor o igual a 0"),
    minPurchase: z.coerce.number().min(0).optional(),
    maxDiscount: z.coerce.number().min(0).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    categoryId: z.coerce.number().int().optional(),
    isActive: z.boolean().default(true),
})

export type DiscountFormValues = z.infer<typeof discountSchema>

export const saleItemSchema = z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0), // Precio neto por unidad (sin IVA)
    subtotal: z.number().min(0),
    discountAmount: z.number().min(0).optional(),
    discountRate: z.number().min(0).max(100).optional()
})

export const saleSchema = z.object({
    clientId: z.number().optional(),
    items: z.array(saleItemSchema).min(1, "Debe haber al menos un producto"),
    total: z.number().min(0),
    userId: z.number().optional(),
    discountAmount: z.number().min(0).optional(),
    discountRate: z.number().min(0).max(100).optional(),
    issueInvoice: z.boolean().optional(),
    invoiceType: z.string().optional(),
    pointOfSale: z.number().optional(),
    paymentMethod: z.enum(["efectivo", "tarjeta", "transferencia", "mercadopago"]).default("efectivo"),
    requireOpenDrawer: z.boolean().optional().default(true), // Si false, permite vender sin caja abierta
    tableId: z.number().optional() // Mesa asignada (para restaurantes)
})

export type SaleFormValues = z.infer<typeof saleSchema>

export const notificationSettingsSchema = z.object({
    pushEnabled: z.boolean(),
    emailEnabled: z.boolean(),
    lowStock: z.boolean(),
    lowStockThreshold: z.number().min(1).max(1000),
    dailySummary: z.boolean(),
    dailySummaryTime: z.string(),
    newSale: z.boolean(),
    highValueSale: z.boolean(),
    highValueThreshold: z.number().min(100),
    cashDrawerAlerts: z.boolean(),
    newEmployee: z.boolean(),
})

export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>

export const appearanceSettingsSchema = z.object({
    theme: z.string().min(1, "Por favor selecciona un tema."),
})

export type AppearanceSettingsFormValues = z.infer<typeof appearanceSettingsSchema>

export const tableSchema = z.object({
    number: z.number().min(1, "El número debe ser mayor a 0"),
    name: z.string().optional(),
    capacity: z.number().min(1, "Mínimo 1 persona").max(50, "Máximo 50 personas"),
    shape: z.enum(["square", "round", "rectangle"]),
})

export type TableFormValues = z.infer<typeof tableSchema>

