import type { SystemNotification } from "@/types";

let mutableNotifications: SystemNotification[] | null = null;

const initialNotifications: SystemNotification[] = [
  {
    id: "notif-1",
    type: "monitor_down",
    title: 'Monitor "Mail Server" ist offline',
    message:
      "Der Mail Server antwortet nicht mehr auf Port 587. Verbindung wurde verweigert.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    read: false,
    severity: "critical",
    relatedMonitorId: "4",
    metadata: {
      monitorName: "Mail Server",
    },
  },
  {
    id: "notif-2",
    type: "incident_created",
    title: "Neuer Incident: API Latenz erhöht",
    message:
      "Die Antwortzeiten der Production API sind deutlich erhöht. Durchschnittliche Latenz über 2000ms.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    read: false,
    severity: "major",
    relatedIncidentId: "inc-2",
    relatedMonitorId: "1",
    metadata: {
      incidentTitle: "API Latenz erhöht",
      monitorName: "Production API",
    },
  },
  {
    id: "notif-3",
    type: "incident_updated",
    title: "Incident Update: Mail Server nicht erreichbar",
    message:
      "Ursache identifiziert: Firewall-Regel blockiert eingehende Verbindungen. Fix wird vorbereitet.",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    read: false,
    severity: "critical",
    relatedIncidentId: "inc-1",
    relatedMonitorId: "4",
    metadata: {
      incidentTitle: "Mail Server nicht erreichbar",
      monitorName: "Mail Server",
    },
  },
  {
    id: "notif-4",
    type: "maintenance_started",
    title: "Wartung gestartet: API Update",
    message:
      "Die geplante Wartung für die Production API hat begonnen. Deployment der Version v2.5.0.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: true,
    relatedIncidentId: "inc-6",
    relatedMonitorId: "1",
    metadata: {
      monitorName: "Production API",
    },
  },
  {
    id: "notif-5",
    type: "monitor_up",
    title: 'Monitor "Database Server" ist wieder online',
    message:
      "Der Database Server ist wieder erreichbar. Verbindung wurde wiederhergestellt.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    read: true,
    relatedMonitorId: "3",
    metadata: {
      monitorName: "Database Server",
      duration: 45 * 60, // 45 minutes offline
    },
  },
  {
    id: "notif-6",
    type: "incident_resolved",
    title: 'Incident behoben: "CDN Cache-Probleme"',
    message:
      "Der Incident wurde erfolgreich behoben. Cache wurde wiederhergestellt und alle Systeme funktionieren normal.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    severity: "minor",
    relatedIncidentId: "inc-3",
    relatedMonitorId: "5",
    metadata: {
      incidentTitle: "CDN Cache-Probleme",
      monitorName: "CDN Endpoint",
      duration: 20 * 60, // 20 minutes
    },
  },
  {
    id: "notif-7",
    type: "maintenance_scheduled",
    title: "Wartung geplant: SSL-Zertifikat Erneuerung",
    message:
      "Eine Wartung wurde für die Website geplant. Planmäßige Erneuerung des SSL-Zertifikats am 25.12.2024.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    read: true,
    relatedMonitorId: "2",
    metadata: {
      monitorName: "Website",
    },
  },
  {
    id: "notif-8",
    type: "maintenance_completed",
    title: "Wartung abgeschlossen: Datenbank-Migration",
    message:
      "Die Datenbank-Migration wurde erfolgreich abgeschlossen. Alle Dienste sind wieder verfügbar.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    read: true,
    relatedMonitorId: "3",
    metadata: {
      monitorName: "Database Server",
      duration: 90 * 60, // 90 minutes
    },
  },
];

function ensureNotifications(): SystemNotification[] {
  if (mutableNotifications === null) {
    mutableNotifications = JSON.parse(JSON.stringify(initialNotifications));
  }
  return mutableNotifications as SystemNotification[];
}

export function getMockNotifications(): SystemNotification[] {
  const notifications = ensureNotifications();
  // Sort by timestamp descending (newest first)
  return [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function markAsRead(id: string): void {
  const notifications = ensureNotifications();
  const notification = notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
}

export function markAllAsRead(): void {
  const notifications = ensureNotifications();
  notifications.forEach((n) => {
    n.read = true;
  });
}

export function deleteNotification(id: string): void {
  const notifications = ensureNotifications();
  mutableNotifications = notifications.filter((n) => n.id !== id);
}

export function getUnreadCount(): number {
  return getMockNotifications().filter((n) => !n.read).length;
}

export function resetNotifications(): void {
  mutableNotifications = null;
}
