/**
 * Reusable filter utilities for tables/pages.
 * Functions exported:
 * - applyFilters(data, filters): returns filtered array
 */

export const parseDate = (input) => {
    if (!input) return null
    if (input instanceof Date) return input
    const s = String(input)
    // YYYY-MM-DD
    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(s)
    if (isoMatch) {
        const [y, m, d] = s.split('-').map(Number)
        return new Date(y, m - 1, d)
    }
    const parsed = new Date(s)
    return isNaN(parsed.getTime()) ? null : parsed
}

export function applyFilters(data = [], filters = {}) {
    const { categories, status, dateFrom, dateTo } = filters || {}
    return (data || []).filter((row) => {
        // categories: match any
        if (categories && categories.length) {
            const rowCats = Array.isArray(row.category) ? row.category.map(String) : (row.category ? [String(row.category)] : [])
            const ok = categories.some(c => rowCats.includes(c))
            if (!ok) return false
        }

        // status: exact match (trimmed)
        if (status) {
            if (!row.status) return false
            if (String(row.status).trim() !== String(status).trim()) return false
        }

        // date range: prefer row.dateRaw, fall back to row.date
        if (dateFrom || dateTo) {
            const source = row.dateRaw || row.date || null
            const rowDate = source ? parseDate(source) : null
            if (!rowDate) return false

            if (dateFrom) {
                const from = parseDate(dateFrom)
                if (!from) return false
                if (rowDate < from) return false
            }
            if (dateTo) {
                const to = parseDate(dateTo)
                if (!to) return false
                to.setHours(23, 59, 59, 999)
                if (rowDate > to) return false
            }
        }

        return true
    })
}

export const formatDate = (d) => {
    if (!d) return ''
    const date = d instanceof Date ? d : parseDate(d)
    if (!date) return ''
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, '0')
    const dd = `${date.getDate()}`.padStart(2, '0')
    return `${y}-${m}-${dd}`
}

export default { parseDate, formatDate, applyFilters }
