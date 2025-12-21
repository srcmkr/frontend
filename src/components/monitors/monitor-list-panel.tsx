"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@/components/dnd/dnd-provider";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  CSS,
} from "@/components/dnd/dnd-provider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "./status-indicator";
import { formatResponseTime } from "@/lib/format-utils";
import {
  flattenTree,
  getProjection,
  findItemDeep,
  countDescendants,
} from "@/lib/tree-utils";
import type { Monitor, ServiceGroup, FlattenedServiceGroup } from "@/types";

const INDENTATION_WIDTH = 20;

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
  const [search, setSearch] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  // Flatten tree for DnD
  const flattenedItems = useMemo(() => flattenTree(serviceGroups), [serviceGroups]);

  const sortedIds = useMemo(
    () => flattenedItems.map((item) => item.id),
    [flattenedItems]
  );

  const activeItem = activeId
    ? flattenedItems.find((item) => item.id === activeId)
    : null;

  const projected = useMemo(() => {
    if (activeId && overId) {
      return getProjection(
        flattenedItems,
        activeId,
        overId,
        offsetLeft,
        INDENTATION_WIDTH
      );
    }
    return null;
  }, [activeId, overId, flattenedItems, offsetLeft]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    return count(serviceGroups);
  }, [serviceGroups]);

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
      onServiceGroupsChange?.(toggleInTree(serviceGroups));
    },
    [serviceGroups, onServiceGroupsChange]
  );

  // Add new group at root level
  const handleAddGroup = useCallback(() => {
    const newGroupId = `group-${Date.now()}`;
    const newGroup: ServiceGroup = {
      id: newGroupId,
      name: "Neue Gruppe",
      type: "group",
      children: [],
    };
    onServiceGroupsChange?.([...serviceGroups, newGroup]);
    setEditingGroupId(newGroupId);
  }, [serviceGroups, onServiceGroupsChange]);

  // Rename a group
  const handleRenameGroup = useCallback(
    (groupId: string, newName: string) => {
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
    },
    [serviceGroups, onServiceGroupsChange]
  );

  // Delete a group
  const handleDeleteGroup = useCallback(
    (groupId: string) => {
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
    },
    [serviceGroups, onServiceGroupsChange]
  );

  // Add subgroup to a parent group
  const handleAddSubgroup = useCallback(
    (parentId: string) => {
      const newGroupId = `group-${Date.now()}`;
      const newGroup: ServiceGroup = {
        id: newGroupId,
        name: "Neuer Unterordner",
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

      onServiceGroupsChange?.(addToTree(serviceGroups));
      setEditingGroupId(newGroupId);
    },
    [serviceGroups, onServiceGroupsChange]
  );

  // DnD Handlers
  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    setOverId(active.id as string);
  }, []);

  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  }, []);

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    setOverId(over?.id as string | null);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      resetDragState();

      if (!over || active.id === over.id || !onServiceGroupsChange) return;

      const activeIndex = flattenedItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = flattenedItems.findIndex((item) => item.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return;

      const projection = getProjection(
        flattenedItems,
        active.id as string,
        over.id as string,
        offsetLeft,
        INDENTATION_WIDTH
      );

      // Create new flattened array with the item moved
      const newFlattenedItems = arrayMove(flattenedItems, activeIndex, overIndex);

      // Update the moved item's parentId and depth
      const movedItemIndex = newFlattenedItems.findIndex(
        (item) => item.id === active.id
      );
      newFlattenedItems[movedItemIndex] = {
        ...newFlattenedItems[movedItemIndex],
        parentId: projection.parentId,
        depth: projection.depth,
      };

      // Rebuild tree from flattened items
      const newTree = buildTreeFromFlattened(newFlattenedItems, serviceGroups);
      onServiceGroupsChange(newTree);
    },
    [flattenedItems, offsetLeft, serviceGroups, onServiceGroupsChange]
  );

  const handleDragCancel = useCallback(() => {
    resetDragState();
  }, []);

  const resetDragState = () => {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
  };

  // Filter flattenedItems for search
  const visibleItems = useMemo(() => {
    if (!search) return flattenedItems;
    return flattenedItems.filter((item) => {
      const original = findItemDeep(serviceGroups, item.id);
      return original && matchesSearch(original);
    });
  }, [flattenedItems, search, serviceGroups, matchesSearch]);

  const canDrag = !!onServiceGroupsChange && !search;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Search */}
      <div className="p-3 space-y-2 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
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
              title="Neue Gruppe erstellen"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {totalServices} Services
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
                  findItemDeep(serviceGroups, item.id) || item
                );

                return (
                  <SortableTreeItem
                    key={item.id}
                    item={item}
                    depth={item.id === activeId && projected ? projected.depth : item.depth}
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
                      findItemDeep(serviceGroups, activeItem.id) || activeItem
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !canDrag });

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
        isDragging={isDragging}
        childCount={childCount}
      />
    </div>
  );
}

