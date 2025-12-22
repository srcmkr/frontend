"use client";

import { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@/components/dnd/dnd-provider";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  CSS,
} from "@/components/dnd/dnd-provider";
import type { StatusPageGroup, Monitor } from "@/types";

interface StatusPageGroupEditorProps {
  groups: StatusPageGroup[];
  monitors: Monitor[];
  selectedMonitorIds: string[];
  onChange: (groups: StatusPageGroup[], monitorIds: string[]) => void;
  className?: string;
}

// Draggable Monitor Item (in the left panel)
function DraggableMonitor({
  monitor,
  isAssigned,
  assignedGroupName,
}: {
  monitor: Monitor;
  isAssigned: boolean;
  assignedGroupName?: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `monitor-${monitor.id}`,
    data: { type: "monitor", monitor },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50",
        isAssigned
          ? "bg-primary/5 border-primary/20"
          : "bg-background border-border hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{monitor.name}</p>
        <p className="text-xs text-muted-foreground truncate">{monitor.url}</p>
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">
        {monitor.type.toUpperCase()}
      </Badge>
      {isAssigned && assignedGroupName && (
        <Badge variant="secondary" className="text-[10px] shrink-0 max-w-[80px] truncate">
          {assignedGroupName}
        </Badge>
      )}
    </div>
  );
}

