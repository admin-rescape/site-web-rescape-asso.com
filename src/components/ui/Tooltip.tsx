"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={clsx("relative inline-block group", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}

            {/* Tooltip bubble - visible only on desktop/hover */}
            <div
                className={clsx(
                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark text-white text-xs rounded-lg shadow-xl z-50 w-48 transition-all duration-200 pointer-events-none hidden md:block",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                )}
                role="tooltip"
            >
                {content}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-dark"></div>
            </div>
        </div>
    );
}
