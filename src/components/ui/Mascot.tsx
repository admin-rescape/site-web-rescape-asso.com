import React from "react";

export const Mascot = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Bag Body */}
            <path
                d="M40 60 H160 V170 C160 181.046 151.046 190 140 190 H60 C48.9543 190 40 181.046 40 170 V60 Z"
                fill="#C85A1E" // Brique
                stroke="#2C1A0E"
                strokeWidth="4"
            />

            {/* Handles */}
            <path
                d="M70 60 V40 C70 23.4315 83.4315 10 100 10 C116.569 10 130 23.4315 130 40 V60"
                stroke="#2C1A0E"
                strokeWidth="8"
                strokeLinecap="round"
            />

            {/* Eyes */}
            <circle cx="80" cy="110" r="8" fill="#2C1A0E" />
            <circle cx="120" cy="110" r="8" fill="#2C1A0E" />

            {/* Cheeks */}
            <circle cx="70" cy="120" r="6" fill="#FFAB91" opacity="0.6" />
            <circle cx="130" cy="120" r="6" fill="#FFAB91" opacity="0.6" />

            {/* Mouth */}
            <path
                d="M90 125 Q100 135 110 125"
                stroke="#2C1A0E"
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Vegetable/Greenery sticking out */}
            <path
                d="M50 60 Q40 40 60 30 Q70 50 50 60"
                fill="#5A8A4A"
                stroke="#2C1A0E"
                strokeWidth="2"
            />
            <path
                d="M150 60 Q160 40 140 30 Q130 50 150 60"
                fill="#E8935A" // Carrot color?
                stroke="#2C1A0E"
                strokeWidth="2"
            />
        </svg>
    );
};