// The actual tree item content
interface TreeItemContentProps {
  item: FlattenedServiceGroup;
  depth: number;
  monitor?: Monitor;
  selectedMonitorId?: string | null;
  onSelectMonitor?: (id: string) => void;
  onToggleCollapse?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onAddSubgroup?: (id: string) => void;
  editingGroupId?: string | null;
  onStartEdit?: (id: string | null) => void;
  canEdit?: boolean;
  canDrag?: boolean;
  dragHandleProps?: Record<string, unknown>;
  ghost?: boolean;
  isDragging?: boolean;
  clone?: boolean;
  childCount?: number;
}

function TreeItemContent({
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
  dragHandleProps,
  ghost,
  isDragging,
  clone,
  childCount,
}: TreeItemContentProps) {
  const [editName, setEditName] = useState(item.name);
  const [pendingEdit, setPendingEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingGroupId === item.id;
  const isGroup = item.type === "group";
  const isCollapsed = item.collapsed;
  const isSelected = monitor?.id === selectedMonitorId;
  const indentPx = depth * INDENTATION_WIDTH;

  // Reset editName when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditName(item.name);
    }
  }, [isEditing, item.name]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const newName = editName.trim();
    onStartEdit?.(null);
    if (newName && newName !== item.name) {
      onRename?.(item.id, newName);
    }
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    onStartEdit?.(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDropdownCloseAutoFocus = (e: Event) => {
    if (pendingEdit) {
      e.preventDefault();
      setPendingEdit(false);
      onStartEdit?.(item.id);
    }
  };

  if (isGroup) {
    return (
      <div
        className={cn(
          "group flex items-center gap-1 py-1.5 px-2 hover:bg-accent/50 transition-colors",
          ghost && "opacity-30",
          clone && "shadow-lg rounded-md border bg-card"
        )}
        style={{ paddingLeft: `${8 + indentPx}px` }}
      >
        {/* Drag handle */}
        {canDrag && (
          <button
            {...dragHandleProps}
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0 p-0.5"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Collapse button */}
        <button
          onClick={() => onToggleCollapse?.(item.id)}
          className="p-0.5 hover:bg-accent rounded shrink-0"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              !isCollapsed && "rotate-90"
            )}
          />
        </button>

        {/* Folder icon */}
        {isCollapsed ? (
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {/* Name or Input */}
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm flex-1"
          />
        ) : (
          <>
            <span
              className="flex-1 text-sm font-medium truncate cursor-pointer"
              onClick={() => onToggleCollapse?.(item.id)}
            >
              {item.name}
            </span>
            {childCount !== undefined && childCount > 0 && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {childCount}
              </span>
            )}
          </>
        )}

        {/* Clone indicator */}
        {clone && childCount !== undefined && childCount > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">
            +{childCount}
          </span>
        )}

        {/* Actions Menu */}
        {canEdit && !isEditing && !clone && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onCloseAutoFocus={handleDropdownCloseAutoFocus}
              >
                <DropdownMenuItem onSelect={() => onAddSubgroup?.(item.id)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Unterordner erstellen
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPendingEdit(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Umbenennen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onDelete?.(item.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  }

  // Service item
  return (
    <button
      onClick={() => monitor && onSelectMonitor?.(monitor.id)}
      className={cn(
        "w-full flex items-center gap-2 py-2 px-3 transition-colors text-left",
        isSelected ? "bg-accent" : "hover:bg-accent/50",
        ghost && "opacity-30",
        clone && "shadow-lg rounded-md border bg-card"
      )}
      style={{ paddingLeft: `${8 + indentPx}px` }}
    >
      {/* Drag handle */}
      {canDrag && (
        <div
          {...dragHandleProps}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0 p-0.5"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Spacer for alignment with groups (when no drag handle) */}
      {!canDrag && <div className="w-4 shrink-0" />}

      <StatusIndicator status={monitor?.status ?? "pending"} size="sm" />

      <span className="flex-1 text-sm truncate">{item.name}</span>

      <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
        {formatResponseTime(monitor?.lastResponseTime ?? null)}
      </span>
    </button>
  );
}

// Rebuild tree from flattened items
function buildTreeFromFlattened(
  flattened: FlattenedServiceGroup[],
  originalItems: ServiceGroup[]
): ServiceGroup[] {
  const itemMap = new Map<string, ServiceGroup>();
  const rootItems: ServiceGroup[] = [];

  // First pass: create all items
  flattened.forEach((item) => {
    const original = findItemDeep(originalItems, item.id);
    itemMap.set(item.id, {
      id: item.id,
      name: item.name,
      type: item.type,
      monitorId: item.monitorId,
      collapsed: original?.collapsed ?? item.collapsed,
      children: [],
    });
  });

  // Second pass: build hierarchy
  flattened.forEach((item) => {
    const current = itemMap.get(item.id)!;
    if (item.parentId === null) {
      rootItems.push(current);
    } else {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(current);
      } else {
        // Parent not found, add to root
        rootItems.push(current);
      }
    }
  });

  // Clean up empty children arrays
  const cleanChildren = (items: ServiceGroup[]): ServiceGroup[] => {
    return items.map((item) => ({
      ...item,
      children:
        item.children && item.children.length > 0
          ? cleanChildren(item.children)
          : undefined,
    }));
  };

  return cleanChildren(rootItems);
}
