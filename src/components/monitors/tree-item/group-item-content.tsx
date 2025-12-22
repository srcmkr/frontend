"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FlattenedServiceGroup } from "@/types";

const INDENTATION_WIDTH = 20;

export interface GroupItemContentProps {
  item: FlattenedServiceGroup;
  depth: number;
  isEditing: boolean;
  childCount: number;
  onToggleCollapse?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onAddSubgroup?: (id: string) => void;
  onStartEdit?: (id: string | null) => void;
  canDrag?: boolean;
  canEdit?: boolean;
  dragHandleProps?: Record<string, unknown>;
  ghost?: boolean;
  clone?: boolean;
}

export function GroupItemContent({
  item,
  depth,
  isEditing,
  childCount,
  onToggleCollapse,
  onRename,
  onDelete,
  onAddSubgroup,
  onStartEdit,
  canDrag,
  canEdit,
  dragHandleProps,
  ghost,
  clone,
}: GroupItemContentProps) {
  const t = useTranslations("monitors");
  const [editName, setEditName] = useState(item.name);
  const [pendingEdit, setPendingEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCollapsed = item.collapsed;
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
          {childCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {childCount}
            </span>
          )}
        </>
      )}

      {/* Clone indicator */}
      {clone && childCount > 0 && (
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
                {t("groups.createSubfolder")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPendingEdit(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                {t("groups.rename")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete?.(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("detail.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
