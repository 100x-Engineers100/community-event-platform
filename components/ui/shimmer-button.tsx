import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
    (
        {
            shimmerColor = "#ffffff",
            shimmerSize = "0.05em",
            shimmerDuration = "3s",
            borderRadius = "100px",
            background = "rgba(0, 0, 0, 1)",
            className,
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                style={
                    {
                        "--shimmer-color": shimmerColor,
                        "--radius": borderRadius,
                        "--speed": shimmerDuration,
                        "--cutout": shimmerSize,
                        "--bg": background,
                    } as React.CSSProperties
                }
                className={cn(
                    "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
                    "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]",
                    className,
                )}
                ref={ref}
                {...props}
            >
                {/* spark container */}
                <div
                    className={cn(
                        "-z-30 blur-[2px] [border-radius:var(--radius)] [mask:unset]",
                        "absolute inset-0 overflow-visible [container-type:size]",
                    )}
                >
                    {/* spark */}
                    <div className="absolute inset-0 h-[100cqh] animate-spin-around [aspect-ratio:1] [background:conic-gradient(from_90deg_at_50%_50%,var(--shimmer-color)_0%,transparent_5%,transparent_60%,var(--shimmer-color)_100%)] [border-radius:var(--radius)] [inset:0_auto_auto_50%] [transform-origin:calc(100%_-_50%)_50%]" />
                </div>
                {children}

                {/* Highlight */}
                <div
                    className={cn(
                        "insert-0 absolute h-full w-full [border-radius:var(--radius)] [px:var(--cutout)] [py:var(--cutout)]",
                        "shadow-[inset_0_-8px_10px_#ffffff1f]",
                        "transform-gpu transition-all duration-300 ease-in-out",
                        "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
                        "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
                    )}
                />

                {/* backdrop */}
                <div
                    className={cn(
                        "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cutout)]",
                    )}
                />
            </button>
        );
    },
);

ShimmerButton.displayName = "ShimmerButton";
