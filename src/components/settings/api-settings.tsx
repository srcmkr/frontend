"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Key, Clock } from "lucide-react";
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
import { apiKeySchema, type ApiKeyFormData } from "@/lib/validations/settings";
import { mockApiKeys, type ApiKey } from "@/mocks/settings";

export function ApiSettings() {
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Nie";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Heute";
    if (diffDays === 1) return "Gestern";
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
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

    setKeys((prev) => [...prev, newKey]);
    setNewKeyValue(fullKey);
    reset();
  };

  const handleCopyKey = () => {
    if (newKeyValue) {
      navigator.clipboard.writeText(newKeyValue);
      toast.success("API-Key in Zwischenablage kopiert");
    }
  };

  const handleCloseNewKeyDialog = () => {
    setNewKeyValue(null);
    setIsCreateOpen(false);
  };

  const handleDeleteKey = () => {
    if (deleteKeyId) {
      setKeys((prev) => prev.filter((k) => k.id !== deleteKeyId));
      toast.success("API-Key gelöscht");
      setDeleteKeyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API-Keys</h3>
          <p className="text-sm text-muted-foreground">
            Verwalte API-Keys für externe Integrationen
          </p>
        </div>
        <Dialog open={isCreateOpen && !newKeyValue} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Neuer API-Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onCreateKey)}>
              <DialogHeader>
                <DialogTitle>Neuen API-Key erstellen</DialogTitle>
                <DialogDescription>
                  Gib einen Namen für den API-Key ein, um ihn später identifizieren zu können.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Name</Label>
                  <Input
                    id="keyName"
                    placeholder="z.B. Grafana Integration"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">Erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display Dialog */}
      <Dialog open={!!newKeyValue} onOpenChange={handleCloseNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API-Key erstellt</DialogTitle>
            <DialogDescription>
              Kopiere den API-Key jetzt. Er wird nur einmal angezeigt!
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
              Kopieren
            </Button>
            <Button variant="outline" onClick={handleCloseNewKeyDialog}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API-Key löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Integrationen,
              die diesen Key verwenden, werden nicht mehr funktionieren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keys Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead>Zuletzt verwendet</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Keine API-Keys vorhanden
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
        <h4 className="font-medium mb-2">API-Verwendung</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Verwende den API-Key im Authorization-Header:
        </p>
        <code className="block text-sm bg-background p-3 rounded border">
          Authorization: Bearer sk_live_xxxxx...
        </code>
      </div>
    </div>
  );
}
