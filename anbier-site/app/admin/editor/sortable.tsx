"use client";

import { type HTMLAttributes, type ReactNode } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export { arrayMove };

export function useDragSensors() {
  return useSensors(
    // 不掛鍵盤拖曳：整塊可拖的項目裡有按鈕，按 Enter 會誤觸拖曳；鍵盤使用者仍有 ↑↓ 按鈕
    // 移動超過 6px 才算拖曳，原本的點擊（展開、選取、按鈕）不受影響
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // 手機要長按才開始拖，否則一滑就拖到、無法捲動頁面
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } })
  );
}

// 單一清單的拖曳排序；ids 只要在拖曳期間穩定即可
export function SortableList({
  ids,
  onMove,
  grid = false,
  children,
}: {
  ids: string[];
  onMove: (from: number, to: number) => void;
  grid?: boolean;
  children: ReactNode;
}) {
  const sensors = useDragSensors();
  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export type DragHandleProps = HTMLAttributes<HTMLElement>;

// handle=true 時只有「⠿」把手能拖（區塊內有輸入框時用），否則整塊都能拖
export function SortableItem({
  id,
  className = "",
  handle = false,
  children,
}: {
  id: string;
  className?: string;
  handle?: boolean;
  children: ReactNode | ((handleProps: DragHandleProps) => ReactNode);
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id });
  const handleProps = { ...attributes, ...listeners } as unknown as DragHandleProps;
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 30 : undefined,
        position: "relative",
      }}
      className={`${className} ${isDragging ? "opacity-80 shadow-2xl ring-1 ring-accent" : ""} ${
        isOver && !isDragging ? "ring-1 ring-accent/50" : ""
      }`}
      {...(handle ? {} : handleProps)}
    >
      {typeof children === "function" ? children(handleProps) : children}
    </div>
  );
}

export function DragHandle(props: DragHandleProps) {
  return (
    <span
      {...props}
      title="按住拖曳調整順序"
      className="px-1.5 py-1 cursor-grab active:cursor-grabbing text-foreground/40 hover:text-accent select-none touch-none"
    >
      ⠿
    </span>
  );
}
