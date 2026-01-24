'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionProps {
    children: React.ReactNode
    className?: string
}

export function Accordion({ children, className }: AccordionProps) {
    return <div className={cn('flex flex-col gap-4', className)}>{children}</div>
}

interface AccordionItemProps {
    children: React.ReactNode
    value: string
    className?: string
}

export function AccordionItem({ children, className }: AccordionItemProps) {
    return (
        <div className={cn('border-b border-zinc-800 last:border-0', className)}>
            {children}
        </div>
    )
}

interface AccordionTriggerProps {
    children: React.ReactNode
    className?: string
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const toggle = () => setIsOpen(!isOpen)

    // We need to clone the children to pass the state down or use Context.
    // For simplicity in this specific file structure without context:
    // actually, standard accordion usually uses context to manage state (single open vs multiple).
    // But for a simple independent item approach (collapsible), we can just manage state here if we composite it differently.
    // However, usually Trigger controls Content.

    // Let's use a simpler styling approach where we expect the parent 'AccordionItem' context or just build a compound component 
    // that accepts 'isOpen' prop if we wanted strict control, but for "FAQ", independent items are often fine.

    // Re-thinking: context is cleaner for Trigger/Content separation.
    return (
        // Placeholder: Logic is handled in ItemWrapper below for simplicity or Context.
        // Let's implement a Context version for correctness.
        <div className={cn('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-white [&[data-state=open]>svg]:rotate-45', className)}>
            {children}
            <Plus className="h-4 w-4 shrink-0 transition-transform duration-200 text-zinc-500" />
        </div>
    )
}

// SIMPLIFIED APPROACH: Just export a specialized FAQ Item component to avoid complex Context for this single use case
// or build a proper Compound component. Let's go with a proper Compound Component using Context.

const AccordionContext = React.createContext<{ expanded: string | null; setExpanded: (val: string | null) => void }>({
    expanded: null,
    setExpanded: () => { }
})

export function AccordionRoot({ type = "single", collapsible = true, className, children }: { type?: "single", collapsible?: boolean, className?: string, children: React.ReactNode }) {
    const [expanded, setExpanded] = React.useState<string | null>(null)

    return (
        <AccordionContext.Provider value={{
            expanded,
            setExpanded: (value) => {
                if (expanded === value && collapsible) {
                    setExpanded(null)
                } else {
                    setExpanded(value)
                }
            }
        }}>
            <div className={cn("space-y-2", className)}>
                {children}
            </div>
        </AccordionContext.Provider>
    )
}

export const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean }>({ value: "", isOpen: false })

export function AccordionItemV2({ value, children, className }: { value: string, children: React.ReactNode, className?: string }) {
    const { expanded } = React.useContext(AccordionContext)
    const isOpen = expanded === value

    return (
        <AccordionItemContext.Provider value={{ value, isOpen }}>
            <div className={cn("border-b border-zinc-800 overflow-hidden", className)}>
                {children}
            </div>
        </AccordionItemContext.Provider>
    )
}

export function AccordionTriggerV2({ children, className }: { children: React.ReactNode, className?: string }) {
    const { expanded, setExpanded } = React.useContext(AccordionContext)
    const { value, isOpen } = React.useContext(AccordionItemContext)

    return (
        <button
            onClick={() => setExpanded(value)}
            className={cn(
                "flex flex-1 items-center justify-between py-6 font-semibold transition-all hover:text-white w-full text-left font-mono text-sm md:text-base text-zinc-300",
                className
            )}
        >
            {children}
            <Plus className={cn("h-4 w-4 shrink-0 transition-transform duration-200 text-zinc-500", isOpen && "rotate-45 text-white")} />
        </button>
    )
}

export function AccordionContentV2({ children, className }: { children: React.ReactNode, className?: string }) {
    const { isOpen } = React.useContext(AccordionItemContext)

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className={cn("pb-6 pt-0 text-sm text-zinc-500 font-mono leading-relaxed", className)}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
