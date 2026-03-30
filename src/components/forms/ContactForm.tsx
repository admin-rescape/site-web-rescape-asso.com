"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { createMessage } from "@/actions/messages";
import { contactSchema } from "@/lib/validations/contact";

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Effacer les erreurs après 15 secondes
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setErrors({});
            }, 15000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    const [contentLength, setContentLength] = useState(0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);

        // Nettoyage téléphone pour la validation client
        const rawPhone = formData.get("phone") as string;
        const sanitizedPhone = rawPhone ? rawPhone.replace(/[\s.]/g, "") : "";

        const rawData = {
            name: (formData.get("name") as string).trim(),
            email: (formData.get("email") as string).trim(),
            phone: sanitizedPhone,
            subject: formData.get("subject") as string,
            content: (formData.get("content") as string).trim(),
            rgpd: formData.get("rgpd") === "on",
        };

        // 1. Validation Client avec Zod
        const validation = contactSchema.safeParse(rawData);
        if (!validation.success) {
            setErrors(validation.error.flatten().fieldErrors);
            setLoading(false);
            return;
        }

        try {
            // 2. Envoi au serveur (on prépare un nouveau FormData avec les données nettoyées)
            const submissionData = new FormData();
            Object.entries(rawData).forEach(([key, value]) => {
                if (key === "rgpd") {
                    if (value) submissionData.append(key, "on");
                } else {
                    submissionData.append(key, value.toString());
                }
            });

            const result = await createMessage(submissionData);

            if (result?.error) {
                if (result.details) {
                    setErrors(result.details);
                } else {
                    alert(result.error);
                }
            } else {
                setSuccess(true);
            }
        } catch (error) {
            console.error(error);
            alert("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                id="contact-success-banner"
                role="alert"
                className="flex flex-col items-center justify-center text-center py-12 px-4 min-h-[31.25rem]"
            >
                <div className="relative mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                        className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center"
                    >
                        <span className="text-5xl animate-pulse">✉️</span>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-success text-white rounded-full flex items-center justify-center text-xl shadow-lg"
                    >
                        ✓
                    </motion.div>
                </div>

                <h3 className="font-playfair font-bold text-4xl text-dark mb-4">C&apos;est envoyé !</h3>
                <p className="font-nunito text-lg text-dark/60 max-w-sm mx-auto leading-relaxed mb-10">
                    Merci pour votre message ! Notre équipe en a pris connaissance et vous répondra dès que possible.
                </p>

                <Button
                    variant="primary"
                    className="bg-success hover:bg-success/90 text-white min-w-[12.5rem] py-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                    onClick={() => setSuccess(false)}
                >
                    Fermer
                </Button>
            </motion.div>
        );
    }

    return (
        <form id="contact-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
            <h2 className="text-3xl font-playfair font-bold text-dark mb-8">Envoyez-nous un message</h2>
            <fieldset id="identity-fieldset" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <legend className="sr-only">Identité</legend>
                <div className="form-field space-y-1">
                    <label htmlFor="name" className="block text-sm font-bold text-dark font-nunito">Nom complet *</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        autoComplete="name"
                        className={clsx(
                            "w-full text-base px-4 py-3 rounded-xl border outline-none transition-all bg-surface",
                            errors.name ? "border-red-500 focus:ring-red-100" : "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                        onInput={(e) => {
                            let val = e.currentTarget.value;
                            if (val.startsWith(" ")) val = val.trimStart();
                            val = val.replace(/\s{2,}/g, " ");
                            e.currentTarget.value = val;
                        }}
                        placeholder="Votre nom"
                    />
                    <div className="min-h-4 px-1">
                        <AnimatePresence mode="wait">
                            {errors.name && (
                                <motion.p
                                    id="name-error"
                                    key="name-error"
                                    initial={{ opacity: 0, y: -2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -2 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-red-500 text-xs font-medium leading-none"
                                >
                                    {errors.name[0]}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="form-field space-y-1">
                    <label htmlFor="email" className="block text-sm font-bold text-dark font-nunito">Email *</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        autoComplete="email"
                        className={clsx(
                            "w-full text-base px-4 py-3 rounded-xl border outline-none transition-all bg-surface",
                            errors.email ? "border-red-500 focus:ring-red-100" : "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                        onInput={(e) => {
                            let val = e.currentTarget.value;
                            if (val.startsWith(" ")) val = val.trimStart();
                            val = val.replace(/\s{2,}/g, " ");
                            e.currentTarget.value = val;
                        }}
                        placeholder="votre@email.com"
                    />
                    <div className="min-h-4 px-1">
                        <AnimatePresence mode="wait">
                            {errors.email && (
                                <motion.p
                                    id="email-error"
                                    key="email-error"
                                    initial={{ opacity: 0, y: -2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -2 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-red-500 text-xs font-medium leading-none"
                                >
                                    {errors.email[0]}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </fieldset>

            <div className="form-field space-y-1">
                <label htmlFor="phone" className="block text-sm font-bold text-dark font-nunito">Téléphone</label>
                <input
                    type="tel"
                    name="phone"
                    id="phone"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    autoComplete="tel"
                    className={clsx(
                        "w-full text-base px-4 py-3 rounded-xl border outline-none transition-all bg-surface",
                        errors.phone ? "border-red-500 focus:ring-red-100" : "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                    onInput={(e) => {
                        let val = e.currentTarget.value;
                        if (val.startsWith(" ")) val = val.trimStart();
                        // Pour le téléphone, on autorise aussi les espaces et points mais pas plusieurs à la suite
                        val = val.replace(/\s{2,}/g, " ").replace(/\.{2,}/g, ".");
                        e.currentTarget.value = val;
                    }}
                    placeholder="06 12 34 56 78"
                />
                <div className="min-h-4 px-1">
                    <AnimatePresence mode="wait">
                        {errors.phone && (
                            <motion.p
                                id="phone-error"
                                key="phone-error"
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -2 }}
                                transition={{ duration: 0.2 }}
                                className="text-red-500 text-xs font-medium leading-none"
                            >
                                {errors.phone[0]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="form-field space-y-1">
                <label htmlFor="subject" className="block text-sm font-bold text-dark font-nunito">Objet *</label>
                <select
                    id="subject"
                    name="subject"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    className={clsx(
                        "w-full text-base px-4 py-3 rounded-xl border outline-none transition-all bg-surface",
                        errors.subject ? "border-red-500 focus:ring-red-100" : "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="renseignement">Renseignement général</option>
                    <option value="benevolat">Je souhaite devenir bénévole</option>
                    <option value="partenariat">Proposition de partenariat</option>
                    <option value="depot">Question sur les dépôts</option>
                    <option value="autre">Autre</option>
                </select>
                <div className="min-h-4 px-1">
                    <AnimatePresence mode="wait">
                        {errors.subject && (
                            <motion.p
                                id="subject-error"
                                key="subject-error"
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -2 }}
                                transition={{ duration: 0.2 }}
                                className="text-red-500 text-xs font-medium leading-none"
                            >
                                {errors.subject[0]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="form-field space-y-1">
                <div className="flex justify-between items-end">
                    <label htmlFor="message" className="block text-sm font-bold text-dark font-nunito">Message *</label>
                    <span className={clsx(
                        "text-xs font-medium transition-colors",
                        contentLength >= 50 ? "text-success" : "text-dark/40"
                    )}>
                        {contentLength} / 50 caractères min.
                    </span>
                </div>
                <textarea
                    id="message"
                    name="content"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.content}
                    aria-describedby={errors.content ? "content-error" : undefined}
                    rows={15}
                    className={clsx(
                        "w-full text-base px-4 py-3 rounded-xl border outline-none transition-all bg-surface resize-y",
                        errors.content ? "border-red-500 focus:ring-red-100" : "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                    onInput={(e) => {
                        let val = e.currentTarget.value;
                        if (val.startsWith(" ")) val = val.trimStart();
                        val = val.replace(/\s{2,}/g, " ");
                        e.currentTarget.value = val;
                        setContentLength(val.trim().length);
                    }}
                    placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
                <div className="min-h-4 px-1">
                    <AnimatePresence mode="wait">
                        {errors.content && (
                            <motion.p
                                id="content-error"
                                key="content-error"
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -2 }}
                                transition={{ duration: 0.2 }}
                                className="text-red-500 text-xs font-medium leading-none"
                            >
                                {errors.content[0]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="form-field form-field--checkbox flex flex-col">
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        id="rgpd"
                        name="rgpd"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.rgpd}
                        aria-describedby={errors.rgpd ? "rgpd-error" : undefined}
                        className={clsx(
                            "mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer",
                            errors.rgpd && "border-red-500 ring-2 ring-red-100"
                        )}
                    />
                    <label htmlFor="rgpd" className="text-sm text-dark/70 font-lato cursor-pointer">
                        J&apos;accepte que mes données soient traitées par l&apos;association Rescape pour répondre à ma demande. Aucune donnée n&apos;est transmise à des tiers.
                    </label>
                </div>
                <div className="min-h-4 pl-8 mt-1">
                    <AnimatePresence mode="wait">
                        {errors.rgpd && (
                            <motion.p
                                id="rgpd-error"
                                key="rgpd-error"
                                initial={{ opacity: 0, y: -2 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -2 }}
                                transition={{ duration: 0.2 }}
                                className="text-red-500 text-xs font-medium leading-none"
                            >
                                {errors.rgpd[0]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full font-bold text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
                {loading ? "Envoi en cours..." : "Envoyer le message"}
            </Button>
        </form>
    );
}
