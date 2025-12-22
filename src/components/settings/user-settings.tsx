"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createUserSchema,
  createUserEditSchema,
  createUserPasswordSchema,
  type UserFormData,
  type UserEditFormData,
  type UserPasswordFormData,
} from "@/lib/validations/settings";
import { useUsers } from "@/features/settings";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types";

// Mock: Simuliert den aktuell eingeloggten Benutzer (erster Benutzer)
const CURRENT_USER_ID = "user-1";

export function UserSettings() {
  const t = useTranslations("settings");
  const tValidation = useTranslations();
  const locale = useLocale();

  // Create validation schemas with translations
  const userSchema = createUserSchema(tValidation as unknown as (key: string) => string);
  const userEditSchema = createUserEditSchema(tValidation as unknown as (key: string) => string);
  const userPasswordSchema = createUserPasswordSchema(tValidation as unknown as (key: string) => string);

  // Fetch users using React Query
  const { data: fetchedUsers = [], isLoading } = useUsers();

  // Local state for optimistic updates (until we have mutations)
  const [localUsers, setLocalUsers] = useState<User[] | null>(null);
  const users = localUsers ?? fetchedUsers;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const isCurrentUser = (userId: string) => userId === CURRENT_USER_ID;

  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const editForm = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
  });

  const passwordForm = useForm<UserPasswordFormData>({
    resolver: zodResolver(userPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return t("users.relativeTime.never");
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("users.relativeTime.today");
    if (diffDays === 1) return t("users.relativeTime.yesterday");
    if (diffDays < 7) return t("users.relativeTime.daysAgo", { days: diffDays });
    return formatDate(dateString);
  };

  const onCreateUser = (data: UserFormData) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      status: "active",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    setLocalUsers((prev) => [...(prev ?? fetchedUsers), newUser]);
    toast.success(t("users.toast.created"));
    createForm.reset();
    setIsCreateOpen(false);
  };

  const onEditUser = (data: UserEditFormData) => {
    if (!editUser) return;

    setLocalUsers((prev) =>
      (prev ?? fetchedUsers).map((u) =>
        u.id === editUser.id ? { ...u, name: data.name, email: data.email } : u
      )
    );
    toast.success(t("users.toast.updated"));
    setEditUser(null);
  };

  const handleOpenEdit = (user: User) => {
    editForm.reset({ name: user.name, email: user.email });
    setEditUser(user);
  };

  const handleOpenPasswordChange = (user: User) => {
    passwordForm.reset({ password: "", confirmPassword: "" });
    setPasswordUser(user);
  };

  const onChangePassword = () => {
    if (!passwordUser) return;
    toast.success(t("users.toast.passwordChanged", { name: passwordUser.name }));
    setPasswordUser(null);
    passwordForm.reset();
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setLocalUsers((prev) =>
      (prev ?? fetchedUsers).map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    toast.success(
      newStatus === "active" ? t("users.toast.activated") : t("users.toast.deactivated")
    );
  };

  const handleDeleteUser = () => {
    if (deleteUserId) {
      setLocalUsers((prev) => (prev ?? fetchedUsers).filter((u) => u.id !== deleteUserId));
      toast.success(t("users.toast.deleted"));
      setDeleteUserId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("users.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("users.description")}
            </p>
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("users.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("users.description")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("users.newUser")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createForm.handleSubmit(onCreateUser)}>
              <DialogHeader>
                <DialogTitle>{t("users.createDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("users.createDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">{t("users.createDialog.name")}</Label>
                  <Input
                    id="create-name"
                    placeholder={t("users.createDialog.namePlaceholder")}
                    {...createForm.register("name")}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">{t("users.createDialog.email")}</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder={t("users.createDialog.emailPlaceholder")}
                    {...createForm.register("email")}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">{t("users.createDialog.password")}</Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder={t("users.createDialog.passwordPlaceholder")}
                    {...createForm.register("password")}
                  />
                  {createForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-confirmPassword">
                    {t("users.createDialog.confirmPassword")}
                  </Label>
                  <Input
                    id="create-confirmPassword"
                    type="password"
                    placeholder={t("users.createDialog.confirmPasswordPlaceholder")}
                    {...createForm.register("confirmPassword")}
                  />
                  {createForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  {t("users.createDialog.cancel")}
                </Button>
                <Button type="submit">{t("users.createDialog.create")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <form onSubmit={editForm.handleSubmit(onEditUser)}>
            <DialogHeader>
              <DialogTitle>{t("users.editDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("users.editDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("users.editDialog.name")}</Label>
                <Input id="edit-name" {...editForm.register("name")} />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t("users.editDialog.email")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register("email")}
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUser(null)}
              >
                {t("users.editDialog.cancel")}
              </Button>
              <Button type="submit">{t("users.editDialog.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!passwordUser} onOpenChange={() => setPasswordUser(null)}>
        <DialogContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
            <DialogHeader>
              <DialogTitle>{t("users.passwordDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("users.passwordDialog.description", { name: passwordUser?.name ?? "" })}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("users.passwordDialog.newPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={t("users.passwordDialog.newPasswordPlaceholder")}
                  {...passwordForm.register("password")}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">
                  {t("users.passwordDialog.confirmPassword")}
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder={t("users.passwordDialog.confirmPasswordPlaceholder")}
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordUser(null)}
              >
                {t("users.passwordDialog.cancel")}
              </Button>
              <Button type="submit">{t("users.passwordDialog.change")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("users.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              {t("users.deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("users.tableColumns.name")}</TableHead>
              <TableHead>{t("users.tableColumns.email")}</TableHead>
              <TableHead>{t("users.tableColumns.status")}</TableHead>
              <TableHead>{t("users.tableColumns.lastLogin")}</TableHead>
              <TableHead className="text-right">{t("users.tableColumns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {t("users.noUsers")}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">
                    {user.name}
                    {isCurrentUser(user.id) && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t("users.you")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status === "active" ? t("users.statusActive") : t("users.statusInactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {formatRelativeTime(user.lastLoginAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("users.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenPasswordChange(user)}
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          {t("users.changePassword")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrentUser(user.id)}
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              {t("users.deactivate")}
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              {t("users.activate")}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteUserId(user.id)}
                          disabled={isCurrentUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("users.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
