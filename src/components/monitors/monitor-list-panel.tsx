"use client";

import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Search, FolderPlus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  MeasuringStrategy,
} from "@/components/dnd/dnd-provider";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  CSS,
} from "@/components/dnd/dnd-provider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TreeItemContent, useDndTree } from "./tree-item";
import { findItemDeep, countDescendants } from "@/lib/tree-utils";
import type { Monitor, ServiceGroup, FlattenedServiceGroup } from "@/types";

// Fallback UUID generator for browsers that don't support crypto.randomUUID()
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface MonitorListPanelProps {
  monitors: Monitor[];
  serviceGroups: ServiceGroup[];
  selectedMonitorId: string | null;
  onSelectMonitor: (id: string) => void;
  onServiceGroupsChange?: (groups: ServiceGroup[]) => void;
  className?: string;
}

export function MonitorListPanel({
  monitors,
  serviceGroups,
  selectedMonitorId,
  onSelectMonitor,
  onServiceGroupsChange,
  className,
}: MonitorListPanelProps) {
  const t = useTranslations("monitors");
  const [search, setSearch] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [pendingGroups, setPendingGroups] = useState<ServiceGroup[]>([]);

  // Combine saved groups with pending (unsaved) groups for display
  const allGroups = useMemo(() => {
    const combined = [...serviceGroups, ...pendingGroups];
    console.log('[MonitorListPanel] Combining groups - saved:', serviceGroups.length, 'pending:', pendingGroups.length, 'total:', combined.length);
    return combined;
  }, [serviceGroups, pendingGroups]);

  // DnD tree hook - handles all drag-and-drop logic
  const {
    activeId,
    activeItem,
    flattenedItems,
    sortedIds,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getItemDepth,
  } = useDndTree({
    serviceGroups: allGroups,
    onServiceGroupsChange,
    disabled: !!search, // Disable DnD during search
  });

  const getMonitor = useCallback(
    (monitorId: string | undefined) => {
      if (!monitorId) return undefined;
      return monitors.find((m) => m.id === monitorId);
    },
    [monitors]
  );

  // Filter items by search
  const matchesSearch = useCallback(
    (item: ServiceGroup): boolean => {
      if (!search) return true;
      const searchLower = search.toLowerCase();

      if (item.name.toLowerCase().includes(searchLower)) return true;

      if (item.type === "service" && item.monitorId) {
        const monitor = getMonitor(item.monitorId);
        if (monitor?.url.toLowerCase().includes(searchLower)) return true;
      }

      if (item.children) {
        return item.children.some((child) => matchesSearch(child));
      }

      return false;
    },
    [search, getMonitor]
  );

  // Count total services
  const totalServices = useMemo(() => {
    const count = (items: ServiceGroup[]): number => {
      return items.reduce((sum, item) => {
        if (item.type === "service") return sum + 1;
        if (item.children) return sum + count(item.children);
        return sum;
      }, 0);
    };
    return count(allGroups);
  }, [allGroups]);

  // Toggle collapse state
  const toggleGroup = useCallback(
    (groupId: string) => {
      const toggleInTree = (items: ServiceGroup[]): ServiceGroup[] => {
        return items.map((item) => {
          if (item.id === groupId) {
            return { ...item, collapsed: !item.collapsed };
          }
          if (item.children?.length) {
            return { ...item, children: toggleInTree(item.children) };
          }
          return item;
        });
      };

      // Check if group is pending or saved
      const isPending = pendingGroups.some((g) => g.id === groupId);

      if (isPending) {
        // Update in pending groups (local state only)
        setPendingGroups((prev) => toggleInTree(prev));
      } else {
        // Update in saved groups (via backend)
        onServiceGroupsChange?.(toggleInTree(serviceGroups));
      }
    },
    [serviceGroups, pendingGroups, onServiceGroupsChange]
  );

  // Add new group at root level
  const handleAddGroup = useCallback(() => {
    try {
      console.log('[MonitorListPanel] handleAddGroup called');

      const newGroupId = generateUUID();
      console.log('[MonitorListPanel] Generated ID:', newGroupId);

      const newGroup: ServiceGroup = {
        id: newGroupId,
        name: t("groups.newGroup"),
        type: "group",
        children: [],
      };
      console.log('[MonitorListPanel] Creating new group:', newGroup);

      // Add to pending groups (local state) - don't call backend yet
      // The rename handler will save it to backend when user finishes editing
      setPendingGroups((prev) => {
        const updated = [...prev, newGroup];
        console.log('[MonitorListPanel] Updated pendingGroups:', updated);
        return updated;
      });
      setEditingGroupId(newGroupId);
      console.log('[MonitorListPanel] Set editingGroupId to:', newGroupId);
    } catch (error) {
      console.error('[MonitorListPanel] Error in handleAddGroup:', error);
    }
  }, [t]);

  // Rename a group
  const handleRenameGroup = useCallback(
    (groupId: string, newName: string) => {
      // Check if this is a pending (unsaved) group
      const isPending = pendingGroups.some((g) => g.id === groupId);

      if (isPending) {
        // For pending groups: rename and save to backend (moving from pending to saved)
        const pendingGroup = pendingGroups.find((g) => g.id === groupId);
        if (pendingGroup) {
          const renamedGroup = { ...pendingGroup, name: newName };
          // Remove from pending and add to saved groups via backend
          setPendingGroups((prev) => prev.filter((g) => g.id !== groupId));
          onServiceGroupsChange?.([...serviceGroups, renamedGroup]);
        }
      } else {
        // For saved groups: just rename via backend
        const renameInTree = (items: ServiceGroup[]): ServiceGroup[] => {
          return items.map((item) => {
            if (item.id === groupId) {
              return { ...item, name: newName };
            }
            if (item.children?.length) {
              return { ...item, children: renameInTree(item.children) };
            }
            return item;
          });
        };
        onServiceGroupsChange?.(renameInTree(serviceGroups));
      }
    },
    [serviceGroups, pendingGroups, onServiceGroupsChange]
  );

  // Delete a group
  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      // Check if this is a pending (unsaved) group
      const isPending = pendingGroups.some((g) => g.id === groupId);

      if (isPending) {
        // For pending groups: just remove from local state (no backend call)
        setPendingGroups((prev) => prev.filter((g) => g.id !== groupId));
      } else {
        // For saved groups: delete via backend
        const deleteFromTree = (items: ServiceGroup[]): ServiceGroup[] => {
          return items
            .filter((item) => item.id !== groupId)
            .map((item) => {
              if (item.children?.length) {
                return { ...item, children: deleteFromTree(item.children) };
              }
              return item;
            });
        };
        onServiceGroupsChange?.(deleteFromTree(serviceGroups));
      }
    },
    [serviceGroups, pendingGroups, onServiceGroupsChange]
  );

  // Add subgroup to a parent group
  const handleAddSubgroup = useCallback(
    (parentId: string) => {
      const newGroupId = generateUUID();
      const newGroup: ServiceGroup = {
        id: newGroupId,
        name: t("groups.newGroup"),
        type: "group",
        children: [],
      };

      const addToTree = (items: ServiceGroup[]): ServiceGroup[] => {
        return items.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              collapsed: false,
              children: [...(item.children || []), newGroup],
            };
          }
          if (item.children?.length) {
            return { ...item, children: addToTree(item.children) };
          }
          return item;
        });
      };

      // Check if parent is pending or saved
      const isPending = pendingGroups.some((g) => g.id === parentId);

      if (isPending) {
        // Add to pending parent (local state only)
        setPendingGroups((prev) => addToTree(prev));
      } else {
        // Add to saved parent (via backend)
        // Note: The new subgroup itself won't be saved until renamed
        // For now, add it directly and save immediately
        onServiceGroupsChange?.(addToTree(serviceGroups));
      }

      setEditingGroupId(newGroupId);
    },
    [serviceGroups, pendingGroups, onServiceGroupsChange, t]
  );

  // Filter flattenedItems for search
  const visibleItems = useMemo(() => {
    if (!search) return flattenedItems;
    return flattenedItems.filter((item) => {
      const original = findItemDeep(allGroups, item.id);
      return original && matchesSearch(original);
    });
  }, [flattenedItems, search, allGroups, matchesSearch]);

  const canDrag = !!onServiceGroupsChange && !search;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Search */}
      <div className="p-3 space-y-2 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("list.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {onServiceGroupsChange && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddGroup}
              title={t("groups.newGroup")}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("list.servicesCount", { count: totalServices })}
        </p>
      </div>

      {/* Tree View with DnD */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
            <div className="py-1">
              {visibleItems.map((item) => {
                const monitor = getMonitor(item.monitorId);
                const childCount = countDescendants(
                  findItemDeep(allGroups, item.id) || item
                );

                return (
                  <SortableTreeItem
                    key={item.id}
                    item={item}
                    depth={getItemDepth(item.id)}
                    monitor={monitor}
                    selectedMonitorId={selectedMonitorId}
                    onSelectMonitor={onSelectMonitor}
                    onToggleCollapse={toggleGroup}
                    onRename={handleRenameGroup}
                    onDelete={handleDeleteGroup}
                    onAddSubgroup={handleAddSubgroup}
                    editingGroupId={editingGroupId}
                    onStartEdit={setEditingGroupId}
                    canEdit={!!onServiceGroupsChange}
                    canDrag={canDrag}
                    ghost={item.id === activeId}
                    childCount={childCount}
                  />
                );
              })}
            </div>
          </SortableContext>

          {typeof document !== "undefined" &&
            createPortal(
              <DragOverlay>
                {activeItem && (
                  <TreeItemContent
                    item={activeItem}
                    depth={0}
                    monitor={getMonitor(activeItem.monitorId)}
                    selectedMonitorId={selectedMonitorId}
                    childCount={countDescendants(
                      findItemDeep(allGroups, activeItem.id) || activeItem
                    )}
                    clone
                  />
                )}
              </DragOverlay>,
              document.body
            )}
        </DndContext>
      </div>
    </div>
  );
}

