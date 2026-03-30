import { describe, it, expect } from "vitest";
import { appointmentSchema, donationSchema } from "@/lib/validations/appointment-donation";

const validFutureDate = new Date(Date.now() + 86400000).toISOString(); // tomorrow

describe("Appointment Validation", () => {
    const validAppointment = {
        type: "DEPOT" as const,
        date: validFutureDate,
        notes: "Dépôt de cartons de vêtements",
    };

    it("should accept a valid DEPOT appointment", () => {
        expect(appointmentSchema.safeParse(validAppointment).success).toBe(true);
    });

    it("should accept a valid COLLECTE appointment", () => {
        expect(appointmentSchema.safeParse({ ...validAppointment, type: "COLLECTE" }).success).toBe(true);
    });

    it("should reject an invalid type", () => {
        expect(appointmentSchema.safeParse({ ...validAppointment, type: "LIVRAISON" }).success).toBe(false);
    });

    it("should reject an invalid date format", () => {
        expect(appointmentSchema.safeParse({ ...validAppointment, date: "25/02/2026" }).success).toBe(false);
    });

    it("should accept an appointment without notes (optional)", () => {
        const { notes: _, ...withoutNotes } = validAppointment;
        expect(appointmentSchema.safeParse(withoutNotes).success).toBe(true);
    });

    it("should reject notes longer than 1000 chars", () => {
        expect(appointmentSchema.safeParse({ ...validAppointment, notes: "A".repeat(1001) }).success).toBe(false);
    });
});

describe("Donation Validation", () => {
    const validDonation = {
        donationType: "ALIMENTAIRE" as const,
        quantity: 25.5,
        unit: "KG" as const,
        date: new Date().toISOString(),
        notes: "Conserves et pâtes",
    };

    it("should accept a valid alimentaire donation in KG", () => {
        expect(donationSchema.safeParse(validDonation).success).toBe(true);
    });

    const donationTypes = ["ALIMENTAIRE", "VETEMENTS", "JOUETS", "ELECTROMENAGER", "AUTRE"] as const;
    donationTypes.forEach((type) => {
        it(`should accept donation type: ${type}`, () => {
            expect(donationSchema.safeParse({ ...validDonation, donationType: type }).success).toBe(true);
        });
    });

    const units = ["KG", "PIECES", "CARTONS"] as const;
    units.forEach((unit) => {
        it(`should accept unit: ${unit}`, () => {
            expect(donationSchema.safeParse({ ...validDonation, unit }).success).toBe(true);
        });
    });

    it("should reject an unknown donation type", () => {
        expect(donationSchema.safeParse({ ...validDonation, donationType: "MOBILIER" }).success).toBe(false);
    });

    it("should reject a negative quantity", () => {
        expect(donationSchema.safeParse({ ...validDonation, quantity: -5 }).success).toBe(false);
    });

    it("should reject zero quantity", () => {
        expect(donationSchema.safeParse({ ...validDonation, quantity: 0 }).success).toBe(false);
    });
});
