"use client";

import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
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
  arrayMove,
} from "@/components/dnd/dnd-provider";
import type { ServiceGroup, FlattenedServiceGroup, Monitor } from "@/types";
import {
  flattenTree,
  getProjection,
  toggleCollapse,
  countDescendants,
  removeItem,
  findItemDeep,
} from "@/lib/tree-utils";
import { ServiceTreeItem } from "./service-tree-item";

interface ServiceTreeProps {
  items: ServiceGroup[];
  monitors: Monitor[];
  onItemsChange: (items: ServiceGroup[]) => void;
  editingItemId?: string | null;
  onEditingItemIdChange?: (id: string | null) => void;
}

const INDENTATION_WIDTH = 24;

export function ServiceTree({ items, monitors, onItemsChange, editingItemId, onEditingItemIdChange }: ServiceTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const flattenedItems = useMemo(() => flattenTree(items), [items]);

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

  const getMonitorForItem = useCallback(
    (item: ServiceGroup) => {
      if (item.type === "service" && item.monitorId) {
        return monitors.find((m) => m.id === item.monitorId);
      }
      return undefined;
    },
    [monitors]
  );

  const handleCollapse = useCallback(
    (id: string) => {
      onItemsChange(toggleCollapse(items, id));
    },
    [items, onItemsChange]
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      onItemsChange(removeItem(items, id));
    },
    [items, onItemsChange]
  );

  const handleRenameItem = useCallback(
    (id: string, newName: string) => {
      const renameInTree = (treeItems: ServiceGroup[]): ServiceGroup[] => {
        return treeItems.map((item) => {
          if (item.id === id) {
            return { ...item, name: newName };
          }
          if (item.children?.length) {
            return { ...item, children: renameInTree(item.children) };
          }
          return item;
        });
      };
      onItemsChange(renameInTree(items));
    },
    [items, onItemsChange]
  );

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
      resetState();

      if (!over || active.id === over.id) return;

      const activeIndex = flattenedItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = flattenedItems.findIndex((item) => item.id === over.id);

      if (activeIndex === -1 || overIndex === -1) return;

      const activeItem = flattenedItems[activeIndex];
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
      const newTree = buildTreeFromFlattened(newFlattenedItems, items);
      onItemsChange(newTree);
    },
    [flattenedItems, offsetLeft, items, onItemsChange]
  );

  const handleDragCancel = useCallback(() => {
    resetState();
  }, []);

  const resetState = () => {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
  };

  return (
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
        <div className="divide-y">
          {flattenedItems.map((item) => {
            const monitor = getMonitorForItem(item);
            const childCount = countDescendants(
              findItemDeep(items, item.id) || item
            );

            return (
              <ServiceTreeItem
                key={item.id}
                item={item}
                depth={item.id === activeId && projected ? projected.depth : item.depth}
                monitor={monitor}
                onCollapse={handleCollapse}
                onDelete={handleDeleteItem}
                onRename={handleRenameItem}
                childCount={childCount}
                indentationWidth={INDENTATION_WIDTH}
                ghost={item.id === activeId}
                isEditing={item.id === editingItemId}
                onEditingChange={(editing) => {
                  onEditingItemIdChange?.(editing ? item.id : null);
                }}
              />
            );
          })}
        </div>
      </SortableContext>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeItem && (
              <ServiceTreeItem
                item={activeItem}
                depth={0}
                monitor={getMonitorForItem(activeItem)}
                childCount={countDescendants(
                  findItemDeep(items, activeItem.id) || activeItem
                )}
                indentationWidth={INDENTATION_WIDTH}
                clone
              />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}

// Rebuild tree maintaining the structure
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
