/**
 * Sale Actions Module
 * 
 * This module re-exports all sale-related server actions.
 * The actions have been split into smaller, focused modules for better maintainability.
 * 
 * Module Structure:
 * - create-sale-actions.ts: Create sales (createSale)
 * - sale-query-actions.ts: Query sales (getSaleById, getCreditNotes)
 * - refund-actions.ts: Refunds and cancellations (cancelSale, createPartialRefund)
 */

// Create sale
export { createSale } from './create-sale-actions'

// Query sales
export { getSaleById, getCreditNotes } from './sale-query-actions'

// Refunds and cancellations
export { cancelSale, createPartialRefund } from './refund-actions'
