"use client";

import { useState, useMemo, useCallback } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@/components/dnd/dnd-provider";
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from "@/components/dnd/dnd-provider";
import {
  flattenTree,
  getProjection,
  findItemDeep,
} from "@/lib/tree-utils";
import type { ServiceGroup, FlattenedServiceGroup } from "@/types";

const INDENTATION_WIDTH = 20;

interface UseDndTreeOptions {
  serviceGroups: ServiceGroup[];
  onServiceGroupsChange?: (groups: ServiceGroup[]) => void;
  disabled?: boolean;
}

interface UseDndTreeReturn {
  // State
  activeId: string | null;
  activeItem: FlattenedServiceGroup | null;
  projected: { parentId: string | null; depth: number } | null;
  flattenedItems: FlattenedServiceGroup[];
  sortedIds: string[];

  // Sensors for DndContext
  sensors: ReturnType<typeof useSensors>;

  // Event handlers for DndContext
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;

  // Helper to get projected depth for an item
  getItemDepth: (itemId: string) => number;
}

/**
 * Custom hook that encapsulates all drag-and-drop tree logic.
 * Handles flattening, projection calculation, and tree rebuilding.
 */
export function useDndTree({
  serviceGroups,
  onServiceGroupsChange,
  disabled = false,
}: UseDndTreeOptions): UseDndTreeReturn {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  // Flatten tree for DnD
  const flattenedItems = useMemo(
    () => flattenTree(serviceGroups),
    [serviceGroups]
  );

  const sortedIds = useMemo(
    () => flattenedItems.map((item) => item.id),
    [flattenedItems]
  );

  const activeItem = useMemo(
    () => (activeId ? flattenedItems.find((item) => item.id === activeId) ?? null : null),
    [activeId, flattenedItems]
  );

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

  // Configure sensors
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

  // Reset all drag state
  const resetDragState = useCallback(() => {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
  }, []);

  // Event handlers
  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    if (disabled) return;
    setActiveId(active.id as string);
    setOverId(active.id as string);
  }, [disabled]);

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
    [flattenedItems, offsetLeft, serviceGroups, onServiceGroupsChange, resetDragState]
  );

  const handleDragCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  // Helper to get the projected depth for rendering
  const getItemDepth = useCallback(
    (itemId: string): number => {
      if (itemId === activeId && projected) {
        return projected.depth;
      }
      const item = flattenedItems.find((i) => i.id === itemId);
      return item?.depth ?? 0;
    },
    [activeId, projected, flattenedItems]
  );

  return {
    activeId,
    activeItem,
    projected,
    flattenedItems,
    sortedIds,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getItemDepth,
  };
}

/**
 * Rebuild tree structure from flattened items.
 * Used after drag-and-drop to reconstruct the hierarchy.
 */
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
