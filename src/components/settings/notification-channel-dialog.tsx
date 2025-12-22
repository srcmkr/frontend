"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus, X, Mail, Webhook, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createNotificationChannelSchema,
  type NotificationChannelFormData,
  type EmailChannelFormData,
} from "@/lib/validations/notification-channel";
import type { NotificationChannel, EmailConfig, WebhookConfig } from "@/mocks/settings";

interface NotificationChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: NotificationChannel;
  onSave: (data: NotificationChannelFormData) => void;
}

type ChannelType = "email" | "webhook";

// Default values for each channel type
const defaultEmailValues: EmailChannelFormData = {
  type: "email",
  name: "",
  enabled: true,
  config: {
    apiKey: "",
    fromEmail: "",
    toEmails: [],
  },
};

export function NotificationChannelDialog({
  open,
  onOpenChange,
  channel,
  onSave,
}: NotificationChannelDialogProps) {
  const t = useTranslations("settings");
  const tValidations = useTranslations();
  const notificationChannelSchema = createNotificationChannelSchema(tValidations as unknown as (key: string) => string);
  const isEditing = !!channel;
  const [channelType, setChannelType] = useState<ChannelType>(channel?.type ?? "email");
  const [toEmails, setToEmails] = useState<string[]>(
    channel?.type === "email" ? (channel.config as EmailConfig).toEmails : []
  );
  const [newEmail, setNewEmail] = useState("");
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    channel?.type === "webhook" && (channel.config as WebhookConfig).headers
      ? Object.entries((channel.config as WebhookConfig).headers!).map(([key, value]) => ({ key, value }))
      : []
  );
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  // Build initial default values
  const getDefaultValues = (): NotificationChannelFormData => {
    if (channel) {
      if (channel.type === "email") {
        return {
          type: "email",
          name: channel.name,
          enabled: channel.enabled,
          config: channel.config as EmailConfig,
        };
      } else {
        return {
          type: "webhook",
          name: channel.name,
          enabled: channel.enabled,
          config: channel.config as WebhookConfig,
        };
      }
    }
    return defaultEmailValues;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NotificationChannelFormData>({
    resolver: zodResolver(notificationChannelSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when dialog opens/closes or channel changes
  useEffect(() => {
    if (open) {
      if (channel) {
        setChannelType(channel.type);
        if (channel.type === "email") {
          setToEmails((channel.config as EmailConfig).toEmails);
          setHeaders([]);
          reset({
            type: "email",
            name: channel.name,
            enabled: channel.enabled,
            config: channel.config as EmailConfig,
          });
        } else {
          setToEmails([]);
          const webhookConfig = channel.config as WebhookConfig;
          setHeaders(
            webhookConfig.headers
              ? Object.entries(webhookConfig.headers).map(([key, value]) => ({ key, value }))
              : []
          );
          reset({
            type: "webhook",
            name: channel.name,
            enabled: channel.enabled,
            config: webhookConfig,
          });
        }
      } else {
        setChannelType("email");
        setToEmails([]);
        setHeaders([]);
        reset(defaultEmailValues);
      }
    }
  }, [open, channel, reset]);

  // Update form when channel type changes
  const handleTypeChange = (newType: ChannelType) => {
    setChannelType(newType);
    const currentName = watch("name");

    if (newType === "email") {
      reset({
        type: "email",
        name: currentName,
        enabled: true,
        config: {
          apiKey: "",
          fromEmail: "",
          toEmails: [],
        },
      });
      setToEmails([]);
      setHeaders([]);
    } else {
      reset({
        type: "webhook",
        name: currentName,
        enabled: true,
        config: {
          url: "",
          headers: undefined,
        },
      });
      setToEmails([]);
      setHeaders([]);
    }
  };

  const handleAddEmail = () => {
    if (newEmail && newEmail.includes("@")) {
      const updated = [...toEmails, newEmail];
      setToEmails(updated);
      setValue("config.toEmails" as keyof NotificationChannelFormData, updated as never);
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (index: number) => {
    const updated = toEmails.filter((_, i) => i !== index);
    setToEmails(updated);
    setValue("config.toEmails" as keyof NotificationChannelFormData, updated as never);
  };

  const handleAddHeader = () => {
    if (newHeaderKey) {
      const updated = [...headers, { key: newHeaderKey, value: newHeaderValue }];
      setHeaders(updated);
      const headersObj = Object.fromEntries(updated.map((h) => [h.key, h.value]));
      setValue("config.headers" as keyof NotificationChannelFormData, headersObj as never);
      setNewHeaderKey("");
      setNewHeaderValue("");
    }
  };

  const handleRemoveHeader = (index: number) => {
    const updated = headers.filter((_, i) => i !== index);
    setHeaders(updated);
    const headersObj = updated.length > 0
      ? Object.fromEntries(updated.map((h) => [h.key, h.value]))
      : undefined;
    setValue("config.headers" as keyof NotificationChannelFormData, headersObj as never);
  };

  const handleTest = async () => {
    // Validate required fields before testing
    const currentValues = watch();

    if (!currentValues.name) {
      toast.error(t("channelDialog.errorName"));
      return;
    }

    if (channelType === "email") {
      const config = currentValues.config as { apiKey?: string; fromEmail?: string };
      if (!config.apiKey) {
        toast.error(t("channelDialog.errorApiKey"));
        return;
      }
      if (!config.fromEmail) {
        toast.error(t("channelDialog.errorFromEmail"));
        return;
      }
      if (toEmails.length === 0) {
        toast.error(t("channelDialog.errorNoRecipients"));
        return;
      }
    } else {
      const config = currentValues.config as { url?: string };
      if (!config.url) {
        toast.error(t("channelDialog.errorWebhookUrl"));
        return;
      }
    }

    toast.info(t("channelDialog.testSending"));
    // TODO: Implement actual test notification
    setTimeout(() => {
      toast.success(t("channelDialog.testSuccess"));
    }, 1500);
  };

  const onSubmit = (data: NotificationChannelFormData) => {
    // Add emails/headers to the data
    if (data.type === "email") {
      (data.config as EmailConfig).toEmails = toEmails;
    } else {
      const headersObj = headers.length > 0
        ? Object.fromEntries(headers.map((h) => [h.key, h.value]))
        : undefined;
      (data.config as WebhookConfig).headers = headersObj;
    }
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("channelDialog.editTitle") : t("channelDialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("channelDialog.editDescription")
              : t("channelDialog.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Channel Type Selection */}
          <div className="space-y-2">
            <Label>{t("channelDialog.channelType")}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={channelType === "email" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTypeChange("email")}
              >
                <Mail className="h-4 w-4 mr-2" />
                {t("channelDialog.email")}
              </Button>
              <Button
                type="button"
                variant={channelType === "webhook" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleTypeChange("webhook")}
              >
                <Webhook className="h-4 w-4 mr-2" />
                {t("channelDialog.webhook")}
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("channelDialog.name")}</Label>
            <Input
              id="name"
              placeholder={t("channelDialog.namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email-specific fields */}
          {channelType === "email" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">{t("channelDialog.resendApiKey")}</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="re_..."
                  {...register("config.apiKey" as keyof NotificationChannelFormData)}
                />
                {errors.config && "apiKey" in (errors.config as object) && (
                  <p className="text-sm text-destructive">
                    {(errors.config as { apiKey?: { message?: string } }).apiKey?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">{t("channelDialog.fromEmail")}</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder={t("channelDialog.fromEmailPlaceholder")}
                  {...register("config.fromEmail" as keyof NotificationChannelFormData)}
                />
                {errors.config && "fromEmail" in (errors.config as object) && (
                  <p className="text-sm text-destructive">
                    {(errors.config as { fromEmail?: { message?: string } }).fromEmail?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("channelDialog.recipients")}</Label>
                <div className="space-y-2">
                  {toEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={email} disabled className="flex-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEmail(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder={t("channelDialog.recipientPlaceholder")}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddEmail();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddEmail}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {errors.config && "toEmails" in (errors.config as object) && (
                  <p className="text-sm text-destructive">
                    {(errors.config as { toEmails?: { message?: string } }).toEmails?.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Webhook-specific fields */}
          {channelType === "webhook" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="url">{t("channelDialog.webhookUrl")}</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder={t("channelDialog.webhookUrlPlaceholder")}
                  {...register("config.url" as keyof NotificationChannelFormData)}
                />
                {errors.config && "url" in (errors.config as object) && (
                  <p className="text-sm text-destructive">
                    {(errors.config as { url?: { message?: string } }).url?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("channelDialog.httpHeaders")}</Label>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={header.key} disabled className="flex-1" />
                      <Input value={header.value} disabled className="flex-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveHeader(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={t("channelDialog.headerName")}
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder={t("channelDialog.headerValue")}
                      value={newHeaderValue}
                      onChange={(e) => setNewHeaderValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHeader();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddHeader}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("channelDialog.cancel")}
            </Button>
            <Button type="button" variant="secondary" onClick={handleTest}>
              <Send className="h-4 w-4 mr-2" />
              {t("channelDialog.test")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? t("channelDialog.save") : t("channelDialog.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
