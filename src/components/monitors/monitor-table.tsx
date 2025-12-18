"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusIndicator } from "./status-indicator";
import { UptimeBar } from "./uptime-bar";
import type { Monitor } from "@/types";

interface MonitorTableProps {
  monitors: Monitor[];
  title?: string;
  embedded?: boolean;
}

export function MonitorTable({ monitors, title, embedded }: MonitorTableProps) {
  const router = useRouter();

  const formatResponseTime = (ms: number | null) => {
    if (ms === null) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatLastCheck = (date: string | null) => {
    if (!date) return "Never";
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (monitors.length === 0) {
    return null;
  }

  return (
    <div className={embedded ? "" : "rounded-lg border bg-card"}>
      {title && (
        <div className="px-4 py-3 border-b">
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden lg:table-cell">URL</TableHead>
            <TableHead className="text-right w-[100px]">Response</TableHead>
            <TableHead className="hidden md:table-cell w-[400px]">Uptime (24h)</TableHead>
            <TableHead className="text-right hidden sm:table-cell w-[100px]">Last Check</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.map((monitor) => (
            <TableRow
              key={monitor.id}
              className="cursor-pointer"
              onClick={() => router.push(`/monitors/${monitor.id}`)}
            >
              <TableCell className="py-2">
                <StatusIndicator status={monitor.status} />
              </TableCell>
              <TableCell className="py-2">
                <span className="font-medium">{monitor.name}</span>
                <span className="ml-2 text-xs text-muted-foreground uppercase">
                  {monitor.type}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell py-2 text-muted-foreground text-sm truncate max-w-[300px]">
                {monitor.url}
              </TableCell>
              <TableCell className="text-right py-2 font-mono text-sm">
                {formatResponseTime(monitor.lastResponseTime)}
              </TableCell>
              <TableCell className="hidden md:table-cell py-2">
                <UptimeBar
                  uptime={monitor.uptime24h}
                  segments={monitor.uptimeHistory}
                />
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell py-2 text-sm text-muted-foreground">
                {formatLastCheck(monitor.lastCheck)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
