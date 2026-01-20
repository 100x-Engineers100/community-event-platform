'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parse, isValid } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
    value?: string
    onChange: (value: string) => void
    error?: string
    className?: string
}

export function DateTimePicker({
    value,
    onChange,
    error,
    className
}: DateTimePickerProps) {
    const [datePart, setDatePart] = useState('')
    const [timePart, setTimePart] = useState('19:00') // Default to 7 PM

    // Initialize from value
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value)
                if (isValid(date)) {
                    setDatePart(format(date, 'yyyy-MM-dd'))
                    setTimePart(format(date, 'HH:mm'))
                }
            } catch (e) {
                console.error('Invalid date value:', value)
            }
        }
    }, [value])

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value
        setDatePart(newDate)
        updateValue(newDate, timePart)
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value
        setTimePart(newTime)
        updateValue(datePart, newTime)
    }

    const updateValue = (d: string, t: string) => {
        if (d && t) {
            try {
                const combined = `${d}T${t}:00`
                const date = new Date(combined)
                if (isValid(date)) {
                    onChange(date.toISOString())
                }
            } catch (e) {
                console.error('Error combining date and time')
            }
        }
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timezoneOffset = format(new Date(), 'xxx')

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-100x-text-secondary text-xs uppercase tracking-wider font-semibold">
                        Date
                    </Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-100x-text-muted" />
                        <Input
                            type="date"
                            value={datePart}
                            onChange={handleDateChange}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="pl-10 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary focus:ring-100x-accent-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-100x-text-secondary text-xs uppercase tracking-wider font-semibold">
                        Time
                    </Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-100x-text-muted" />
                        <Input
                            type="time"
                            value={timePart}
                            onChange={handleTimeChange}
                            className="pl-10 bg-100x-bg-secondary border-100x-border-default text-100x-text-primary focus:ring-100x-accent-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-100x-text-muted">
                <Globe className="w-3.5 h-3.5" />
                <span>GMT{timezoneOffset} {timezone.replace('_', ' ')}</span>
            </div>

            {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
        </div>
    )
}
