"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ExtendedIncident } from "@/types";

interface IncidentResolveDialogProps {
  incident: ExtendedIncident;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (incidentId: string, message: string) => Promise<void>;
}

export function IncidentResolveDialog({
  incident,
  open,
  onOpenChange,
  onResolve,
}: IncidentResolveDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await onResolve(incident.id, message.trim());
      setMessage("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Vorfall beheben
          </DialogTitle>
          <DialogDescription>
            Markiere &quot;{incident.title}&quot; als behoben und füge eine
            Abschlussnachricht hinzu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resolve-message">Abschlussnachricht</Label>
            <Textarea
              id="resolve-message"
              placeholder="z.B. Problem wurde durch Neustart des Servers behoben..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Diese Nachricht wird der Timeline hinzugefügt und der Status auf
              &quot;Behoben&quot; gesetzt.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleResolve}
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Beheben...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Als behoben markieren
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
