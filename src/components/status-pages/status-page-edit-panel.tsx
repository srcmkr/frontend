"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useClientIp } from "@/features/status-pages/api/queries";
import {
  ChevronLeft,
  Loader2,
  Save,
  X,
  Settings,
  Layers,
  Palette,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Lock,
  Network,
  Plus,
  Trash2,
  Megaphone,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPageGroupEditor } from "./status-page-group-editor";
import { generateSlug } from "@/lib/slug-utils";
import type { StatusPage, StatusPageGroup, StatusPageFormData, Monitor, StatusPageAnnouncement, StatusPageMaintenance, AnnouncementType, StatusPageTheme } from "@/types";

interface StatusPageEditPanelProps {
  statusPage: StatusPage | null; // null for create
  monitors: Monitor[];
  existingSlugs: string[];
  onSave: (data: StatusPageFormData) => Promise<void> | void;
  onCancel: () => void;
  className?: string;
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
  showMaintenanceCalendar: true,
  showPoweredByBranding: true,
};

function getAnnouncementTypeConfig(t: ReturnType<typeof useTranslations<"statusPages">>): Record<AnnouncementType, { label: string; icon: React.ReactNode; className: string }> {
  return {
    info: { label: t("announcements.typeInfo"), icon: <Info className="h-4 w-4" />, className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
    warning: { label: t("announcements.typeWarning"), icon: <AlertTriangle className="h-4 w-4" />, className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400" },
    maintenance: { label: t("announcements.typeMaintenance"), icon: <Wrench className="h-4 w-4" />, className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
    success: { label: t("announcements.typeSuccess"), icon: <CheckCircle className="h-4 w-4" />, className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" },
  };
}

function getMaintenanceStatusConfig(t: ReturnType<typeof useTranslations<"statusPages">>): Record<string, { label: string; className: string }> {
  return {
    scheduled: { label: t("maintenance.statusScheduled"), className: "bg-blue-100 text-blue-700" },
    in_progress: { label: t("maintenance.statusInProgress"), className: "bg-amber-100 text-amber-700" },
    completed: { label: t("maintenance.statusCompleted"), className: "bg-green-100 text-green-700" },
    cancelled: { label: t("maintenance.statusCancelled"), className: "bg-zinc-100 text-zinc-600" },
  };
}

function getThemeConfig(t: ReturnType<typeof useTranslations<"statusPages">>): Record<StatusPageTheme, { label: string; description: string }> {
  return {
    system: { label: t("branding.themeSystem"), description: t("branding.themeSystemDescription") },
    basic: { label: t("branding.themeBasic"), description: t("branding.themeBasicDescription") },
    dark: { label: t("branding.themeDark"), description: t("branding.themeDarkDescription") },
    forest: { label: t("branding.themeForest"), description: t("branding.themeForestDescription") },
    slate: { label: t("branding.themeSlate"), description: t("branding.themeSlateDescription") },
    kiwi: { label: t("branding.themeKiwi"), description: t("branding.themeKiwiDescription") },
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

interface TabItemProps {
  value: string;
  icon: React.ReactNode;
  label: string;
  hasError?: boolean;
}

function TabItem({ value, icon, label, hasError }: TabItemProps) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {hasError && <span className="text-destructive">*</span>}
    </TabsTrigger>
  );
}

export function StatusPageEditPanel({
  statusPage,
  monitors,
  existingSlugs,
  onSave,
  onCancel,
  className,
}: StatusPageEditPanelProps) {
  const t = useTranslations("statusPages");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StatusPageFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: clientIpData } = useClientIp();
  const clientIp = clientIpData?.ipAddress;

  const isEditing = !!statusPage;
  const announcementTypeConfig = getAnnouncementTypeConfig(t);
  const maintenanceStatusConfig = getMaintenanceStatusConfig(t);
  const themeConfig = getThemeConfig(t);

  // Initialize form when statusPage changes
  useEffect(() => {
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
        theme: statusPage.theme,
        showUptimeHistory: statusPage.showUptimeHistory,
        uptimeHistoryDays: statusPage.uptimeHistoryDays ?? 90,
        showIncidents: statusPage.showIncidents,
        incidentHistoryDays: statusPage.incidentHistoryDays ?? 90,
        passwordProtection: statusPage.passwordProtection,
        password: statusPage.password,
        ipWhitelistEnabled: statusPage.ipWhitelistEnabled,
        ipWhitelist: statusPage.ipWhitelist,
        announcements: statusPage.announcements,
        scheduledMaintenances: statusPage.scheduledMaintenances,
        showMaintenanceCalendar: statusPage.showMaintenanceCalendar,
        showPoweredByBranding: statusPage.showPoweredByBranding,
      });
      setSlugManuallyEdited(true);
    } else {
      setFormData(defaultFormData);
      setSlugManuallyEdited(false);
    }
    setErrors({});
  }, [statusPage]);

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

    // Password is only required when:
    // 1. Creating a new status page with passwordProtection enabled, OR
    // 2. User has entered a password (then it must be valid)
    const isCreating = !statusPage; // No statusPage means we're creating
    const passwordEntered = formData.password && formData.password.length > 0;

    if (formData.passwordProtection) {
      // When creating, password is required
      if (isCreating && !passwordEntered) {
        newErrors.password = t("access.passwordRequired");
      }
      // When editing or creating, if password is entered, it must be valid (min 4 chars)
      else if (passwordEntered && formData.password!.length < 4) {
        newErrors.password = t("access.passwordMinLength");
      }
    }

    if (formData.ipWhitelistEnabled && formData.ipWhitelist.length === 0) {
      newErrors.ipWhitelist = t("access.ipRequired");
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
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} className="-ml-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("edit.back")}
          </Button>
          <div className="h-6 w-px bg-border" />
          <h2 className="text-lg font-semibold">
            {isEditing ? t("edit.editStatusPage") : t("edit.newStatusPage")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            {t("edit.cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {isEditing ? t("edit.save") : t("edit.create")}
          </Button>
        </div>
      </div>

      {/* Content with Tabs */}
      <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b px-4 py-2 shrink-0">
          <TabsList className="grid w-full grid-cols-6 max-w-3xl">
            <TabItem value="general" icon={<Settings className="h-4 w-4" />} label={t("tabs.general")} />
            <TabItem
              value="monitors"
              icon={<Layers className="h-4 w-4" />}
              label={t("tabs.monitors")}
              hasError={!!errors.groups}
            />
            <TabItem value="display" icon={<Eye className="h-4 w-4" />} label={t("tabs.display")} />
            <TabItem value="branding" icon={<Palette className="h-4 w-4" />} label={t("tabs.branding")} />
            <TabItem value="access" icon={<Shield className="h-4 w-4" />} label={t("tabs.access")} />
            <TabItem value="announcements" icon={<Megaphone className="h-4 w-4" />} label={t("tabs.announcements")} />
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* General Tab */}
          <TabsContent value="general" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.basicSettings")}</CardTitle>
                <CardDescription>
                  {t("form.basicSettingsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <span className="text-sm text-muted-foreground whitespace-nowrap">/status/</span>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitors Tab */}
          <TabsContent value="monitors" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.groupsAndMonitors")}</CardTitle>
                <CardDescription>
                  {t("form.groupsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldError message={errors.groups} />
                <StatusPageGroupEditor
                  groups={formData.groups}
                  monitors={monitors}
                  selectedMonitorIds={formData.monitors}
                  onChange={handleGroupsChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("display.uptimeDisplay")}</CardTitle>
                <CardDescription>
                  {t("display.uptimeDisplayDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {formData.showUptimeHistory && (
                  <div className="space-y-2 pt-2 border-t">
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
                      className="w-32"
                    />
                    <FieldError message={errors.uptimeHistoryDays} />
                    <p className="text-xs text-muted-foreground">
                      {t("display.uptimeHistoryDaysHint")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("display.incidents")}</CardTitle>
                <CardDescription>
                  {t("display.incidentsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {formData.showIncidents && (
                  <div className="space-y-2 pt-2 border-t">
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
                      className="w-32"
                    />
                    <FieldError message={errors.incidentHistoryDays} />
                    <p className="text-xs text-muted-foreground">
                      {t("display.incidentHistoryDaysHint")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("branding.logoAndColors")}</CardTitle>
                <CardDescription>
                  {t("branding.logoAndColorsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logo">{t("branding.logoUrl")}</Label>
                  <Input
                    id="logo"
                    value={formData.logo || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, logo: e.target.value || undefined }))
                    }
                    placeholder={t("branding.logoUrlPlaceholder")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("branding.logoUrlHint")}
                  </p>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">{t("branding.primaryColor")}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor || "#6366f1"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, primaryColor: undefined }))
                        }
                      >
                        {t("branding.resetColor")}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label htmlFor="theme">{t("branding.theme")}</Label>
                  <Select
                    value={formData.theme || "system"}
                    onValueChange={(value: StatusPageTheme) =>
                      setFormData((prev) => ({
                        ...prev,
                        theme: value === "system" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(themeConfig) as StatusPageTheme[]).map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          <div className="flex flex-col">
                            <span>{themeConfig[theme].label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {themeConfig[formData.theme || "system"].description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("branding.customCss")}</CardTitle>
                <CardDescription>
                  {t("branding.customCssDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="customCss"
                  value={formData.customCss || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCss: e.target.value || undefined,
                    }))
                  }
                  placeholder={`:root {
  --primary: #6366f1;
  --background: #fafafa;
}

.status-page-header {
  /* Custom header styles */
}`}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("branding.customCssHint")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("branding.poweredByBranding")}</CardTitle>
                <CardDescription>
                  {t("branding.poweredByBrandingDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showPoweredByBranding">
                      {t("branding.showPoweredByBranding")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.showPoweredByBranding
                        ? t("branding.poweredByBrandingVisible")
                        : t("branding.poweredByBrandingHidden")}
                    </p>
                  </div>
                  <Switch
                    id="showPoweredByBranding"
                    checked={formData.showPoweredByBranding}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPoweredByBranding: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Tab */}
          <TabsContent value="access" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("access.visibility")}</CardTitle>
                <CardDescription>
                  {t("access.visibilityDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        formData.isPublic
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="isPublic">{t("access.publicAccess")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.isPublic
                          ? t("access.publicAccessYes")
                          : t("access.publicAccessNo")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({ ...prev, isPublic: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("access.passwordProtection")}</CardTitle>
                <CardDescription>
                  {t("access.passwordProtectionDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        formData.passwordProtection
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="passwordProtection">{t("access.enablePasswordProtection")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.passwordProtection
                          ? t("access.passwordProtectionEnabled")
                          : t("access.passwordProtectionDisabled")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="passwordProtection"
                    checked={formData.passwordProtection}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({
                        ...prev,
                        passwordProtection: checked,
                        password: checked ? prev.password : undefined,
                      }))
                    }
                  />
                </div>

                {formData.passwordProtection && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="password">
                      {t("access.password")}
                      {!statusPage && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {statusPage?.passwordProtection && (
                      <p className="text-sm text-muted-foreground">
                        {t("access.passwordKeepCurrent")}
                      </p>
                    )}
                    <div className="flex gap-2 max-w-sm">
                      <div className="relative flex-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              password: e.target.value || undefined,
                            }))
                          }
                          placeholder={
                            statusPage?.passwordProtection
                              ? t("access.passwordPlaceholderEdit")
                              : t("access.passwordPlaceholder")
                          }
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <FieldError message={errors.password} />
                    <p className="text-xs text-muted-foreground">
                      {t("access.passwordHint")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("access.ipWhitelist")}</CardTitle>
                <CardDescription>
                  {t("access.ipWhitelistDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        formData.ipWhitelistEnabled
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      <Network className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="ipWhitelistEnabled">{t("access.enableIpWhitelist")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.ipWhitelistEnabled
                          ? t("access.ipWhitelistEnabled")
                          : t("access.ipWhitelistDisabled")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="ipWhitelistEnabled"
                    checked={formData.ipWhitelistEnabled}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({
                        ...prev,
                        ipWhitelistEnabled: checked,
                      }))
                    }
                  />
                </div>

                {formData.ipWhitelistEnabled && (
                  <div className="space-y-3 pt-2 border-t">
                    <Label>{t("access.ipAddresses")}</Label>
                    <FieldError message={errors.ipWhitelist} />

                    <div className="space-y-2">
                      {formData.ipWhitelist.map((ip, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={ip}
                            onChange={(e) => {
                              const newList = [...formData.ipWhitelist];
                              newList[index] = e.target.value;
                              setFormData((prev) => ({ ...prev, ipWhitelist: newList }));
                            }}
                            placeholder={t("access.ipPlaceholder")}
                            className="font-mono max-w-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newList = formData.ipWhitelist.filter((_, i) => i !== index);
                              setFormData((prev) => ({ ...prev, ipWhitelist: newList }));
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          ipWhitelist: [...prev.ipWhitelist, ""],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t("access.addIp")}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      {t("access.ipHint")}
                    </p>

                    {clientIp && (
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Deine aktuelle IP-Adresse:
                          </p>
                          <code className="text-sm font-mono">{clientIp}</code>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(clientIp);
                            // You could add a toast notification here
                          }}
                        >
                          Kopieren
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="mt-0 space-y-6">
            {/* Announcements Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("announcements.title")}</CardTitle>
                    <CardDescription>
                      {t("announcements.description")}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAnnouncement: StatusPageAnnouncement = {
                        id: `ann-${Date.now()}`,
                        title: "",
                        message: "",
                        type: "info",
                        enabled: true,
                        pinned: false,
                        createdAt: new Date().toISOString(),
                      };
                      setFormData((prev) => ({
                        ...prev,
                        announcements: [...prev.announcements, newAnnouncement],
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("announcements.addAnnouncement")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.announcements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t("announcements.noAnnouncements")}</p>
                    <p className="text-xs">{t("announcements.noAnnouncementsHint")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.announcements.map((announcement, index) => (
                      <div
                        key={announcement.id}
                        className={cn(
                          "border rounded-lg p-4 space-y-3",
                          !announcement.enabled && "opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Title & Type */}
                            <div className="flex items-center gap-3">
                              <Input
                                value={announcement.title}
                                onChange={(e) => {
                                  const newList = [...formData.announcements];
                                  newList[index] = { ...announcement, title: e.target.value };
                                  setFormData((prev) => ({ ...prev, announcements: newList }));
                                }}
                                placeholder={t("announcements.announcementTitle")}
                                className="flex-1"
                              />
                              <Select
                                value={announcement.type}
                                onValueChange={(value: AnnouncementType) => {
                                  const newList = [...formData.announcements];
                                  newList[index] = { ...announcement, type: value };
                                  setFormData((prev) => ({ ...prev, announcements: newList }));
                                }}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(announcementTypeConfig) as AnnouncementType[]).map((type) => (
                                    <SelectItem key={type} value={type}>
                                      <div className="flex items-center gap-2">
                                        {announcementTypeConfig[type].icon}
                                        {announcementTypeConfig[type].label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Message */}
                            <Textarea
                              value={announcement.message}
                              onChange={(e) => {
                                const newList = [...formData.announcements];
                                newList[index] = { ...announcement, message: e.target.value };
                                setFormData((prev) => ({ ...prev, announcements: newList }));
                              }}
                              placeholder={t("announcements.message")}
                              rows={2}
                            />

                            {/* Options Row */}
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`ann-enabled-${index}`}
                                  checked={announcement.enabled}
                                  onCheckedChange={(checked) => {
                                    const newList = [...formData.announcements];
                                    newList[index] = { ...announcement, enabled: checked };
                                    setFormData((prev) => ({ ...prev, announcements: newList }));
                                  }}
                                />
                                <Label htmlFor={`ann-enabled-${index}`} className="text-sm">{t("announcements.active")}</Label>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`ann-pinned-${index}`}
                                  checked={announcement.pinned}
                                  onCheckedChange={(checked) => {
                                    const newList = [...formData.announcements];
                                    newList[index] = { ...announcement, pinned: checked };
                                    setFormData((prev) => ({ ...prev, announcements: newList }));
                                  }}
                                />
                                <Label htmlFor={`ann-pinned-${index}`} className="text-sm">{t("announcements.pinToTop")}</Label>
                              </div>

                              <div className="flex items-center gap-2">
                                <Label className="text-sm text-muted-foreground">{t("announcements.from")}</Label>
                                <Input
                                  type="datetime-local"
                                  value={announcement.startAt ? announcement.startAt.slice(0, 16) : ""}
                                  onChange={(e) => {
                                    const newList = [...formData.announcements];
                                    newList[index] = {
                                      ...announcement,
                                      startAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                                    };
                                    setFormData((prev) => ({ ...prev, announcements: newList }));
                                  }}
                                  className="w-[180px] h-8 text-sm"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Label className="text-sm text-muted-foreground">{t("announcements.until")}</Label>
                                <Input
                                  type="datetime-local"
                                  value={announcement.endAt ? announcement.endAt.slice(0, 16) : ""}
                                  onChange={(e) => {
                                    const newList = [...formData.announcements];
                                    newList[index] = {
                                      ...announcement,
                                      endAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                                    };
                                    setFormData((prev) => ({ ...prev, announcements: newList }));
                                  }}
                                  className="w-[180px] h-8 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newList = formData.announcements.filter((_, i) => i !== index);
                              setFormData((prev) => ({ ...prev, announcements: newList }));
                            }}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Maintenances Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("maintenance.title")}</CardTitle>
                    <CardDescription>
                      {t("maintenance.description")}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // morgen
                      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 Stunden

                      const newMaintenance: StatusPageMaintenance = {
                        id: `maint-${Date.now()}`,
                        title: "",
                        description: "",
                        affectedGroups: [],
                        scheduledStart: start.toISOString(),
                        scheduledEnd: end.toISOString(),
                        notifyBefore: 1440, // 24 Stunden
                        autoStart: true,
                        status: "scheduled",
                        createdAt: new Date().toISOString(),
                      };
                      setFormData((prev) => ({
                        ...prev,
                        scheduledMaintenances: [...prev.scheduledMaintenances, newMaintenance],
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("maintenance.addMaintenance")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.scheduledMaintenances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t("maintenance.noMaintenances")}</p>
                    <p className="text-xs">{t("maintenance.noMaintenancesHint")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.scheduledMaintenances.map((maintenance, index) => (
                      <div
                        key={maintenance.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Title & Status */}
                            <div className="flex items-center gap-3">
                              <Input
                                value={maintenance.title}
                                onChange={(e) => {
                                  const newList = [...formData.scheduledMaintenances];
                                  newList[index] = { ...maintenance, title: e.target.value };
                                  setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                }}
                                placeholder={t("maintenance.maintenanceTitle")}
                                className="flex-1"
                              />
                              <Badge className={maintenanceStatusConfig[maintenance.status]?.className}>
                                {maintenanceStatusConfig[maintenance.status]?.label}
                              </Badge>
                            </div>

                            {/* Description */}
                            <Textarea
                              value={maintenance.description}
                              onChange={(e) => {
                                const newList = [...formData.scheduledMaintenances];
                                newList[index] = { ...maintenance, description: e.target.value };
                                setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                              }}
                              placeholder={t("maintenance.maintenanceDescription")}
                              rows={2}
                            />

                            {/* Time Range */}
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Label className="text-sm">{t("maintenance.start")}</Label>
                                <Input
                                  type="datetime-local"
                                  value={maintenance.scheduledStart.slice(0, 16)}
                                  onChange={(e) => {
                                    const newList = [...formData.scheduledMaintenances];
                                    newList[index] = {
                                      ...maintenance,
                                      scheduledStart: new Date(e.target.value).toISOString(),
                                    };
                                    setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                  }}
                                  className="w-[200px] h-8 text-sm"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Label className="text-sm">{t("maintenance.end")}</Label>
                                <Input
                                  type="datetime-local"
                                  value={maintenance.scheduledEnd.slice(0, 16)}
                                  onChange={(e) => {
                                    const newList = [...formData.scheduledMaintenances];
                                    newList[index] = {
                                      ...maintenance,
                                      scheduledEnd: new Date(e.target.value).toISOString(),
                                    };
                                    setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                  }}
                                  className="w-[200px] h-8 text-sm"
                                />
                              </div>
                            </div>

                            {/* Affected Groups */}
                            <div className="space-y-2">
                              <Label className="text-sm">{t("maintenance.affectedGroups")}</Label>
                              <div className="flex flex-wrap gap-2">
                                {formData.groups.map((group) => (
                                  <Badge
                                    key={group.id}
                                    variant={maintenance.affectedGroups.includes(group.id) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      const newList = [...formData.scheduledMaintenances];
                                      const affected = maintenance.affectedGroups.includes(group.id)
                                        ? maintenance.affectedGroups.filter((id) => id !== group.id)
                                        : [...maintenance.affectedGroups, group.id];
                                      newList[index] = { ...maintenance, affectedGroups: affected };
                                      setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                    }}
                                  >
                                    {group.name}
                                  </Badge>
                                ))}
                                {formData.groups.length === 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {t("maintenance.noGroupsHint")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Options Row */}
                            <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm text-muted-foreground">{t("maintenance.notification")}</Label>
                                <Select
                                  value={maintenance.notifyBefore.toString()}
                                  onValueChange={(value) => {
                                    const newList = [...formData.scheduledMaintenances];
                                    newList[index] = { ...maintenance, notifyBefore: parseInt(value) };
                                    setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                  }}
                                >
                                  <SelectTrigger className="w-[160px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">{t("maintenance.notifyNone")}</SelectItem>
                                    <SelectItem value="60">{t("maintenance.notify1h")}</SelectItem>
                                    <SelectItem value="360">{t("maintenance.notify6h")}</SelectItem>
                                    <SelectItem value="720">{t("maintenance.notify12h")}</SelectItem>
                                    <SelectItem value="1440">{t("maintenance.notify24h")}</SelectItem>
                                    <SelectItem value="2880">{t("maintenance.notify48h")}</SelectItem>
                                    <SelectItem value="10080">{t("maintenance.notify1w")}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`maint-autostart-${index}`}
                                  checked={maintenance.autoStart}
                                  onCheckedChange={(checked) => {
                                    const newList = [...formData.scheduledMaintenances];
                                    newList[index] = { ...maintenance, autoStart: checked };
                                    setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                  }}
                                />
                                <Label htmlFor={`maint-autostart-${index}`} className="text-sm">
                                  {t("maintenance.autoStart")}
                                </Label>
                              </div>

                              {maintenance.status !== "scheduled" && (
                                <Select
                                  value={maintenance.status}
                                  onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") => {
                                    const newList = [...formData.scheduledMaintenances];
                                    newList[index] = { ...maintenance, status: value };
                                    setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                                  }}
                                >
                                  <SelectTrigger className="w-[160px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="scheduled">{t("maintenance.statusScheduled")}</SelectItem>
                                    <SelectItem value="in_progress">{t("maintenance.statusInProgress")}</SelectItem>
                                    <SelectItem value="completed">{t("maintenance.statusCompleted")}</SelectItem>
                                    <SelectItem value="cancelled">{t("maintenance.statusCancelled")}</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newList = formData.scheduledMaintenances.filter((_, i) => i !== index);
                              setFormData((prev) => ({ ...prev, scheduledMaintenances: newList }));
                            }}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Calendar Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>{t("maintenanceCalendar.title")}</CardTitle>
                <CardDescription>
                  {t("maintenanceCalendar.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        formData.showMaintenanceCalendar
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <Label htmlFor="showMaintenanceCalendar">{t("maintenanceCalendar.showCalendar")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.showMaintenanceCalendar
                          ? t("maintenanceCalendar.calendarVisible")
                          : t("maintenanceCalendar.calendarHidden")}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="showMaintenanceCalendar"
                    checked={formData.showMaintenanceCalendar}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) => ({ ...prev, showMaintenanceCalendar: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
