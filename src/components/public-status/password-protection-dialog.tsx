"use client";

import { useState } from "react";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PasswordProtectionDialogProps {
  slug: string;
  /** Called when user submits password - returns true if valid */
  onSubmit: (password: string) => Promise<boolean>;
  /** External loading state */
  isLoading?: boolean;
  /** External error message */
  error?: string | null;
}

export function PasswordProtectionDialog({
  onSubmit,
  isLoading = false,
  error: externalError,
}: PasswordProtectionDialogProps) {
  const [password, setPassword] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState("");

  const loading = isLoading || internalLoading;
  const error = externalError || internalError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError("");
    setInternalLoading(true);

    try {
      const success = await onSubmit(password);
      if (!success) {
        setPassword("");
      }
    } catch {
      setInternalError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
      setPassword("");
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <DialogTitle className="text-center">Zugriff geschützt</DialogTitle>
          <DialogDescription className="text-center">
            Diese Status-Seite ist passwortgeschützt. Bitte geben Sie das
            Passwort ein, um fortzufahren.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="Passwort eingeben..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!password || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Überprüfen...
              </>
            ) : (
              "Zugriff anfordern"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
