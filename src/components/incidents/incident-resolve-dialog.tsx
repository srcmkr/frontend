"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("incidents.resolveDialog");
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
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("description", { title: incident.title })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resolve-message">{t("messageLabel")}</Label>
            <Textarea
              id="resolve-message"
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t("messageHint")}
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
            {t("cancel")}
          </Button>
          <Button
            onClick={handleResolve}
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("resolving")}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("markResolved")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
