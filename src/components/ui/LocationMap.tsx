"use client";

import { useState } from "react";
import { clsx } from "clsx";

const MAPS_DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=4+Place+Fogt+59580+Aniche";

export const LocationMap = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <figure
            className="location-map relative w-full"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <figcaption className="sr-only">Carte de localisation – 4 Place Fogt, 59580 Aniche</figcaption>

            <button
                className="location-map__trigger w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-center shadow-sm hover:shadow-md"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="location-map-popup"
            >
                Nous situer 📍
            </button>

            {/* Outer container with padding-bottom to act as a stable hover bridge without using margin-bottom */}
            <div className={clsx(
                "absolute bottom-full left-1/2 -translate-x-1/2 pb-4 z-50 transition-all duration-300",
                isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            )}>
                <div
                    id="location-map-popup"
                    className={clsx(
                        "location-map__popup w-[300px] h-[250px] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-4 border-white transition-all duration-500 transform relative group overflow-hidden",
                        "hover:shadow-[0_0_60px_-5px_rgba(200,90,30,0.3)] hover:border-primary/40", // Halo flou extérieur
                        isOpen ? "translate-y-0 pointer-events-auto" : "translate-y-2 pointer-events-none"
                    )}
                    inert={!isOpen}
                >
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://maps.google.com/maps?q=4+Place+Fogt,+59580+Aniche&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="rounded-lg mb-12"
                        loading="lazy"
                        title="Google Maps – Rescape Aniche"
                    ></iframe>
                    {/* Lien itinéraire – ouvre Google Maps */}
                    <a
                        href={MAPS_DIRECTIONS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location-map__directions-link absolute bottom-3 left-3 right-3 bg-primary text-white text-sm font-bold py-2 rounded-lg text-center shadow-lg hover:bg-secondary transition-colors z-20 flex items-center justify-center gap-2"
                    >
                        <span aria-hidden="true">🚀</span>
                        <span>Y aller (Itinéraire)</span>
                    </a>
                    <div className="location-map__arrow absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 transform" aria-hidden="true"></div>
                </div>
            </div>
        </figure>
    );
};