// Monitor inside a group (can be removed)
function GroupMonitorItem({
  monitor,
  onRemove,
}: {
  monitor: Monitor;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded bg-accent/50 group">
      <span className="text-sm flex-1 truncate">{monitor.name}</span>
      <Badge variant="outline" className="text-[10px]">
        {monitor.type.toUpperCase()}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}

// Droppable Group
function DroppableGroup({
  group,
  monitors,
  allMonitors,
  onRename,
  onDelete,
  onRemoveMonitor,
  isOver,
  dragMonitorsHereText,
}: {
  group: StatusPageGroup;
  monitors: Monitor[];
  allMonitors: Monitor[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onRemoveMonitor: (groupId: string, monitorId: string) => void;
  isOver: boolean;
  dragMonitorsHereText: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [expanded, setExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `group-drop-${group.id}`,
    data: { type: "group", groupId: group.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editName.trim()) {
      onRename(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(group.name);
    setIsEditing(false);
  };

  const groupMonitors = monitors.filter((m) => group.monitors.includes(m.id));

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isDragging && "opacity-50 shadow-lg",
        isOver && "ring-2 ring-primary border-primary"
      )}
    >
      {/* Group Header */}
      <div className="flex items-center gap-2 p-2 bg-muted/50">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-accent rounded"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-medium text-sm">{group.name}</span>
            <Badge variant="secondary" className="text-xs">
              {groupMonitors.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </>
        )}
      </div>

      {/* Group Monitors */}
      {expanded && (
        <div className="p-2 space-y-1 bg-background min-h-[60px]">
          {groupMonitors.length === 0 ? (
            <div className="flex items-center justify-center h-[44px] border-2 border-dashed rounded-lg text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4 mr-2" />
              {dragMonitorsHereText}
            </div>
          ) : (
            groupMonitors.map((monitor) => (
              <GroupMonitorItem
                key={monitor.id}
                monitor={monitor}
                onRemove={() => onRemoveMonitor(group.id, monitor.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function StatusPageGroupEditor({
  groups,
  monitors,
  selectedMonitorIds,
  onChange,
  className,
}: StatusPageGroupEditorProps) {
  const t = useTranslations("statusPages");
  const [newGroupName, setNewGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [activeMonitorId, setActiveMonitorId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get assignment info for each monitor
  const monitorAssignments = useMemo(() => {
    const assignments: Record<string, string> = {};
    groups.forEach((g) => {
      g.monitors.forEach((mId) => {
        assignments[mId] = g.name;
      });
    });
    return assignments;
  }, [groups]);

  // Filter monitors by search
  const filteredMonitors = useMemo(() => {
    if (!search) return monitors;
    const searchLower = search.toLowerCase();
    return monitors.filter(
      (m) =>
        m.name.toLowerCase().includes(searchLower) ||
        m.url.toLowerCase().includes(searchLower)
    );
  }, [monitors, search]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (String(active.id).startsWith("monitor-")) {
      setActiveMonitorId(String(active.id).replace("monitor-", ""));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverGroupId(null);
      return;
    }

    const overId = String(over.id);
    if (overId.startsWith("group-drop-")) {
      setOverGroupId(overId.replace("group-drop-", ""));
    } else {
      // Check if overId is a group id directly
      const isGroup = groups.some((g) => g.id === overId);
      if (isGroup) {
        setOverGroupId(overId);
      } else {
        setOverGroupId(null);
      }
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveMonitorId(null);
      setOverGroupId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // Handle monitor drop onto group
      if (activeId.startsWith("monitor-")) {
        const monitorId = activeId.replace("monitor-", "");

        // Determine target group ID - can be either "group-drop-{id}" or just the group id
        let targetGroupId: string | null = null;
        if (overId.startsWith("group-drop-")) {
          targetGroupId = overId.replace("group-drop-", "");
        } else {
          // Check if overId is a group id directly
          const isGroup = groups.some((g) => g.id === overId);
          if (isGroup) {
            targetGroupId = overId;
          }
        }

        if (targetGroupId) {
          // Remove from all groups and add to target
          const newGroups = groups.map((g) => {
            const filteredMonitors = g.monitors.filter((id) => id !== monitorId);
            if (g.id === targetGroupId) {
              return { ...g, monitors: [...filteredMonitors, monitorId] };
            }
            return { ...g, monitors: filteredMonitors };
          });

          // Update selected monitor IDs
          const allGroupMonitors = new Set(newGroups.flatMap((g) => g.monitors));
          const newSelectedIds = Array.from(allGroupMonitors);

          onChange(newGroups, newSelectedIds);
        }
        return;
      }

      // Handle group reordering
      if (!overId.startsWith("group-drop-")) {
        const oldIndex = groups.findIndex((g) => g.id === activeId);
        const newIndex = groups.findIndex((g) => g.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newGroups = arrayMove(groups, oldIndex, newIndex).map(
            (g, index) => ({ ...g, order: index })
          );
          onChange(newGroups, selectedMonitorIds);
        }
      }
    },
    [groups, selectedMonitorIds, onChange]
  );

  const handleAddGroup = useCallback(() => {
    if (!newGroupName.trim()) return;

    const newGroup: StatusPageGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      monitors: [],
      order: groups.length,
    };

    onChange([...groups, newGroup], selectedMonitorIds);
    setNewGroupName("");
  }, [newGroupName, groups, selectedMonitorIds, onChange]);

  const handleRenameGroup = useCallback(
    (groupId: string, name: string) => {
      const newGroups = groups.map((g) =>
        g.id === groupId ? { ...g, name } : g
      );
      onChange(newGroups, selectedMonitorIds);
    },
    [groups, selectedMonitorIds, onChange]
  );

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      const newGroups = groups
        .filter((g) => g.id !== groupId)
        .map((g, index) => ({ ...g, order: index }));

      // Update selected monitor IDs
      const allGroupMonitors = new Set(newGroups.flatMap((g) => g.monitors));
      const newSelectedIds = Array.from(allGroupMonitors);

      onChange(newGroups, newSelectedIds);
    },
    [groups, onChange]
  );

  const handleRemoveMonitor = useCallback(
    (groupId: string, monitorId: string) => {
      const newGroups = groups.map((g) => {
        if (g.id === groupId) {
          return { ...g, monitors: g.monitors.filter((id) => id !== monitorId) };
        }
        return g;
      });

      // Update selected monitor IDs
      const allGroupMonitors = new Set(newGroups.flatMap((g) => g.monitors));
      const newSelectedIds = Array.from(allGroupMonitors);

      onChange(newGroups, newSelectedIds);
    },
    [groups, onChange]
  );

  const activeMonitor = activeMonitorId
    ? monitors.find((m) => m.id === activeMonitorId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex gap-4 h-[400px]", className)}>
        {/* Left Panel - All Monitors */}
        <div className="w-1/2 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("groupEditor.searchMonitors")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("groupEditor.monitorsAvailable", { count: monitors.length })}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredMonitors.map((monitor) => (
              <DraggableMonitor
                key={monitor.id}
                monitor={monitor}
                isAssigned={!!monitorAssignments[monitor.id]}
                assignedGroupName={monitorAssignments[monitor.id]}
              />
            ))}
            {filteredMonitors.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {search ? t("groupEditor.noMonitorsFound") : t("groupEditor.noMonitorsAvailable")}
              </p>
            )}
          </div>
        </div>

        {/* Right Panel - Groups */}
        <div className="w-1/2 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("groupEditor.newGroup")}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGroup();
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
                disabled={!newGroupName.trim()}
                className="h-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("groupEditor.groupsCount", { count: groups.length })} · {t("groupEditor.dragAndDropHint")}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SortableContext
              items={groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {groups
                  .sort((a, b) => a.order - b.order)
                  .map((group) => (
                    <DroppableGroup
                      key={group.id}
                      group={group}
                      monitors={monitors}
                      allMonitors={monitors}
                      onRename={handleRenameGroup}
                      onDelete={handleDeleteGroup}
                      onRemoveMonitor={handleRemoveMonitor}
                      isOver={overGroupId === group.id}
                      dragMonitorsHereText={t("groupEditor.dragMonitorsHere")}
                    />
                  ))}
              </div>
            </SortableContext>

            {groups.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("groupEditor.noGroupsCreated")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("groupEditor.createGroupHint")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag Overlay - use createPortal to avoid transform issues */}
      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={null}>
            {activeMonitor && (
              <div className="flex items-center gap-2 p-2 rounded-lg border bg-background shadow-lg">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{activeMonitor.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {activeMonitor.type.toUpperCase()}
                </Badge>
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
