"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, AlertTriangle, Wrench, Megaphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IncidentSplitView } from "@/components/incidents/incident-split-view";
import {
  getExtendedIncidents,
  getMockMonitors,
  createIncident,
  updateIncident,
  deleteIncident,
  resolveIncident,
  addIncidentUpdate,
  editIncidentUpdate,
  deleteIncidentUpdate,
} from "@/mocks/monitors";
import type { ExtendedIncident, IncidentFormData } from "@/types";

export default function IncidentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedIncidentId = searchParams.get("id");

  // Incidents state (TODO: Replace with React Query)
  const [incidents, setIncidents] = useState<ExtendedIncident[]>(() =>
    getExtendedIncidents()
  );

  // Monitors (read-only)
  const monitors = useMemo(() => getMockMonitors(), []);

  // Handlers for creating different incident types from dropdown (via URL)
  const handleCreateIncident = useCallback(() => {
    router.push("/incidents?mode=create&type=incident", { scroll: false });
  }, [router]);

  const handleCreateMaintenance = useCallback(() => {
    router.push("/incidents?mode=create&type=maintenance", { scroll: false });
  }, [router]);

  const handleCreateAnnouncement = useCallback(() => {
    router.push("/incidents?mode=create&type=announcement", { scroll: false });
  }, [router]);

  const handleCreateHistorical = useCallback(() => {
    router.push("/incidents?mode=create&type=incident&historical=true", { scroll: false });
  }, [router]);

  // Handle selecting an incident
  const handleSelectIncident = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/incidents?id=${id}`, { scroll: false });
      } else {
        router.push("/incidents", { scroll: false });
      }
    },
    [router]
  );

  // Handle saving a new incident (from dialog)
  const handleSaveNewIncident = useCallback((data: IncidentFormData) => {
    const newIncident = createIncident(data);
    setIncidents(getExtendedIncidents());
    // Select the newly created incident
    router.push(`/incidents?id=${newIncident.id}`, { scroll: false });
  }, [router]);

  // Handle updating an incident
  const handleUpdateIncident = useCallback(
    (incidentId: string, updates: Partial<ExtendedIncident>) => {
      updateIncident(incidentId, updates);
      setIncidents(getExtendedIncidents());
    },
    []
  );

  // Handle deleting an incident
  const handleDeleteIncident = useCallback(
    (incidentId: string) => {
      deleteIncident(incidentId);
      setIncidents(getExtendedIncidents());
      if (selectedIncidentId === incidentId) {
        router.push("/incidents", { scroll: false });
      }
    },
    [selectedIncidentId, router]
  );

  // Handle resolving an incident
  const handleResolveIncident = useCallback(
    (incidentId: string, message: string) => {
      resolveIncident(incidentId, message);
      setIncidents(getExtendedIncidents());
    },
    []
  );

  // Handle adding an update to an incident
  const handleAddUpdate = useCallback(
    (incidentId: string, message: string) => {
      addIncidentUpdate(incidentId, message, "Benutzer");
      setIncidents(getExtendedIncidents());
    },
    []
  );

  // Handle editing an update
  const handleEditUpdate = useCallback(
    (incidentId: string, updateId: string, newMessage: string) => {
      editIncidentUpdate(incidentId, updateId, newMessage);
      setIncidents(getExtendedIncidents());
    },
    []
  );

  // Handle deleting an update
  const handleDeleteUpdate = useCallback(
    (incidentId: string, updateId: string) => {
      deleteIncidentUpdate(incidentId, updateId);
      setIncidents(getExtendedIncidents());
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vorfälle</h1>
          <p className="text-muted-foreground">
            Verwalte Incidents, Wartungsarbeiten und Ankündigungen
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="uppercase tracking-wide">
              <Plus className="h-4 w-4 mr-1" />
              Vorfall erstellen
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCreateIncident}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incident
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateMaintenance}>
              <Wrench className="h-4 w-4 mr-2" />
              Geplante Wartung
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateAnnouncement}>
              <Megaphone className="h-4 w-4 mr-2" />
              Ankündigung
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateHistorical}>
              <Clock className="h-4 w-4 mr-2" />
              Historischer Eintrag
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Split View */}
      <IncidentSplitView
        incidents={incidents}
        monitors={monitors}
        selectedIncidentId={selectedIncidentId}
        onSelectIncident={handleSelectIncident}
        onIncidentCreate={handleSaveNewIncident}
        onIncidentUpdate={handleUpdateIncident}
        onIncidentDelete={handleDeleteIncident}
        onIncidentResolve={handleResolveIncident}
        onAddUpdate={handleAddUpdate}
        onEditUpdate={handleEditUpdate}
        onDeleteUpdate={handleDeleteUpdate}
      />
    </div>
  );
}
