"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Globe,
  Server,
  Radio,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  monitorFormSchema,
  monitorToFormValues,
  formValuesToMonitorUpdate,
  defaultsByType,
  defaultHttpConfig,
  defaultTcpConfig,
  defaultDnsConfig,
  defaultPingConfig,
  type MonitorFormValues,
} from "@/lib/validations/monitor";
import type { Monitor, MonitorType, HttpMethod, DnsRecordType, AuthType } from "@/types";

// ============================================
// Types
// ============================================

interface MonitorEditDialogProps {
  monitor: Monitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (monitorId: string, data: Partial<Monitor>) => Promise<void> | void;
}

interface TypeOption {
  value: MonitorType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// ============================================
// Constants
// ============================================

const MONITOR_TYPES: TypeOption[] = [
  {
    value: "http",
    label: "HTTP(S)",
    description: "Websites und APIs überwachen",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: "tcp",
    label: "TCP",
    description: "Port-Verfügbarkeit prüfen",
    icon: <Server className="h-4 w-4" />,
  },
  {
    value: "ping",
    label: "Ping",
    description: "ICMP-Erreichbarkeit testen",
    icon: <Radio className="h-4 w-4" />,
  },
  {
    value: "dns",
    label: "DNS",
    description: "DNS-Auflösung prüfen",
    icon: <Search className="h-4 w-4" />,
  },
];

const HTTP_METHODS: { value: HttpMethod; label: string }[] = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "HEAD", label: "HEAD" },
  { value: "PUT", label: "PUT" },
  { value: "PATCH", label: "PATCH" },
  { value: "DELETE", label: "DELETE" },
];

const DNS_RECORD_TYPES: { value: DnsRecordType; label: string; description: string }[] = [
  { value: "A", label: "A", description: "IPv4-Adresse" },
  { value: "AAAA", label: "AAAA", description: "IPv6-Adresse" },
  { value: "MX", label: "MX", description: "Mail-Server" },
  { value: "CNAME", label: "CNAME", description: "Alias" },
  { value: "TXT", label: "TXT", description: "Text-Record" },
  { value: "NS", label: "NS", description: "Nameserver" },
];

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none", label: "Keine" },
  { value: "basic", label: "Basic Auth" },
  { value: "bearer", label: "Bearer Token" },
];

const INTERVAL_PRESETS = [
  { value: 10, label: "10s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
  { value: 600, label: "10m" },
];

const SLA_PRESETS = [
  { value: 99, label: "99%" },
  { value: 99.9, label: "99.9%" },
  { value: 99.95, label: "99.95%" },
  { value: 99.99, label: "99.99%" },
];

// ============================================
// Helper Components
// ============================================

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground mt-1">{children}</p>;
}

