"use client";

import { useState } from "react";
import { UserForm } from "./UserForm";
import { deleteUser } from "@/actions/users";
import { isDirectionRole } from "@/lib/roles";
import { UserPlus, Trash2, Mail, Shield, Building, Search } from "lucide-react";
import { toast } from "sonner";

interface UserListProps {
    users: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        organizationName: string | null;
        createdAt: Date;
    }[];
    currentUser: {
        id: string;
        role: string;
    };
}

const roleLabels: Record<string, { label: string; bg: string; text: string }> = {
    SUPER_ADMIN: { label: "Super Admin", bg: "bg-slate-900", text: "text-white" },
    DIRECTION: { label: "Direction", bg: "bg-emerald-100", text: "text-emerald-700" },
    BENEVOLE: { label: "Bénévole", bg: "bg-blue-100", text: "text-blue-700" },
    PARTENAIRE: { label: "Partenaire", bg: "bg-amber-100", text: "text-amber-700" },
};

export function UserList({ users, currentUser }: UserListProps) {
    const [showForm, setShowForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserListProps['users'][0] | null>(null);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);

        try {
            await deleteUser(userToDelete.id);
            toast.success("Utilisateur supprimé");
            setUserToDelete(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                        <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Accès</h1>
                        <p className="text-sm text-slate-500 font-medium">Contrôlez les permissions et les membres du portail</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setUserToEdit(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200 uppercase tracking-widest"
                >
                    <UserPlus className="w-4 h-4" />
                    Ajouter un membre
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un membre par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {filteredUsers.length} Membres trouvés
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Membre</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Rôle & Accès</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Organisation</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date d&apos;ajout</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => {
                                const isSuperAdminRow = user.role === "SUPER_ADMIN";
                                const isCurrentUserSuperAdmin = currentUser.role === "SUPER_ADMIN";
                                const canModify = !isSuperAdminRow || isCurrentUserSuperAdmin;

                                return (
                                    <tr
                                        key={user.id}
                                        onClick={() => {
                                            if (canModify) {
                                                setUserToEdit(user);
                                                setShowForm(true);
                                            } else {
                                                toast.error("Vous ne pouvez pas modifier un Super Administrateur.");
                                            }
                                        }}
                                        className={`transition-all group ${canModify ? 'cursor-pointer hover:bg-emerald-50/30' : 'cursor-not-allowed bg-slate-50/50 opacity-70'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 group-hover:bg-white group-hover:border-emerald-200 transition-colors">
                                                    {user.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors">{user.name || "Sans nom"}</p>
                                                    <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="text-xs font-medium">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${isDirectionRole(user.role) ? roleLabels["DIRECTION"].bg : (roleLabels[user.role]?.bg || "bg-slate-100")} ${isDirectionRole(user.role) ? roleLabels["DIRECTION"].text : (roleLabels[user.role]?.text || "text-slate-600")}`}>
                                                {isDirectionRole(user.role) ? user.role : (roleLabels[user.role]?.label || user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-tight">
                                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                                {user.organizationName || "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {canModify && user.id !== currentUser.id && (
                                                <button
                                                    onClick={() => setUserToDelete({ id: user.id, name: user.name || user.email })}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                                    title="Supprimer cet accès"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modale de Confirmation de Suppression */}
            {userToDelete && (
                <div role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-2">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 id="delete-dialog-title" className="text-2xl font-black text-slate-800 tracking-tight">Supprimer l&apos;accès ?</h3>
                                <p className="text-slate-500 font-medium leading-relaxed px-4">
                                    Voulez-vous vraiment retirer les accès de <span className="text-slate-900 font-bold underline decoration-red-200 underline-offset-4">{userToDelete.name}</span> ?
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
                                >
                                    {isDeleting ? "Suppression..." : "Confirmer la suppression"}
                                </button>
                                <button
                                    disabled={isDeleting}
                                    onClick={() => setUserToDelete(null)}
                                    className="w-full py-4 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <UserForm
                    user={userToEdit || undefined}
                    onClose={() => {
                        setShowForm(false);
                        setUserToEdit(null);
                    }}
                />
            )}
        </div>
    );
}
