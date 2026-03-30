import { z } from "zod";

export const accountingEntrySchema = z.object({
    type: z.enum(["RECETTE", "DEPENSE"]),
    amount: z.number().positive("Le montant doit être positif").max(99999.99, "Le montant maximum est de 99999.99"),
    category: z.enum(["ACHAT", "LOYER", "EVENEMENT", "DON_RECU", "VENTE", "AUTRE"]),
    description: z.string().min(3, "La description doit contenir au moins 3 caractères").max(500, "La description est trop longue"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Format de date invalide"),
});

export type AccountingEntryInput = z.infer<typeof accountingEntrySchema>;
