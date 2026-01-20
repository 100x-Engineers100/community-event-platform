'use client'

import { motion } from 'framer-motion'
import { Ghost } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DashboardEmptyStateProps {
    canSubmit: boolean
}

export function DashboardEmptyState({ canSubmit }: DashboardEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-zinc-900/20 rounded-[40px] border border-dashed border-zinc-800">
            <motion.div
                animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl"
            >
                <Ghost className="w-12 h-12 text-zinc-700" />
            </motion.div>
            <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">
                    Silent as a <span className="text-zinc-600 underline decoration-zinc-800">Production Crash.</span>
                </h2>
                <p className="text-zinc-500 font-medium max-w-xs mx-auto">
                    You haven't created any events yet! Don't let your community wait in the dark.
                </p>
            </div>
            <Link href="/create-event">
                <Button
                    disabled={!canSubmit}
                    className="h-12 px-8 bg-white hover:bg-zinc-200 text-black font-black rounded-xl"
                >
                    Start Your First Event
                </Button>
            </Link>
        </div>
    )
}
