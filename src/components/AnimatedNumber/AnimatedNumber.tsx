'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
    value: number | string;
    duration?: number;
    className?: string;
}

export default function AnimatedNumber({ value, duration = 2000, className }: AnimatedNumberProps) {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    const numericValue = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;

    useEffect(() => {
        if (isNaN(numericValue) || numericValue === 0) {
            setCount(numericValue);
            return;
        }

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // easeOutExpo curve for a fast start and slow finish
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easeOutProgress * numericValue));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(numericValue);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    window.requestAnimationFrame(step);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, [numericValue, duration]);

    return (
        <span ref={countRef} className={className}>
            {count.toLocaleString('es-ES')}
        </span>
    );
}
