'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, isValid, parseISO } from 'date-fns'
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
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [timePart, setTimePart] = useState('19:00')

    // Initialize from value
    useEffect(() => {
        if (value) {
            try {
                const date = parseISO(value)
                if (isValid(date)) {
                    setSelectedDate(date)
                    setTimePart(format(date, 'HH:mm'))
                }
            } catch (e) {
                console.error('Invalid date value:', value)
            }
        }
    }, [value])

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
            updateValue(date, timePart)
        }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value
        setTimePart(newTime)
        if (selectedDate) {
            updateValue(selectedDate, newTime)
        }
    }

    const updateValue = (date: Date, time: string) => {
        try {
            const [hours, minutes] = time.split(':').map(Number)
            const newDate = new Date(date)
            newDate.setHours(hours)
            newDate.setMinutes(minutes)
            newDate.setSeconds(0)
            newDate.setMilliseconds(0)

            if (isValid(newDate)) {
                onChange(newDate.toISOString())
            }
        } catch (e) {
            console.error('Error updating date value')
        }
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                    <Label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                        Date
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "h-12 w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 hover:border-100x-accent-primary group transition-all rounded-md px-3",
                                    !selectedDate && "text-zinc-500"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 group-hover:text-100x-accent-primary transition-colors" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                                className="bg-transparent"
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                        Time
                    </Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            type="time"
                            value={timePart}
                            onChange={handleTimeChange}
                            className="pl-10 h-12 bg-zinc-900 border-zinc-800 focus:border-100x-accent-primary text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <Globe className="w-3 h-3" />
                <span>Time shown in IST (Asia/Calcutta)</span>
            </div>

            {error && (
                <p className="text-red-400 text-xs font-medium mt-1">{error}</p>
            )}
        </div>
    )
}
