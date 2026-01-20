"use client";
import React from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

export function DashboardCanvasEffect() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <CanvasRevealEffect
                animationSpeed={3}
                containerClassName="bg-black"
                colors={[
                    [255, 107, 51], // Official Coral Orange (#FF6B33 / #FF6B35)
                ]}
                dotSize={2}
                showGradient={false}
            />
            {/* 
        Smooth fade-off effect from left to right.
        Left is slow fade (masked by black), increasing to full opacity on the right.
      */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />

            {/* Subtle global overlay for depth */}
            <div className="absolute inset-0 bg-black/10 z-20" />
        </div>
    );
}
