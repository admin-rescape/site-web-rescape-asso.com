"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import Image from "next/image";
import { X, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ActionCardProps {
    title: string;
    description: string;
    icon: string | React.ReactNode;
    status?: string;
    image?: string;
    periodicity?: string | null;
    className?: string;
}

export const ActionCard = ({ title, description, icon, status, image, periodicity, className }: ActionCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Pour mobile, on gère l'ouverture au tap.
    // L'évènement onClick fonctionnera sur mobile et desktop, 
    // et onMouseEnter gérera l'ouverture au survol sur desktop.
    return (
        <>
            <motion.article
                role="button"
                tabIndex={0}
                aria-label={title}
                data-motion-wrapper="true"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={clsx(
                    "action-card bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-primary/5 flex flex-col h-full relative cursor-pointer group overflow-hidden",
                    className
                )}
                onClick={() => setIsOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsOpen(true);
                    }
                }}
            >
                {/* Badge Statut */}
                {status && (
                    <span className={clsx(
                        "action-status-badge absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10",
                        status === "En cours" ? "bg-success/10 text-success" :
                            status === "Saisonnier" ? "bg-accent/10 text-accent" :
                                "bg-secondary/10 text-secondary"
                    )}>
                        {status}
                    </span>
                )}

                {/* Icône Centrale */}
                <div className="action-card__icon flex justify-center mb-6 mt-4">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-4xl text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300" aria-hidden="true">
                        {icon}
                    </div>
                </div>

                <div className="flex flex-col items-center flex-grow text-center space-y-3">
                    <h3 className="text-xl font-playfair font-bold text-dark group-hover:text-primary transition-colors duration-300">{title}</h3>
                    <p className="text-dark/70 font-lato leading-relaxed text-sm line-clamp-3 group-hover:text-dark transition-colors duration-300">{description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-transparent group-hover:border-primary/10 flex justify-center transition-all duration-300">
                    <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        En savoir plus +
                    </span>
                </div>

                {/* Overlay discret au hover */}
                <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.article>

            {/* Modale d'Information Mobile/Desktop */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setIsOpen(false)}>
                    {/* Overlay Sombre */}
                    <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200"></div>

                    {/* Contenu de la modale */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        className="bg-white rounded-3xl overflow-hidden w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                        onMouseLeave={() => setIsOpen(false)} // Ferme la modale si on quitte le composant sur desktop
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-dark hover:bg-white transition-colors z-20 shadow-sm"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {image ? (
                            <div className="relative w-full h-48 bg-slate-100">
                                <Image src={image} alt={title} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex items-end p-6">
                                    <h3 id="modal-title" className="text-2xl font-playfair font-bold text-white">{title}</h3>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-32 bg-primary/10 flex items-center justify-center">
                                <h3 id="modal-title" className="text-2xl font-playfair font-bold text-primary px-6 text-center">{title}</h3>
                            </div>
                        )}

                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            {status && (
                                <div className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                    Statut: <span className="text-primary ml-1">{status}</span>
                                </div>
                            )}

                            <p className="text-dark/80 font-lato leading-relaxed text-base mb-6">
                                {description}
                            </p>

                            {periodicity && (
                                <div className="flex items-center space-x-3 bg-secondary/5 rounded-2xl p-4 border border-secondary/10">
                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-0.5">Périodicité</p>
                                        <p className="text-dark font-medium leading-tight">{periodicity}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
