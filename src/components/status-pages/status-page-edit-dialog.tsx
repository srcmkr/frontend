"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPageGroupEditor } from "./status-page-group-editor";
import { generateSlug } from "@/mocks/status-pages";
import type { StatusPage, StatusPageGroup, StatusPageFormData, Monitor } from "@/types";

interface StatusPageEditDialogProps {
  statusPage: StatusPage | null; // null for create
  monitors: Monitor[];
  existingSlugs: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: StatusPageFormData) => Promise<void> | void;
}

const defaultFormData: StatusPageFormData = {
  title: "",
  slug: "",
  description: "",
  monitors: [],
  groups: [],
  isPublic: true,
  showUptimeHistory: true,
  uptimeHistoryDays: 90,
  showIncidents: true,
  incidentHistoryDays: 90,
  passwordProtection: false,
  password: undefined,
  ipWhitelistEnabled: false,
  ipWhitelist: [],
  announcements: [],
  scheduledMaintenances: [],
  showMaintenanceCalendar: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

export function StatusPageEditDialog({
  statusPage,
  monitors,
  existingSlugs,
  open,
  onOpenChange,
  onSave,
}: StatusPageEditDialogProps) {
  const t = useTranslations("statusPages");
  const tCommon = useTranslations("common.form");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StatusPageFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const isEditing = !!statusPage;

  // Reset form when dialog opens or statusPage changes
  useEffect(() => {
    if (open) {
      if (statusPage) {
        setFormData({
          title: statusPage.title,
          slug: statusPage.slug,
          description: statusPage.description,
          monitors: statusPage.monitors,
          groups: statusPage.groups,
          isPublic: statusPage.isPublic,
          customCss: statusPage.customCss,
          logo: statusPage.logo,
          primaryColor: statusPage.primaryColor,
          showUptimeHistory: statusPage.showUptimeHistory,
          uptimeHistoryDays: statusPage.uptimeHistoryDays,
          showIncidents: statusPage.showIncidents,
          incidentHistoryDays: statusPage.incidentHistoryDays,
          passwordProtection: statusPage.passwordProtection,
          password: statusPage.password,
          ipWhitelistEnabled: statusPage.ipWhitelistEnabled,
          ipWhitelist: statusPage.ipWhitelist,
          announcements: statusPage.announcements,
          scheduledMaintenances: statusPage.scheduledMaintenances,
          showMaintenanceCalendar: statusPage.showMaintenanceCalendar,
        });
        setSlugManuallyEdited(true);
      } else {
        setFormData(defaultFormData);
        setSlugManuallyEdited(false);
      }
      setErrors({});
    }
  }, [open, statusPage]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const newSlug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t("form.titleRequired");
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t("form.slugRequired");
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t("form.slugInvalidChars");
    } else if (existingSlugs.includes(formData.slug)) {
      newErrors.slug = t("form.slugAlreadyUsed");
    }

    if (formData.uptimeHistoryDays < 1 || formData.uptimeHistoryDays > 365) {
      newErrors.uptimeHistoryDays = t("display.uptimeHistoryDaysError");
    }

    if (formData.incidentHistoryDays < 1 || formData.incidentHistoryDays > 365) {
      newErrors.incidentHistoryDays = t("display.incidentHistoryDaysError");
    }

    if (formData.groups.length === 0) {
      newErrors.groups = t("form.groupRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, existingSlugs, t]);

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGroupsChange = useCallback(
    (groups: StatusPageGroup[], monitorIds: string[]) => {
      setFormData((prev) => ({
        ...prev,
        groups,
        monitors: monitorIds,
      }));
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("edit.editStatusPage") : t("edit.newStatusPage")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("edit.editDescription")
              : t("edit.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">{t("tabs.general")}</TabsTrigger>
            <TabsTrigger value="monitors">
              {t("tabs.monitors")} & {t("header.groups")}
              {errors.groups && <span className="ml-1 text-destructive">*</span>}
            </TabsTrigger>
            <TabsTrigger value="display">{t("tabs.display")}</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-0">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{t("form.title")} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t("form.titlePlaceholder")}
                />
                <FieldError message={errors.title} />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{t("form.urlSlug")} *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/status/</span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder={t("form.slugPlaceholder")}
                    className="font-mono"
                  />
                </div>
                <FieldError message={errors.slug} />
                <p className="text-xs text-muted-foreground">
                  {t("form.slugHintChars")}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t("form.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={t("form.descriptionPlaceholder")}
                  rows={3}
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="isPublic">{t("access.publicAccess")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("access.publicAccessYes")}
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                  }
                />
              </div>
            </TabsContent>

            {/* Monitors Tab */}
            <TabsContent value="monitors" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">{t("form.groupsAndMonitors")}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t("form.groupsDescription")}
                  </p>
                  <FieldError message={errors.groups} />
                </div>
                <StatusPageGroupEditor
                  groups={formData.groups}
                  monitors={monitors}
                  selectedMonitorIds={formData.monitors}
                  onChange={handleGroupsChange}
                />
              </div>
            </TabsContent>

            {/* Display Tab */}
            <TabsContent value="display" className="space-y-4 mt-0">
              {/* Show Uptime History */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="showUptimeHistory">{t("display.showUptimeHistory")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("display.showUptimeHistoryHint")}
                  </p>
                </div>
                <Switch
                  id="showUptimeHistory"
                  checked={formData.showUptimeHistory}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, showUptimeHistory: checked }))
                  }
                />
              </div>

              {/* Uptime History Days */}
              {formData.showUptimeHistory && (
                <div className="space-y-2">
                  <Label htmlFor="uptimeHistoryDays">{t("display.uptimeHistoryDays")}</Label>
                  <Input
                    id="uptimeHistoryDays"
                    type="number"
                    min={1}
                    max={365}
                    value={formData.uptimeHistoryDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        uptimeHistoryDays: parseInt(e.target.value) || 90,
                      }))
                    }
                    className="w-24"
                  />
                  <FieldError message={errors.uptimeHistoryDays} />
                </div>
              )}

              {/* Show Incidents */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="showIncidents">{t("display.showIncidents")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("display.showIncidentsHint")}
                  </p>
                </div>
                <Switch
                  id="showIncidents"
                  checked={formData.showIncidents}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, showIncidents: checked }))
                  }
                />
              </div>

              {/* Incident History Days */}
              {formData.showIncidents && (
                <div className="space-y-2">
                  <Label htmlFor="incidentHistoryDays">{t("display.incidentHistoryDays")}</Label>
                  <Input
                    id="incidentHistoryDays"
                    type="number"
                    min={1}
                    max={365}
                    value={formData.incidentHistoryDays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        incidentHistoryDays: parseInt(e.target.value) || 90,
                      }))
                    }
                    className="w-24"
                  />
                  <FieldError message={errors.incidentHistoryDays} />
                </div>
              )}

              {/* Logo URL */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="logo">{t("branding.logoUrl")} ({tCommon("optional")})</Label>
                <Input
                  id="logo"
                  value={formData.logo || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, logo: e.target.value || undefined }))
                  }
                  placeholder={t("branding.logoUrlPlaceholder")}
                />
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">{t("branding.primaryColor")} ({tCommon("optional")})</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    value={formData.primaryColor || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primaryColor: e.target.value || undefined,
                      }))
                    }
                    placeholder="#6366f1"
                    className="font-mono w-32"
                  />
                  {formData.primaryColor && (
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                  )}
                </div>
              </div>

              {/* Custom CSS */}
              <div className="space-y-2">
                <Label htmlFor="customCss">{t("branding.customCss")} ({tCommon("optional")})</Label>
                <Textarea
                  id="customCss"
                  value={formData.customCss || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCss: e.target.value || undefined,
                    }))
                  }
                  placeholder=":root { --primary: #6366f1; }"
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {t("branding.customCssHint")}
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("edit.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? t("edit.save") : t("edit.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
