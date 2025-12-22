"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus, Mail, Webhook, MoreHorizontal, Trash2, Pencil } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  notificationSettingsSchema,
  type NotificationSettingsFormData,
} from "@/lib/validations/settings";
import {
  defaultNotificationSettings,
  mockNotificationChannels,
  type NotificationChannel,
} from "@/mocks/settings";
import { NotificationChannelDialog } from "./notification-channel-dialog";
import type { NotificationChannelFormData } from "@/lib/validations/notification-channel";

export function NotificationSettings() {
  const t = useTranslations("settings");
  const [channels, setChannels] = useState<NotificationChannel[]>(mockNotificationChannels);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<NotificationChannel | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: defaultNotificationSettings,
  });

  const onSubmit = (data: NotificationSettingsFormData) => {
    // TODO: API call
    console.log("Saving notification settings:", data);
    toast.success(t("notificationSettings.saved"));
  };

  const handleOpenDeleteDialog = (channel: NotificationChannel) => {
    setChannelToDelete(channel);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (channelToDelete) {
      setChannels((prev) => prev.filter((ch) => ch.id !== channelToDelete.id));
      toast.success(t("notificationSettings.channelDeleted"));
      setChannelToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleOpenCreate = () => {
    setEditingChannel(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setDialogOpen(true);
  };

  const handleSaveChannel = (data: NotificationChannelFormData) => {
    // Build the config with proper typing
    const config = data.type === "email"
      ? {
          apiKey: data.config.apiKey,
          fromEmail: data.config.fromEmail,
          toEmails: data.config.toEmails,
        }
      : {
          url: data.config.url,
          headers: data.config.headers,
        };

    if (editingChannel) {
      // Update existing channel
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === editingChannel.id
            ? {
                id: ch.id,
                createdAt: ch.createdAt,
                name: data.name,
                type: data.type,
                enabled: data.enabled,
                config,
              }
            : ch
        )
      );
      toast.success(t("notificationSettings.channelUpdated"));
    } else {
      // Create new channel
      const newChannel: NotificationChannel = {
        id: `ch-${Date.now()}`,
        name: data.name,
        type: data.type,
        enabled: data.enabled,
        config,
        createdAt: new Date().toISOString(),
      };
      setChannels((prev) => [...prev, newChannel]);
      toast.success(t("notificationSettings.channelCreated"));
    }
  };

  return (
    <div className="space-y-8">
      {/* Channels Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{t("notificationSettings.channelsTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("notificationSettings.channelsDescription")}
            </p>
          </div>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1" />
            {t("notificationSettings.addChannel")}
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("notificationSettings.tableColumns.name")}</TableHead>
                <TableHead>{t("notificationSettings.tableColumns.type")}</TableHead>
                <TableHead>{t("notificationSettings.tableColumns.status")}</TableHead>
                <TableHead className="text-right">{t("notificationSettings.tableColumns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {t("notificationSettings.noChannels")}
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((channel) => (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">{channel.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {channel.type === "email" ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Webhook className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="capitalize">{channel.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={channel.enabled ? "default" : "secondary"}>
                        {channel.enabled ? t("notificationSettings.statusActive") : t("notificationSettings.statusInactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(channel)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t("notificationSettings.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleOpenDeleteDialog(channel)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("notificationSettings.delete")}
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

      {/* Global Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-1">{t("notificationSettings.globalTitle")}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("notificationSettings.globalDescription")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Failure Threshold */}
          <div className="space-y-2">
            <Label htmlFor="failureThreshold">{t("notificationSettings.failureThreshold")}</Label>
            <Input
              id="failureThreshold"
              type="number"
              className="max-w-[200px]"
              {...register("failureThreshold", { valueAsNumber: true })}
            />
            {errors.failureThreshold && (
              <p className="text-sm text-destructive">{errors.failureThreshold.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("notificationSettings.failureThresholdHint")}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={!isDirty}>
            {t("notificationSettings.save")}
          </Button>
        </div>
      </form>

      {/* Notification Channel Dialog */}
      <NotificationChannelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        channel={editingChannel}
        onSave={handleSaveChannel}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("notificationSettings.deleteChannelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("notificationSettings.deleteChannelDescription", { name: channelToDelete?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("notificationSettings.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t("notificationSettings.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