// Sortable wrapper for tree items
interface SortableTreeItemProps {
  item: FlattenedServiceGroup;
  depth: number;
  monitor?: Monitor;
  selectedMonitorId: string | null;
  onSelectMonitor: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddSubgroup: (id: string) => void;
  editingGroupId: string | null;
  onStartEdit: (id: string | null) => void;
  canEdit: boolean;
  canDrag: boolean;
  ghost?: boolean;
  childCount: number;
}

function SortableTreeItem({
  item,
  depth,
  monitor,
  selectedMonitorId,
  onSelectMonitor,
  onToggleCollapse,
  onRename,
  onDelete,
  onAddSubgroup,
  editingGroupId,
  onStartEdit,
  canEdit,
  canDrag,
  ghost,
  childCount,
}: SortableTreeItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id, disabled: !canDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TreeItemContent
        item={item}
        depth={depth}
        monitor={monitor}
        selectedMonitorId={selectedMonitorId}
        onSelectMonitor={onSelectMonitor}
        onToggleCollapse={onToggleCollapse}
        onRename={onRename}
        onDelete={onDelete}
        onAddSubgroup={onAddSubgroup}
        editingGroupId={editingGroupId}
        onStartEdit={onStartEdit}
        canEdit={canEdit}
        canDrag={canDrag}
        dragHandleProps={{ ...attributes, ...listeners }}
        ghost={ghost}
        childCount={childCount}
      />
    </div>
  );
}
