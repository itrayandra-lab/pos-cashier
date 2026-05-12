/**
 * Generate order number format: ORD-YYYYMMDD-XXXX
 * Contoh: ORD-20260512-A3F9
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${date}-${random}`;
}
