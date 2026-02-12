import { activities } from "@/utils/interfaces/activities"

function buildMaps() {
  const enList = (activities.find(a => a.en) || {}).en || []
  const arList = (activities.find(a => a.ar) || {}).ar || []

  const enMap = new Map(enList.map(i => [String(i.value), i.label]))
  const arMap = new Map(arList.map(i => [String(i.value), i.label]))

  return { enMap, arMap }
}

const { enMap, arMap } = buildMaps()

export function mapActivityValues(values, lang = 'en') {
  if (!values) return []
  const arr = Array.isArray(values) ? values : [values]
  const map = (lang && String(lang).toLowerCase().startsWith('ar')) ? arMap : enMap

  return arr.map(v => {
    if (!v && v !== 0) return v
    // if item is object like { label, value }
    if (typeof v === 'object') {
      if (v.label) return v.label
      if (v.value) return map.get(String(v.value)) || v.value
      return JSON.stringify(v)
    }
    const key = String(v)
    // If value already looks like an Arabic label (contains Arabic letters), return as-is
    if (/[\u0600-\u06FF]/.test(key)) return key

    // Direct match
    if (map.has(key)) return map.get(key)

    // Normalize: lowercase with underscores (e.g. "Cleaning Supplies" -> "cleaning_supplies")
    // This handles cases where API returns spaces instead of underscores or mixed case
    const normalized = key.toLowerCase().trim().replace(/\s+/g, '_')
    if (map.has(normalized)) return map.get(normalized)

    return key
  }).filter(Boolean)
}

export default mapActivityValues
