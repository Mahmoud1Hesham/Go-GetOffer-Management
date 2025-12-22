"use client";
import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function Calendar04({ selected, onSelect, mode = 'range', defaultMonth, className, ...rest }) {
  const isControlled = selected !== undefined

  const [internal, setInternal] = React.useState(() => {
    if (isControlled) return selected
    if (mode === 'range') return { from: new Date(), to: undefined }
    return new Date()
  })

  // keep internal in sync if caller switches from controlled -> uncontrolled with a new selected
  React.useEffect(() => {
    if (isControlled) return
    // no-op: internal is intentionally managed locally when uncontrolled
  }, [isControlled])

  const selectedProp = isControlled ? selected : internal

  const handleSelect = (v) => {
    if (!isControlled) setInternal(v)
    onSelect && onSelect(v)
  }

  const defaultMonthProp = defaultMonth || (selectedProp && (selectedProp.from || selectedProp)) || new Date()

  return (
    <Calendar
      mode={mode}
      defaultMonth={defaultMonthProp}
      selected={selectedProp}
      onSelect={handleSelect}
      className={className || 'rounded-lg border shadow-sm'}
      {...rest}
    />
  )
}
