"use client";

import { GroupItemContent } from "./group-item-content";
import { ServiceItemContent } from "./service-item-content";
import type { Monitor, FlattenedServiceGroup } from "@/types";

export interface TreeItemContentProps {
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
  clone?: boolean;
  childCount?: number;
}

/**
 * Dispatcher component that renders either a GroupItemContent or ServiceItemContent
 * based on the item type.
 */
export function TreeItemContent({
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
  clone,
  childCount,
}: TreeItemContentProps) {
  if (item.type === "group") {
    return (
      <GroupItemContent
        item={item}
        depth={depth}
        isEditing={editingGroupId === item.id}
        childCount={childCount ?? 0}
        onToggleCollapse={onToggleCollapse}
        onRename={onRename}
        onDelete={onDelete}
        onAddSubgroup={onAddSubgroup}
        onStartEdit={onStartEdit}
        canDrag={canDrag}
        canEdit={canEdit}
        dragHandleProps={dragHandleProps}
        ghost={ghost}
        clone={clone}
      />
    );
  }

  return (
    <ServiceItemContent
      item={item}
      depth={depth}
      monitor={monitor}
      isSelected={monitor?.id === selectedMonitorId}
      onSelect={onSelectMonitor}
      canDrag={canDrag}
      dragHandleProps={dragHandleProps}
      ghost={ghost}
      clone={clone}
    />
  );
}
