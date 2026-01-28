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
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white">
                        No events created yet
                    </h2>
                    <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                        Events you create will appear here. Submitted events may show as pending while they are under review.
                    </p>
                </div>
                <div className="space-y-4">
                    <Link href="/create-event">
                        <Button
                            disabled={!canSubmit}
                            className="h-12 px-8 bg-white hover:bg-zinc-200 text-black font-black rounded-xl"
                        >
                            Create a community event
                        </Button>
                    </Link>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                        Events are reviewed before being published to the community.
                    </p>
                </div>
            </div>
        </div>
    )
}
