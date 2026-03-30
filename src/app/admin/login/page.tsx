"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("Email ou mot de passe incorrect.");
            } else {
                router.push("/admin/dashboard");
                router.refresh();
            }
        } catch {
            setError("Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-primary/10 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-pacifico text-primary">Rescape Admin</h1>
                    <p className="text-dark/70 font-lato mt-2">Accès réservé aux membres du bureau</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-dark font-nunito">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full text-base px-4 py-3 rounded-xl border border-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="votre@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-dark font-nunito">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full text-base px-4 py-3 rounded-xl border border-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full font-bold text-lg"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
