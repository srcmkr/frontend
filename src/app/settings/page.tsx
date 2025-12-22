"use client";

import { Activity, Bell, Database, Key, Globe, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MonitoringSettings,
  NotificationSettings,
  DataSettings,
  ApiSettings,
  StatusPageSettings,
  SystemSettings,
} from "@/components/settings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">Systemkonfiguration</p>
      </div>

      {/* Floating Card mit Tabs */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg shadow-black/5 dark:shadow-black/20">
        <Tabs defaultValue="monitoring">
          {/* Tab-Liste */}
          <div className="border-b px-6 py-4">
            <TabsList className="h-auto p-1 bg-muted/50">
              <TabsTrigger value="monitoring" className="gap-2 data-[state=active]:bg-background">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Benachrichtigungen</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-background">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Daten</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2 data-[state=active]:bg-background">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API</span>
              </TabsTrigger>
              <TabsTrigger value="status-pages" className="gap-2 data-[state=active]:bg-background">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Status-Seiten</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2 data-[state=active]:bg-background">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab-Content */}
          <div className="p-6">
            <TabsContent value="monitoring" className="mt-0">
              <MonitoringSettings />
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="data" className="mt-0">
              <DataSettings />
            </TabsContent>
            <TabsContent value="api" className="mt-0">
              <ApiSettings />
            </TabsContent>
            <TabsContent value="status-pages" className="mt-0">
              <StatusPageSettings />
            </TabsContent>
            <TabsContent value="system" className="mt-0">
              <SystemSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
