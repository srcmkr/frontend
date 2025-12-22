"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bot, User, Plus, Send, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import type { IncidentUpdate } from "@/types";

interface IncidentUpdatesListProps {
  updates: IncidentUpdate[];
  onAddUpdate?: (message: string) => void;
  onEditUpdate?: (updateId: string, newMessage: string) => void;
  onDeleteUpdate?: (updateId: string) => void;
  canAddUpdate: boolean;
  className?: string;
}

function formatDateTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IncidentUpdatesList({
  updates,
  onAddUpdate,
  onEditUpdate,
  onDeleteUpdate,
  canAddUpdate,
  className,
}: IncidentUpdatesListProps) {
  const t = useTranslations("incidents");
  const locale = useLocale();
  const [isAdding, setIsAdding] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [deleteUpdateId, setDeleteUpdateId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!newMessage.trim() || !onAddUpdate) return;

    setIsSubmitting(true);
    try {
      onAddUpdate(newMessage.trim());
      setNewMessage("");
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit();
    }
  };

  const handleStartEdit = (update: IncidentUpdate) => {
    setEditingUpdateId(update.id);
    setEditMessage(update.message);
  };

  const handleCancelEdit = () => {
    setEditingUpdateId(null);
    setEditMessage("");
  };

  const handleSaveEdit = () => {
    if (!editingUpdateId || !editMessage.trim() || !onEditUpdate) return;
    onEditUpdate(editingUpdateId, editMessage.trim());
    setEditingUpdateId(null);
    setEditMessage("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = () => {
    if (deleteUpdateId && onDeleteUpdate) {
      onDeleteUpdate(deleteUpdateId);
    }
    setDeleteUpdateId(null);
  };

  // Sort updates by createdAt descending (newest first)
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const canEditUpdates = !!onEditUpdate;
  const canDeleteUpdates = !!onDeleteUpdate;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("timeline.title")}
        </h3>
        {canAddUpdate && !isAdding && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("timeline.addUpdate")}
          </Button>
        )}
      </div>

      {/* Add Update Form */}
      {canAddUpdate && isAdding && (
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder={t("timeline.updatePlaceholder")}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] text-sm"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("timeline.cmdEnterToSend")}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewMessage("");
                }}
                disabled={isSubmitting}
              >
                {t("dialogs.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newMessage.trim() || isSubmitting}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {t("timeline.send")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Updates Timeline */}
      <div className="relative">
        {/* Timeline line */}
        {sortedUpdates.length > 1 && (
          <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-border" />
        )}

        {/* Updates */}
        <div className="space-y-4">
          {sortedUpdates.map((update) => (
            <div key={update.id} className="relative flex gap-3 group">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  update.isAutomatic
                    ? "bg-muted border-muted-foreground/30"
                    : "bg-primary/10 border-primary/30"
                )}
              >
                {update.isAutomatic ? (
                  <Bot className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <User className="h-3 w-3 text-primary" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                {/* Header */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      update.isAutomatic ? "text-muted-foreground" : ""
                    )}
                  >
                    {update.createdBy}
                  </span>
                  {/* Edit/Delete Actions - Button Group nach dem Benutzernamen */}
                  {!update.isAutomatic && (canEditUpdates || canDeleteUpdates) && (
                    <div className="inline-flex items-center rounded-md border border-transparent opacity-0 group-hover:opacity-100 group-hover:border-border transition-all bg-background shadow-sm">
                      {canEditUpdates && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 w-6 p-0 rounded-none first:rounded-l-md last:rounded-r-md",
                            canDeleteUpdates && "border-r border-border"
                          )}
                          onClick={() => handleStartEdit(update)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      {canDeleteUpdates && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-none first:rounded-l-md last:rounded-r-md text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteUpdateId(update.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  {update.isAutomatic && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">
                      {t("timeline.system")}
                    </span>
                  )}
                  {update.status === "resolved" && (
                    <span className="text-[10px] uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded">
                      {t("status.resolved")}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDateTime(update.createdAt, locale)}
                  </span>
                </div>

                {/* Message or Edit Form */}
                {editingUpdateId === update.id ? (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="min-h-[60px] text-sm"
                      autoFocus
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {t("timeline.cmdEnterToSave")}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          {t("dialogs.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          className="h-7"
                          onClick={handleSaveEdit}
                          disabled={!editMessage.trim()}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          {t("form.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {update.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {sortedUpdates.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("timeline.noUpdates")}
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteUpdateId}
        onOpenChange={(open) => !open && setDeleteUpdateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t("dialogs.deleteUpdateTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogs.deleteUpdateDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dialogs.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("dialogs.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
