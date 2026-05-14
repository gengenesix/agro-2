import { format, formatDistanceToNow } from 'date-fns'

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatGHSCompact(amount: number): string {
  if (amount >= 1_000_000) return `GHS ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `GHS ${(amount / 1_000).toFixed(1)}K`
  return formatGHS(amount)
}

export function formatQuantity(qty: number, unit: string): string {
  return `${qty.toLocaleString('en-GH')} ${unit}`
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatPhoneGhana(phone: string): string {
  const digits = phone.replace('+233', '0')
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

export function normalizePhone(phone: string): string {
  return phone.startsWith('0') ? `+233${phone.slice(1)}` : phone
}
