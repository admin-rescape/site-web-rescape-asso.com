import { z } from "zod";

export const appointmentSchema = z.object({
    type: z.enum(["DEPOT", "COLLECTE"]),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Format de date invalide"),
    notes: z.string().max(1000, "Les notes ne peuvent pas dépasser 1000 caractères").optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const donationSchema = z.object({
    donationType: z.enum(["ALIMENTAIRE", "VETEMENTS", "JOUETS", "ELECTROMENAGER", "AUTRE"]),
    quantity: z.number().positive("La quantité doit être strictement positive").min(0.1, "Quantité minimum : 0.1"),
    unit: z.enum(["KG", "PIECES", "CARTONS"]),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Format de date invalide"),
    notes: z.string().optional().or(z.literal("")),
    donorName: z.string().optional(),
});

export type DonationInput = z.infer<typeof donationSchema>;