function PresetButtons({
  presets,
  currentValue,
  onSelect,
}: {
  presets: { value: number; label: string }[];
  currentValue: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {presets.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          variant={currentValue === preset.value ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onSelect(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function MonitorEditDialog({
  monitor,
  open,
  onOpenChange,
  onSave,
}: MonitorEditDialogProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorFormSchema),
    defaultValues: monitorToFormValues(monitor),
  });

  // Watch form values for conditional rendering
  const watchedType = useWatch({ control, name: "type" });
  const watchedInterval = useWatch({ control, name: "interval" });
  const watchedSlaTarget = useWatch({ control, name: "slaTarget" });
  const watchedRetries = useWatch({ control, name: "retries" });
  const watchedAuthType = useWatch({ control, name: "config.http.authType" });
  const watchedMethod = useWatch({ control, name: "config.http.method" });
  const watchedDnsRecordType = useWatch({ control, name: "config.dns.recordType" });

  // Reset form when monitor changes or dialog opens
  useEffect(() => {
    if (open) {
      const values = monitorToFormValues(monitor);
      reset(values);
      setAdvancedOpen(false);
      setShowPassword(false);
      setHeaders([]);
    }
  }, [monitor, open, reset]);

  // Handle type change - update defaults and clear type-specific config
  const handleTypeChange = useCallback(
    (newType: MonitorType) => {
      const defaults = defaultsByType[newType];
      setValue("type", newType, { shouldDirty: true });
      setValue("interval", defaults.interval, { shouldDirty: true });
      setValue("timeout", defaults.timeout, { shouldDirty: true });
      setValue("maxResponseTime", defaults.maxResponseTime, { shouldDirty: true });

      // Set type-specific config
      switch (newType) {
        case "http":
          setValue("config", { http: { ...defaultHttpConfig } }, { shouldDirty: true });
          setValue("url", "https://", { shouldDirty: true });
          break;
        case "tcp":
          setValue("config", { tcp: { ...defaultTcpConfig } }, { shouldDirty: true });
          setValue("url", "", { shouldDirty: true });
          break;
        case "dns":
          setValue("config", { dns: { ...defaultDnsConfig } }, { shouldDirty: true });
          setValue("url", "", { shouldDirty: true });
          break;
        case "ping":
          setValue("config", { ping: { ...defaultPingConfig } }, { shouldDirty: true });
          setValue("url", "", { shouldDirty: true });
          break;
      }
    },
    [setValue]
  );

  const onSubmit = async (data: MonitorFormValues) => {
    const updates = formValuesToMonitorUpdate(data);
    await onSave(monitor.id, updates);
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset(monitorToFormValues(monitor));
    onOpenChange(false);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
    // Update form value
    const headersObj = newHeaders.reduce(
      (acc, h) => (h.key ? { ...acc, [h.key]: h.value } : acc),
      {}
    );
    setValue("config.http.headers", headersObj, { shouldDirty: true });
  };

  // ============================================
  // Render
  // ============================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monitor bearbeiten</DialogTitle>
          <DialogDescription>
            Konfiguration für &quot;{monitor.name}&quot; anpassen
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ============================================ */}
          {/* Basic Configuration */}
          {/* ============================================ */}
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="z.B. Production API"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Monitor-Typ</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MONITOR_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                      watchedType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className={watchedType === type.value ? "text-primary" : "text-muted-foreground"}>
                      {type.icon}
                    </span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              <FieldError message={errors.type?.message} />
            </div>

            {/* Type-specific Address Fields */}
            {watchedType === "http" && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/health"
                  {...register("url")}
                  aria-invalid={!!errors.url}
                />
                <FieldHint>Vollständige URL inkl. Protokoll (https://)</FieldHint>
                <FieldError message={errors.url?.message} />
              </div>
            )}

            {watchedType === "tcp" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="tcp-host">Host (DNS / IP)</Label>
                  <Input
                    id="tcp-host"
                    placeholder="db.example.com oder 192.168.1.1"
                    {...register("config.tcp.host")}
                    aria-invalid={!!errors.config?.tcp?.host}
                  />
                  <FieldError message={errors.config?.tcp?.host?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tcp-port">Port</Label>
                  <Input
                    id="tcp-port"
                    type="number"
                    placeholder="5432"
                    min={1}
                    max={65535}
                    {...register("config.tcp.port", { valueAsNumber: true })}
                    aria-invalid={!!errors.config?.tcp?.port}
                  />
                  <FieldError message={errors.config?.tcp?.port?.message} />
                </div>
              </div>
            )}

            {watchedType === "dns" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dns-domain">Domain</Label>
                  <Input
                    id="dns-domain"
                    placeholder="example.com"
                    {...register("config.dns.domain")}
                    aria-invalid={!!errors.config?.dns?.domain}
                  />
                  <FieldError message={errors.config?.dns?.domain?.message} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Record-Typ</Label>
                    <Select
                      value={watchedDnsRecordType || "A"}
                      onValueChange={(v) =>
                        setValue("config.dns.recordType", v as DnsRecordType, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DNS_RECORD_TYPES.map((rt) => (
                          <SelectItem key={rt.value} value={rt.value}>
                            <span className="font-mono">{rt.label}</span>
                            <span className="text-muted-foreground ml-2">- {rt.description}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dns-expected">Erwartetes Ergebnis</Label>
                    <Input
                      id="dns-expected"
                      placeholder="Optional"
                      {...register("config.dns.expectedResult")}
                    />
                    <FieldHint>Leer = nur Existenz prüfen</FieldHint>
                  </div>
                </div>
              </div>
            )}

            {watchedType === "ping" && (
              <div className="space-y-2">
                <Label htmlFor="ping-host">Host (DNS / IP)</Label>
                <Input
                  id="ping-host"
                  placeholder="192.168.1.1 oder server.example.com"
                  {...register("config.ping.host")}
                  aria-invalid={!!errors.config?.ping?.host}
                />
                <FieldError message={errors.config?.ping?.host?.message} />
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* Check Configuration */}
          {/* ============================================ */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Check-Konfiguration</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Interval */}
              <div className="space-y-2">
                <Label htmlFor="interval">Intervall (Sekunden)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={10}
                  max={3600}
                  {...register("interval", { valueAsNumber: true })}
                  aria-invalid={!!errors.interval}
                />
                <PresetButtons
                  presets={INTERVAL_PRESETS}
                  currentValue={watchedInterval}
                  onSelect={(v) => setValue("interval", v, { shouldDirty: true })}
                />
                <FieldError message={errors.interval?.message} />
              </div>

              {/* Timeout */}
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (Sekunden)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min={1}
                  max={120}
                  {...register("timeout", { valueAsNumber: true })}
                  aria-invalid={!!errors.timeout}
                />
                <FieldHint>Muss kleiner als Intervall sein</FieldHint>
                <FieldError message={errors.timeout?.message} />
              </div>
            </div>

            {/* Retries and SSL Certificate (for HTTP) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retries">Wiederholungen bei Fehler</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (watchedRetries > 0) setValue("retries", watchedRetries - 1, { shouldDirty: true });
                    }}
                  >
                    -
                  </Button>
                  <Input
                    id="retries"
                    type="number"
                    min={0}
                    max={10}
                    className="w-20 text-center"
                    {...register("retries", { valueAsNumber: true })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (watchedRetries < 10) setValue("retries", watchedRetries + 1, { shouldDirty: true });
                    }}
                  >
                    +
                  </Button>
                </div>
                <FieldError message={errors.retries?.message} />
              </div>

              {/* SSL Certificate Check - only for HTTP */}
              {watchedType === "http" && (
                <div className="space-y-2">
                  <Label>SSL-Zertifikat prüfen</Label>
                  <div className="flex items-center gap-3 h-9">
                    <input
                      type="checkbox"
                      id="verify-certificate"
                      className="h-4 w-4"
                      {...register("config.http.verifyCertificate")}
                    />
                    <label htmlFor="verify-certificate" className="text-sm text-muted-foreground">
                      Gültigkeit und Ablauf überwachen
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* HTTP Advanced Options */}
          {/* ============================================ */}
          {watchedType === "http" && (
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-between"
                >
                  <span>Erweiterte HTTP-Optionen</span>
                  {advancedOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* HTTP Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>HTTP-Methode</Label>
                    <Select
                      value={watchedMethod || "GET"}
                      onValueChange={(v) =>
                        setValue("config.http.method", v as HttpMethod, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HTTP_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            <Badge variant="outline" className="font-mono">
                              {m.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-codes">Erwartete Status-Codes</Label>
                    <Input
                      id="status-codes"
                      placeholder="200 oder 200,201 oder 200-299"
                      {...register("config.http.expectedStatusCodes")}
                    />
                    <FieldError message={errors.config?.http?.expectedStatusCodes?.message} />
                  </div>
                </div>

                {/* Request Body (for POST/PUT/PATCH) */}
                {(watchedMethod === "POST" ||
                  watchedMethod === "PUT" ||
                  watchedMethod === "PATCH") && (
                  <div className="space-y-2">
                    <Label htmlFor="body">Request Body</Label>
                    <textarea
                      id="body"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                      placeholder='{"key": "value"}'
                      {...register("config.http.body")}
                    />
                  </div>
                )}

                {/* Headers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Request Headers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                      <Plus className="h-3 w-3 mr-1" />
                      Header hinzufügen
                    </Button>
                  </div>
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Header-Name"
                        value={header.key}
                        onChange={(e) => updateHeader(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Wert"
                        value={header.value}
                        onChange={(e) => updateHeader(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeader(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Keyword Check */}
                <div className="space-y-2">
                  <Label htmlFor="keyword">Keyword-Check</Label>
                  <Input
                    id="keyword"
                    placeholder="Response muss diesen Text enthalten"
                    {...register("config.http.checkKeyword")}
                  />
                  <FieldHint>Optional: Prüft ob die Antwort diesen Text enthält</FieldHint>
                </div>

                {/* Authentication */}
                <div className="space-y-3">
                  <Label>Authentifizierung</Label>
                  <Select
                    value={watchedAuthType || "none"}
                    onValueChange={(v) =>
                      setValue("config.http.authType", v as AuthType, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTH_TYPES.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {watchedAuthType === "basic" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="auth-user">Benutzername</Label>
                        <Input
                          id="auth-user"
                          {...register("config.http.authUsername")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auth-pass">Passwort</Label>
                        <div className="relative">
                          <Input
                            id="auth-pass"
                            type={showPassword ? "text" : "password"}
                            {...register("config.http.authPassword")}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {watchedAuthType === "bearer" && (
                    <div className="space-y-2">
                      <Label htmlFor="auth-token">Bearer Token</Label>
                      <div className="relative">
                        <Input
                          id="auth-token"
                          type={showPassword ? "text" : "password"}
                          placeholder="Token ohne 'Bearer ' Prefix"
                          {...register("config.http.authToken")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Redirects Option */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Redirects folgen</Label>
                    <FieldHint>HTTP 3xx Weiterleitungen automatisch folgen</FieldHint>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    {...register("config.http.followRedirects")}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* ============================================ */}
          {/* DNS Advanced Options */}
          {/* ============================================ */}
          {watchedType === "dns" && (
            <div className="space-y-2">
              <Label htmlFor="dns-server">Benutzerdefinierter DNS-Server</Label>
              <Input
                id="dns-server"
                placeholder="8.8.8.8 oder leer für System-DNS"
                {...register("config.dns.dnsServer")}
              />
              <FieldHint>Optional: Spezifischen DNS-Server verwenden</FieldHint>
              <FieldError message={errors.config?.dns?.dnsServer?.message} />
            </div>
          )}

          {/* ============================================ */}
          {/* SLA Configuration */}
          {/* ============================================ */}
          <div className="space-y-4 pt-4 border-t bg-muted/30 -mx-6 px-6 py-4">
            <h4 className="font-medium text-sm">SLA-Konfiguration</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* SLA Target */}
              <div className="space-y-2">
                <Label htmlFor="slaTarget">Uptime-Ziel (%)</Label>
                <Input
                  id="slaTarget"
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  className="font-mono"
                  {...register("slaTarget", { valueAsNumber: true })}
                  aria-invalid={!!errors.slaTarget}
                />
                <PresetButtons
                  presets={SLA_PRESETS}
                  currentValue={watchedSlaTarget}
                  onSelect={(v) => setValue("slaTarget", v, { shouldDirty: true })}
                />
                <FieldError message={errors.slaTarget?.message} />
              </div>

              {/* Max Response Time */}
              <div className="space-y-2">
                <Label htmlFor="maxResponseTime">Max. Antwortzeit (ms)</Label>
                <Input
                  id="maxResponseTime"
                  type="number"
                  min={50}
                  max={60000}
                  step={50}
                  className="font-mono"
                  {...register("maxResponseTime", { valueAsNumber: true })}
                  aria-invalid={!!errors.maxResponseTime}
                />
                <FieldHint>Langsamere Antworten gelten als degradiert</FieldHint>
                <FieldError message={errors.maxResponseTime?.message} />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* Footer */}
          {/* ============================================ */}
          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
