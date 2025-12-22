import { z } from "zod";
import type { Monitor, MonitorType, HttpMethod, DnsRecordType, AuthType } from "@/types";

// ============================================
// Sub-schemas for type-specific configurations
// ============================================

const createHttpConfigSchema = () =>
  z.object({
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

const createTcpConfigSchema = (t: (key: string) => string) =>
  z.object({
    host: z.string().min(1, t("validations.monitor.hostRequired")),
    port: z
      .number({ message: t("validations.monitor.portNumber") })
      .int(t("validations.monitor.portInteger"))
      .min(1, t("validations.monitor.portRange"))
      .max(65535, t("validations.monitor.portRange")),
  });

const createDnsConfigSchema = (t: (key: string) => string) =>
  z.object({
    domain: z.string().min(1, t("validations.monitor.domainRequired")),
    recordType: z.enum(["A", "AAAA", "MX", "CNAME", "TXT", "NS"] as const),
    expectedResult: z.string(),
    dnsServer: z.string(),
  });

const createPingConfigSchema = (t: (key: string) => string) =>
  z.object({
    host: z.string().min(1, t("validations.monitor.hostRequired")),
    packetCount: z.number().int().min(1).max(10),
  });

const createMonitorConfigSchema = (t: (key: string) => string) =>
  z.object({
    http: createHttpConfigSchema().optional(),
    tcp: createTcpConfigSchema(t).optional(),
    dns: createDnsConfigSchema(t).optional(),
    ping: createPingConfigSchema(t).optional(),
  });

// ============================================
// Main Monitor Form Schema
// ============================================

export const createMonitorFormSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(1, t("validations.monitor.nameRequired"))
        .max(100, t("validations.monitor.nameMaxLength")),

      type: z.enum(["http", "tcp", "ping", "dns"] as const, {
        message: t("validations.monitor.selectType"),
      }),

      url: z.string(),

      interval: z
        .number({ message: t("validations.monitor.intervalNumber") })
        .int(t("validations.monitor.intervalInteger"))
        .min(10, t("validations.monitor.intervalMin"))
        .max(3600, t("validations.monitor.intervalMax")),

      timeout: z
        .number({ message: t("validations.monitor.timeoutNumber") })
        .int(t("validations.monitor.timeoutInteger"))
        .min(1, t("validations.monitor.timeoutMin"))
        .max(120, t("validations.monitor.timeoutMax")),

      retries: z
        .number({ message: t("validations.monitor.retriesNumber") })
        .int(t("validations.monitor.retriesInteger"))
        .min(0, t("validations.monitor.retriesMin"))
        .max(10, t("validations.monitor.retriesMax")),

      slaTarget: z
        .number({ message: t("validations.monitor.slaTargetNumber") })
        .min(0, t("validations.monitor.slaTargetMin"))
        .max(100, t("validations.monitor.slaTargetMax")),

      maxResponseTime: z
        .number({ message: t("validations.monitor.maxResponseTimeNumber") })
        .int(t("validations.monitor.maxResponseTimeInteger"))
        .min(50, t("validations.monitor.maxResponseTimeMin"))
        .max(60000, t("validations.monitor.maxResponseTimeMax")),

      enabled: z.boolean(),

      config: createMonitorConfigSchema(t).optional(),
    })
    .refine((data) => data.timeout < data.interval, {
      message: t("validations.monitor.timeoutLessThanInterval"),
      path: ["timeout"],
    });

export type MonitorFormValues = z.infer<ReturnType<typeof createMonitorFormSchema>>;

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
