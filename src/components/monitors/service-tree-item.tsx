"use client";

import { forwardRef, useState, useEffect, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Folder, FolderOpen, GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CSS, useSortable } from "@/components/dnd/dnd-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ServiceGroup, Monitor } from "@/types";
import { StatusIndicator } from "./status-indicator";
import { UptimeBar } from "./uptime-bar";

interface ServiceTreeItemProps {
  item: ServiceGroup;
  depth: number;
  monitor?: Monitor;
  onCollapse?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  clone?: boolean;
  ghost?: boolean;
  childCount?: number;
  indentationWidth?: number;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

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

export const ServiceTreeItem = forwardRef<HTMLDivElement, ServiceTreeItemProps>(
  function ServiceTreeItem(
    {
      item,
      depth,
      monitor,
      onCollapse,
      onDelete,
      onRename,
      clone,
      ghost,
      childCount,
      indentationWidth = 24,
      isEditing: isEditingProp = false,
      onEditingChange,
    },
    ref
  ) {
    const router = useRouter();
    const [isEditingLocal, setIsEditingLocal] = useState(false);
    const [editName, setEditName] = useState(item.name);
    const [pendingEdit, setPendingEdit] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use prop if provided, otherwise use local state
    const isEditing = onEditingChange ? isEditingProp : isEditingLocal;
    const setIsEditing = onEditingChange ? onEditingChange : setIsEditingLocal;

    // Reset editName when entering edit mode from external trigger
    useEffect(() => {
      if (isEditingProp) {
        setEditName(item.name);
      }
    }, [isEditingProp, item.name]);

    // Focus input when entering edit mode
    useEffect(() => {
      if (isEditing) {
        // Small delay to ensure the input is rendered
        const timer = setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [isEditing]);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style: CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const isGroup = item.type === "group";
    const hasChildren = item.children && item.children.length > 0;

    const handleStartEdit = () => {
      setEditName(item.name);
      setIsEditing(true);
    };

    const handleSaveEdit = () => {
      if (editName.trim() && editName !== item.name) {
        onRename?.(item.id, editName.trim());
      }
      setIsEditing(false);
    };

    const handleCancelEdit = () => {
      setEditName(item.name);
      setIsEditing(false);
    };

    const handleDropdownCloseAutoFocus = (e: Event) => {
      if (pendingEdit) {
        e.preventDefault();
        setPendingEdit(false);
        handleStartEdit();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    };

    const handleRowClick = (e: React.MouseEvent) => {
      // Don't navigate if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("input")) {
        return;
      }
      // Only navigate for services with a monitor
      if (!isGroup && monitor) {
        router.push(`/monitors/${monitor.id}`);
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        data-tree-item-id={item.id}
        onClick={handleRowClick}
        className={cn(
          "group flex items-center gap-3 py-2 px-4 border-b bg-card",
          isDragging && "opacity-50",
          ghost && "opacity-30 bg-primary/5",
          clone && "shadow-lg rounded-md border",
          !isGroup && monitor && "cursor-pointer hover:bg-accent/50"
        )}
      >
        {/* Indentation spacer */}
        {depth > 0 && !clone && (
          <div style={{ width: depth * indentationWidth }} className="shrink-0" />
        )}

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Collapse/Expand button for groups */}
        {isGroup ? (
          <button
            onClick={() => onCollapse?.(item.id)}
            className={cn(
              "p-0.5 hover:bg-accent rounded transition-transform shrink-0",
              !hasChildren && "invisible"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                !item.collapsed && "rotate-90"
              )}
            />
          </button>
        ) : (
          <div className="w-5 shrink-0" />
        )}

        {/* Status indicator / Folder icon */}
        <div className="shrink-0">
          {isGroup ? (
            item.collapsed ? (
              <Folder className="h-4 w-4 text-muted-foreground" />
            ) : (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            )
          ) : monitor ? (
            <StatusIndicator status={monitor.status} />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>

        {/* Name + Type */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm"
            />
          ) : (
            <>
              <span className={cn("font-medium", isGroup && "text-sm")}>
                {item.name}
              </span>
              {!isGroup && monitor && (
                <span className="ml-2 text-xs text-muted-foreground uppercase">
                  {monitor.type}
                </span>
              )}
              {isGroup && item.collapsed && childCount !== undefined && childCount > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({childCount} {childCount === 1 ? "Element" : "Elemente"})
                </span>
              )}
            </>
          )}
        </div>

        {/* Uptime Bar - flexible width */}
        <div className="flex-1 min-w-[100px] max-w-[280px] hidden sm:block">
          {!isGroup && monitor && (
            <UptimeBar
              uptime={monitor.uptime24h}
              segments={monitor.uptimeHistory}
            />
          )}
        </div>

        {/* Last Check */}
        <div className="w-[70px] text-right hidden md:block shrink-0">
          {!isGroup && monitor && (
            <span className="text-sm text-muted-foreground">
              {formatLastCheck(monitor.lastCheck)}
            </span>
          )}
        </div>

        {/* Actions Menu - only for groups */}
        {isGroup && !clone && (
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onCloseAutoFocus={handleDropdownCloseAutoFocus}>
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

        {/* Clone indicator */}
        {clone && childCount !== undefined && childCount > 0 && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">
            +{childCount}
          </span>
        )}
      </div>
    );
  }
);
