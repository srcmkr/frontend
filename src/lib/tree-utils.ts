import type { ServiceGroup, FlattenedServiceGroup } from "@/types";

// Flatten tree for sortable context
export function flattenTree(
  items: ServiceGroup[],
  parentId: string | null = null,
  depth: number = 0
): FlattenedServiceGroup[] {
  return items.reduce<FlattenedServiceGroup[]>((acc, item, index) => {
    const flattenedItem: FlattenedServiceGroup = {
      ...item,
      parentId,
      depth,
      index,
    };

    acc.push(flattenedItem);

    if (item.children?.length && !item.collapsed) {
      acc.push(...flattenTree(item.children, item.id, depth + 1));
    }

    return acc;
  }, []);
}

// Build tree from flattened items
export function buildTree(flattenedItems: FlattenedServiceGroup[]): ServiceGroup[] {
  const itemMap = new Map<string, ServiceGroup>();
  const rootItems: ServiceGroup[] = [];

  // Create all items without children first
  flattenedItems.forEach((item) => {
    itemMap.set(item.id, {
      id: item.id,
      name: item.name,
      type: item.type,
      monitorId: item.monitorId,
      collapsed: item.collapsed,
      children: [],
    });
  });

  // Build parent-child relationships
  flattenedItems.forEach((item) => {
    const current = itemMap.get(item.id)!;
    if (item.parentId === null) {
      rootItems.push(current);
    } else {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(current);
      }
    }
  });

  return rootItems;
}

// Find item by ID in tree
export function findItemDeep(
  items: ServiceGroup[],
  itemId: string
): ServiceGroup | undefined {
  for (const item of items) {
    if (item.id === itemId) return item;
    if (item.children?.length) {
      const found = findItemDeep(item.children, itemId);
      if (found) return found;
    }
  }
  return undefined;
}

// Find parent of item
export function findParent(
  items: ServiceGroup[],
  itemId: string,
  parent: ServiceGroup | null = null
): ServiceGroup | null {
  for (const item of items) {
    if (item.id === itemId) return parent;
    if (item.children?.length) {
      const found = findParent(item.children, itemId, item);
      if (found !== null) return found;
    }
  }
  return null;
}

// Remove item from tree
export function removeItem(
  items: ServiceGroup[],
  itemId: string
): ServiceGroup[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => ({
      ...item,
      children: item.children ? removeItem(item.children, itemId) : undefined,
    }));
}

// Add item to parent
export function addItemToParent(
  items: ServiceGroup[],
  parentId: string | null,
  item: ServiceGroup,
  index: number
): ServiceGroup[] {
  if (parentId === null) {
    const result = [...items];
    result.splice(index, 0, item);
    return result;
  }

  return items.map((i) => {
    if (i.id === parentId) {
      const children = [...(i.children || [])];
      children.splice(index, 0, item);
      return { ...i, children };
    }
    if (i.children?.length) {
      return {
        ...i,
        children: addItemToParent(i.children, parentId, item, index),
      };
    }
    return i;
  });
}

// Get projected depth based on drag position
// Services can only be children of groups, not other services
export function getProjection(
  items: FlattenedServiceGroup[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number
): { depth: number; maxDepth: number; minDepth: number; parentId: string | null } {
  const overItemIndex = items.findIndex((item) => item.id === overId);
  const activeItemIndex = items.findIndex((item) => item.id === activeId);
  const activeItem = items[activeItemIndex];

  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];

  const dragDepth = Math.round(dragOffset / indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;

  // Calculate max depth - but only allow nesting under groups, not services
  let maxDepth = 0;
  if (previousItem) {
    if (previousItem.type === "group") {
      // Can nest under a group
      maxDepth = previousItem.depth + 1;
    } else {
      // Previous item is a service - can only be sibling, not child
      maxDepth = previousItem.depth;
    }
  }

  const minDepth = nextItem ? nextItem.depth : 0;

  let depth = Math.min(Math.max(projectedDepth, minDepth), maxDepth);

  // Find the parent based on the depth
  let parentId: string | null = null;
  if (depth > 0 && previousItem) {
    if (previousItem.type === "group" && depth === previousItem.depth + 1) {
      // Nesting directly under the previous group
      parentId = previousItem.id;
    } else if (depth === previousItem.depth) {
      // Same level as previous item - share parent
      parentId = previousItem.parentId;
    } else {
      // Find parent at the appropriate depth by walking up the tree
      let item = previousItem;
      while (item && item.depth >= depth) {
        parentId = item.parentId;
        const parentIndex = items.findIndex((i) => i.id === item.parentId);
        if (parentIndex === -1) break;
        item = items[parentIndex];
      }
    }
  }

  // Final validation: ensure parent is a group (if there is a parent)
  if (parentId) {
    const parent = items.find((i) => i.id === parentId);
    if (parent && parent.type === "service") {
      // Parent is a service - move up to its parent
      parentId = parent.parentId;
      depth = parent.depth;
    }
  }

  return { depth, maxDepth, minDepth, parentId };
}

// Helper: array move for reordering
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}

// Count descendants
export function countDescendants(item: ServiceGroup): number {
  if (!item.children?.length) return 0;
  return item.children.reduce(
    (count, child) => count + 1 + countDescendants(child),
    0
  );
}

// Toggle collapse state
export function toggleCollapse(
  items: ServiceGroup[],
  itemId: string
): ServiceGroup[] {
  return items.map((item) => {
    if (item.id === itemId) {
      return { ...item, collapsed: !item.collapsed };
    }
    if (item.children?.length) {
      return { ...item, children: toggleCollapse(item.children, itemId) };
    }
    return item;
  });
}

// Get all service IDs (for filtering with monitors)
export function getServiceIds(items: ServiceGroup[]): string[] {
  return items.flatMap((item) => {
    const ids: string[] = [];
    if (item.type === "service" && item.monitorId) {
      ids.push(item.monitorId);
    }
    if (item.children?.length) {
      ids.push(...getServiceIds(item.children));
    }
    return ids;
  });
}
