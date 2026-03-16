"use client";

import { useState, useEffect, useCallback } from "react";
import {
    UserCog,
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    User as UserIcon,
    Mail,
    Shield,
    Briefcase,
    Phone,
    X,
    Check,
    Loader2
} from "lucide-react";
import { UserService, User } from "@/lib/user-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function UsersSettingsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentUser) {
                await UserService.updateUser(currentUser.id, data as any);
                toast.success("User updated successfully");
            } else {
                await UserService.createUser(data as any);
                toast.success("User created successfully");
            }
            setIsFormOpen(false);
            fetchUsers();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Something went wrong";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsSubmitting(true);
        try {
            await UserService.deleteUser(deleteId);
            toast.success("User deleted successfully");
            setDeleteId(null);
            setIsDeleting(false);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <UserCog size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">Users Management</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your team accounts, roles and permissions.</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setCurrentUser(null);
                        setIsFormOpen(true);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-6 gap-2 shadow-lg shadow-orange-500/20 py-6"
                >
                    <Plus size={18} />
                    <span className="font-bold">Add New User</span>
                </Button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search by name, email, role or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-amber-500"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 italic">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border-2 border-white dark:border-zinc-800">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold tracking-tight",
                                                user.role === "Admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                    user.role === "Staff" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" :
                                                        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            )}>
                                                {user.role || "User"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                            {user.designation || <span className="text-zinc-300 italic">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                            {user.phone || <span className="text-zinc-300 italic">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-xl">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setCurrentUser(user);
                                                            setIsFormOpen(true);
                                                        }}
                                                        className="gap-2.5 rounded-lg cursor-pointer"
                                                    >
                                                        <Edit2 size={14} className="text-indigo-500" />
                                                        <span className="text-xs font-bold">Edit User</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setDeleteId(user.id);
                                                            setIsDeleting(true);
                                                        }}
                                                        className="gap-2.5 rounded-lg cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span className="text-xs font-bold">Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0">
                    <form onSubmit={handleSave}>
                        <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                            <DialogTitle className="text-xl font-extrabold tracking-tight">{currentUser ? "Edit User Account" : "Create New User"}</DialogTitle>
                            <DialogDescription className="text-white/80 text-sm mt-1">{currentUser ? "Modify user details below." : "Enter details for the new team member."}</DialogDescription>
                        </div>
                        <div className="p-6 space-y-4 bg-white dark:bg-zinc-900">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <Input id="name" name="name" defaultValue={currentUser?.name} placeholder="John Doe" className="pl-10 rounded-xl" required />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <Input id="email" name="email" type="email" defaultValue={currentUser?.email} placeholder="john@example.com" className="pl-10 rounded-xl" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Role</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <select name="role" id="role" defaultValue={currentUser?.role || ""} className="w-full pl-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none">
                                            <option value="">Select Role</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Designation</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <Input id="designation" name="designation" defaultValue={currentUser?.designation} placeholder="Web Developer" className="pl-10 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <Input id="phone" name="phone" defaultValue={currentUser?.phone} placeholder="+1 234 567 890" className="pl-10 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{currentUser ? "New Password (Optional)" : "Account Password"}</Label>
                                    <Input id="password" name="password" type="password" placeholder="••••••••" className="rounded-xl" required={!currentUser} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-full px-6 font-bold">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (currentUser ? "Update User" : "Save User")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent className="rounded-2xl border-0 shadow-2xl p-0 overflow-hidden max-w-sm">
                    <div className="bg-red-500 p-6 text-white text-center">
                        <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-extrabold tracking-tight">Delete Account?</h3>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            Are you sure you want to delete this user? This action is permanent and cannot be undone.
                        </p>
                    </div>
                    <div className="p-6 pt-0 flex flex-col gap-2">
                        <Button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-6 font-bold shadow-lg shadow-red-500/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                            Confirm Delete
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleting(false)}
                            className="w-full rounded-full py-6 font-bold text-zinc-400"
                        >
                            Wait, Keep it
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
