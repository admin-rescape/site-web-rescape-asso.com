"use client";

import { useState, useEffect } from "react";
import { createUser, updateUser } from "@/actions/users";
import { Button } from "@/components/ui/Button";
import { X, UserPlus, Shield, Building, Mail, Lock, UserCog } from "lucide-react";
import { toast } from "sonner";

interface UserFormProps {
    onClose: () => void;
    user?: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        organizationName: string | null;
    };
}

export function UserForm({ onClose, user }: UserFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "BENEVOLE",
        organizationName: "",
        password: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email,
                role: user.role,
                organizationName: user.organizationName || "",
                password: "", // On ne charge pas le mot de passe existant
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (user) {
                await updateUser(user.id, formData);
                toast.success("Utilisateur mis à jour");
            } else {
                await createUser(formData);
                toast.success("Utilisateur créé avec succès");
            }
            onClose();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de l'opération";
            toast.error(message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-900 px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            {user ? <UserCog className="w-5 h-5 text-emerald-400" /> : <UserPlus className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <h2 className="text-xl font-bold text-white font-nunito">
                            {user ? "Modifier l'accès" : "Nouvel Utilisateur"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nom complet</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                                    placeholder="Ex: Jean Dupont"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Adresse Email</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                                    placeholder="jean@exemple.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Rôle</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                                >
                                    <option value="BENEVOLE">Bénévole</option>
                                    <option value="PARTENAIRE">Partenaire</option>
                                    <option value="TRESORIERE">Trésorière</option>
                                    <option value="TRESORIER">Trésorier</option>
                                    <option value="DIRECTRICE">Directrice</option>
                                    <option value="DIRECTEUR">Directeur</option>
                                    <option value="DIRECTEUR ADJOINT">Directeur Adjoint</option>
                                    <option value="DIRECTRICE ADJOINTE">Directrice Adjointe</option>
                                    <option value="DIRECTION">Direction</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                    {user ? "Nouv. Pass" : "Mot de passe"}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                                        placeholder={user ? "Laisser vide pour ne pas changer" : "Min. 8 caractères (obligatoire)"}
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.role === "PARTENAIRE" && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nom de l&apos;Organisation</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.organizationName}
                                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                                        placeholder="Ex: Entreprise Solidaire"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl py-6 font-bold uppercase tracking-widest text-xs border-slate-200 hover:bg-slate-50"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-xl py-6 font-bold uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        >
                            {isLoading ? "En cours..." : (user ? "Mettre à jour" : "Créer le compte")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
