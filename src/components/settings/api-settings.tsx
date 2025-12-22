"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Copy, Trash2, Key, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { createApiKeySchema, type ApiKeyFormData } from "@/lib/validations/settings";
import { useApiKeys, type ApiKey } from "@/features/settings";

export function ApiSettings() {
  const t = useTranslations("settings");
  const tValidation = useTranslations();
  const locale = useLocale();

  // Fetch API keys using React Query
  const { data: fetchedKeys = [], isLoading } = useApiKeys();

  // Local state for optimistic updates (until we have mutations)
  const [localKeys, setLocalKeys] = useState<ApiKey[] | null>(null);
  const keys = localKeys ?? fetchedKeys;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const apiKeySchema = createApiKeySchema(tValidation as unknown as (key: string) => string);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return t("api.relativeTime.never");
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("api.relativeTime.today");
    if (diffDays === 1) return t("api.relativeTime.yesterday");
    if (diffDays < 7) return t("api.relativeTime.daysAgo", { days: diffDays });
    return formatDate(dateString);
  };

  const generateApiKey = () => {
    // Generate a mock API key
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let key = "sk_live_";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const onCreateKey = (data: ApiKeyFormData) => {
    const fullKey = generateApiKey();
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: data.name,
      keyPreview: `${fullKey.substring(0, 12)}****...${fullKey.substring(fullKey.length - 4)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setLocalKeys((prev) => [...(prev ?? fetchedKeys), newKey]);
    setNewKeyValue(fullKey);
    reset();
  };

  const handleCopyKey = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      toast.success(t("api.toast.copied"));
    }
  };

  const handleCloseNewKeyDialog = () => {
    setNewKeyValue(null);
    setIsCreateOpen(false);
  };

  const handleDeleteKey = () => {
    if (deleteKeyId) {
      setLocalKeys((prev) => (prev ?? fetchedKeys).filter((k) => k.id !== deleteKeyId));
      toast.success(t("api.toast.deleted"));
      setDeleteKeyId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("api.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("api.description")}
            </p>
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("api.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("api.description")}
          </p>
        </div>
        <Dialog open={isCreateOpen && !newKeyValue} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("api.newKey")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onCreateKey)}>
              <DialogHeader>
                <DialogTitle>{t("api.createDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("api.createDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">{t("api.createDialog.name")}</Label>
                  <Input
                    id="keyName"
                    placeholder={t("api.createDialog.namePlaceholder")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t("api.createDialog.cancel")}
                </Button>
                <Button type="submit">{t("api.createDialog.create")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display Dialog */}
      <Dialog open={!!newKeyValue} onOpenChange={handleCloseNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("api.keyCreatedDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("api.keyCreatedDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm break-all">
              <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
              {newKeyValue}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCopyKey}>
              <Copy className="h-4 w-4 mr-2" />
              {t("api.keyCreatedDialog.copy")}
            </Button>
            <Button variant="outline" onClick={handleCloseNewKeyDialog}>
              {t("api.keyCreatedDialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("api.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("api.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("api.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("api.deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keys Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("api.tableColumns.name")}</TableHead>
              <TableHead>{t("api.tableColumns.key")}</TableHead>
              <TableHead>{t("api.tableColumns.created")}</TableHead>
              <TableHead>{t("api.tableColumns.lastUsed")}</TableHead>
              <TableHead className="text-right">{t("api.tableColumns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {t("api.noKeys")}
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {key.keyPreview}
                    </code>
                  </TableCell>
                  <TableCell>{formatDate(key.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{formatRelativeTime(key.lastUsed)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteKeyId(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Usage Hint */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">{t("api.usage.title")}</h4>
        <p className="text-sm text-muted-foreground mb-2">
          {t("api.usage.description")}
        </p>
        <code className="block text-sm bg-background p-3 rounded border">
          {t("api.usage.example")}
        </code>
      </div>
    </div>
  );
}
