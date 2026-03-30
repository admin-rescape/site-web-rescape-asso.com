"use client";

import React from "react";
import { motion } from "framer-motion";

interface TimelineItem {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

interface TimelineProps {
    items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.ol
            role="list"
            data-motion-wrapper="true"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="timeline relative border-l-2 border-primary/20 ml-6 md:ml-12 space-y-12 py-8"
        >
            {items.map((item, index) => (
                <motion.li
                    role="listitem"
                    key={index}
                    variants={itemVariants}
                    className="timeline-item relative pl-8 md:pl-12 group"
                >
                    {/* Dot/Icon on the line */}
                    <div className="timeline-dot absolute -left-[1.0625rem] top-0 w-9 h-9 bg-surface border-2 border-primary rounded-full flex items-center justify-center text-xl shadow-sm z-10 group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                        {item.icon || "•"}
                    </div>

                    {/* Content */}
                    <div className="timeline-content space-y-3">
                        <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary">{item.title}</h3>
                        <div className="text-base md:text-lg text-dark/80 font-lato leading-relaxed">
                            {item.children}
                        </div>
                    </div>
                </motion.li>
            ))}
        </motion.ol>
    );
}
