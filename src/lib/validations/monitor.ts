import { z } from "zod";
import type { Monitor, MonitorType, HttpMethod, DnsRecordType, AuthType } from "@/types";

// ============================================
// Sub-schemas for type-specific configurations
// ============================================

const httpConfigSchema = z.object({
  method: z.enum(["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"] as const),
  expectedStatusCodes: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.string(),
  checkKeyword: z.string(),
  verifyCertificate: z.boolean(),
  certExpiryWarningDays: z.number().min(1).max(365),
  authType: z.enum(["none", "basic", "bearer"] as const),
  authUsername: z.string(),
  authPassword: z.string(),
  authToken: z.string(),
  followRedirects: z.boolean(),
});

const tcpConfigSchema = z.object({
  host: z.string().min(1, "Host ist erforderlich"),
  port: z
    .number({ message: "Port muss eine Zahl sein" })
    .int("Port muss eine ganze Zahl sein")
    .min(1, "Port muss zwischen 1 und 65535 liegen")
    .max(65535, "Port muss zwischen 1 und 65535 liegen"),
});

const dnsConfigSchema = z.object({
  domain: z.string().min(1, "Domain ist erforderlich"),
  recordType: z.enum(["A", "AAAA", "MX", "CNAME", "TXT", "NS"] as const),
  expectedResult: z.string(),
  dnsServer: z.string(),
});

const pingConfigSchema = z.object({
  host: z.string().min(1, "Host ist erforderlich"),
  packetCount: z.number().int().min(1).max(10),
});

const monitorConfigSchema = z.object({
  http: httpConfigSchema.optional(),
  tcp: tcpConfigSchema.optional(),
  dns: dnsConfigSchema.optional(),
  ping: pingConfigSchema.optional(),
});

// ============================================
// Main Monitor Form Schema
// ============================================

export const monitorFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name ist erforderlich")
      .max(100, "Name darf maximal 100 Zeichen lang sein"),

    type: z.enum(["http", "tcp", "ping", "dns"] as const, {
      message: "Bitte wähle einen Monitor-Typ",
    }),

    url: z.string(),

    interval: z
      .number({ message: "Intervall muss eine Zahl sein" })
      .int("Intervall muss eine ganze Zahl sein")
      .min(10, "Mindestintervall ist 10 Sekunden")
      .max(3600, "Maximales Intervall ist 3600 Sekunden"),

    timeout: z
      .number({ message: "Timeout muss eine Zahl sein" })
      .int("Timeout muss eine ganze Zahl sein")
      .min(1, "Mindest-Timeout ist 1 Sekunde")
      .max(120, "Maximaler Timeout ist 120 Sekunden"),

    retries: z
      .number({ message: "Wiederholungen muss eine Zahl sein" })
      .int("Wiederholungen muss eine ganze Zahl sein")
      .min(0, "Mindestens 0 Wiederholungen")
      .max(10, "Maximal 10 Wiederholungen"),

    slaTarget: z
      .number({ message: "SLA-Ziel muss eine Zahl sein" })
      .min(0, "SLA-Ziel muss mindestens 0% sein")
      .max(100, "SLA-Ziel darf maximal 100% sein"),

    maxResponseTime: z
      .number({ message: "Antwortzeit muss eine Zahl sein" })
      .int("Antwortzeit muss eine ganze Zahl sein")
      .min(50, "Minimale Antwortzeit ist 50ms")
      .max(60000, "Maximale Antwortzeit ist 60000ms"),

    enabled: z.boolean(),

    config: monitorConfigSchema.optional(),
  })
  .refine((data) => data.timeout < data.interval, {
    message: "Timeout muss kleiner als das Intervall sein",
    path: ["timeout"],
  });

export type MonitorFormValues = z.infer<typeof monitorFormSchema>;

// ============================================
// Default values per monitor type
// ============================================

export const defaultHttpConfig = {
  method: "GET" as HttpMethod,
  expectedStatusCodes: "200",
  headers: {} as Record<string, string>,
  body: "",
  checkKeyword: "",
  verifyCertificate: true,
  certExpiryWarningDays: 30,
  authType: "none" as AuthType,
  authUsername: "",
  authPassword: "",
  authToken: "",
  followRedirects: true,
};

export const defaultTcpConfig = {
  host: "",
  port: 443,
};

export const defaultDnsConfig = {
  domain: "",
  recordType: "A" as DnsRecordType,
  expectedResult: "",
  dnsServer: "",
};

export const defaultPingConfig = {
  host: "",
  packetCount: 4,
};

export const defaultsByType: Record<
  MonitorType,
  { interval: number; timeout: number; maxResponseTime: number }
> = {
  http: { interval: 60, timeout: 10, maxResponseTime: 500 },
  tcp: { interval: 30, timeout: 5, maxResponseTime: 100 },
  dns: { interval: 300, timeout: 10, maxResponseTime: 100 },
  ping: { interval: 60, timeout: 10, maxResponseTime: 200 },
};

// ============================================
// Helper functions
// ============================================

/**
 * Parse a TCP URL (host:port) into separate components
 */
export function parseTcpUrl(url: string): { host: string; port: number } {
  const match = url.match(/^(.+):(\d+)$/);
  if (match) {
    return { host: match[1], port: parseInt(match[2], 10) };
  }
  return { host: url, port: 443 };
}

/**
 * Build a TCP URL from host and port
 */
export function buildTcpUrl(host: string, port: number): string {
  return `${host}:${port}`;
}

/**
 * Convert Monitor to form values
 */
export function monitorToFormValues(monitor: Monitor): MonitorFormValues {
  const baseValues: MonitorFormValues = {
    name: monitor.name,
    type: monitor.type,
    url: monitor.url,
    interval: monitor.interval,
    timeout: monitor.timeout,
    retries: monitor.retries,
    slaTarget: monitor.slaTarget,
    maxResponseTime: monitor.maxResponseTime,
    enabled: monitor.status !== "paused",
    config: {},
  };

  // Parse type-specific config from URL or defaults
  switch (monitor.type) {
    case "http":
      baseValues.config = {
        http: { ...defaultHttpConfig },
      };
      break;
    case "tcp": {
      const { host, port } = parseTcpUrl(monitor.url);
      baseValues.config = {
        tcp: { host, port },
      };
      break;
    }
    case "dns":
      baseValues.config = {
        dns: { ...defaultDnsConfig, domain: monitor.url },
      };
      break;
    case "ping":
      baseValues.config = {
        ping: { ...defaultPingConfig, host: monitor.url },
      };
      break;
  }

  return baseValues;
}

/**
 * Convert form values back to monitor update format
 */
export function formValuesToMonitorUpdate(
  values: MonitorFormValues
): Partial<Monitor> {
  let url = values.url;

  // Build URL from type-specific config
  switch (values.type) {
    case "tcp":
      if (values.config?.tcp) {
        url = buildTcpUrl(values.config.tcp.host, values.config.tcp.port);
      }
      break;
    case "dns":
      if (values.config?.dns) {
        url = values.config.dns.domain;
      }
      break;
    case "ping":
      if (values.config?.ping) {
        url = values.config.ping.host;
      }
      break;
  }

  return {
    name: values.name,
    type: values.type,
    url,
    interval: values.interval,
    timeout: values.timeout,
    retries: values.retries,
    slaTarget: values.slaTarget,
    maxResponseTime: values.maxResponseTime,
    status: values.enabled ? "up" : "paused",
  };
}
