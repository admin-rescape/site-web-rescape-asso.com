import { z } from "zod";

export const contactSchema = z.object({
    name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
    email: z.string().trim().email("Adresse email invalide"),
    phone: z
        .string()
        .trim()
        .regex(
            /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/,
            "Numéro de téléphone invalide"
        )
        .optional()
        .or(z.literal("")),
    content: z
        .string()
        .trim()
        .min(50, "Le message doit contenir au moins 50 caractères")
        .max(2000, "Le message est trop long"),
    subject: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
