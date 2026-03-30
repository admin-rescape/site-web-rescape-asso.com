"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Custom hook to detect if element is in viewport
function useOnScreen<T extends HTMLElement>(ref: RefObject<T | null>) {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIntersecting(entry.isIntersecting),
            { threshold: 0.1 }
        );
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.disconnect();
        };
    }, [ref]);
    return isIntersecting;
}

interface CounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    className?: string;
}

export const Counter = ({ end, duration = 2000, suffix = "", className }: CounterProps) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const onScreen = useOnScreen(ref);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (onScreen && !hasAnimated) {
            const stepTime = 1000 / 60; // 60fps
            const totalSteps = duration / stepTime;
            const increment = end / totalSteps;

            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    setCount(end);
                    clearInterval(timer);
                    setHasAnimated(true);
                } else {
                    setCount(Math.floor(current));
                }
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [onScreen, end, duration, hasAnimated]);

    return (
        <span ref={ref} className={`stat-counter${className ? ` ${className}` : ""}`}>
            {count}{suffix}
        </span>
    );
};
