"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CollaborativeTimetableItemProps {
  item: {
    id: string;
    name: string;
    durationInMinutes: number;
  };
  idx: number;
  items: Array<{
    id: string;
    name: string;
    durationInMinutes: number;
  }>;
  date: Date | undefined;
  time: string;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string, duration: number) => void;
  onNameFocus?: () => void;
  onNameBlur?: () => void;
  nameFocusUsers?: unknown[];
  onDurationFocus?: () => void;
  onDurationBlur?: () => void;
  durationFocusUsers?: unknown[];
  draggingUsers?: unknown[];
}

export function CollaborativeTimetableItem({
  item,
  idx,
  items,
  date,
  time,
  onRemove,
  onEdit,
  onNameFocus,
  onNameBlur,
  nameFocusUsers,
  onDurationFocus,
  onDurationBlur,
  durationFocusUsers,
  draggingUsers,
}: CollaborativeTimetableItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDuration, setEditDuration] = useState(
    item.durationInMinutes.toString()
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  let startTime: string | null = null;
  if (date && time) {
    let base = new Date(date);
    const [h, m] = time.split(":").map(Number);
    base.setHours(h);
    base.setMinutes(m);
    base.setSeconds(0);
    base.setMilliseconds(0);
    let minutesOffset = 0;
    for (let i = 0; i < idx; ++i) {
      minutesOffset += items[i].durationInMinutes;
    }
    base = new Date(base.getTime() + minutesOffset * 60000);
    startTime = base.toTimeString().slice(0, 5);
  }

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-4 justify-between rounded px-3 py-2 cursor-grab"
      {...attributes}
    >
      {/* Dragging avatars */}
      {draggingUsers && draggingUsers.length > 0 && (
        <div className="flex -space-x-2 mr-2">
          {draggingUsers.map((user, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <div
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor:
                      (user as { userName?: string; color?: string }).color ||
                      "#ccc",
                  }}
                >
                  {(
                    user as { userName?: string; color?: string }
                  ).userName?.charAt(0) || "?"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {(user as { userName?: string; color?: string }).userName ||
                  "匿名ユーザー"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
      <span className="flex items-center gap-4 min-w-0 flex-1">
        <span {...listeners} className="text-muted-foreground cursor-grab mr-1">
          <GripVertical size={20} />
        </span>
        {startTime && (
          <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium text-sm tracking-widest min-w-[4.5rem] text-center border border-border">
            {startTime}
          </span>
        )}
        <div className="relative min-w-0 max-w-[10rem] flex-1">
          <Input
            className="font-semibold truncate text-lg min-w-0 max-w-[10rem] border-none focus:ring-0 focus:border-none shadow-none"
            value={item.name}
            onChange={(e) =>
              onEdit(item.id, e.target.value, item.durationInMinutes)
            }
            onFocus={onNameFocus}
            onBlur={onNameBlur}
          />
          {/* Avatars for name focus */}
          <div className="absolute -top-3 -right-3 flex space-x-1">
            {(nameFocusUsers || []).map((user, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor:
                        (user as { userName?: string; color?: string }).color ||
                        "#ccc",
                    }}
                  >
                    {(
                      user as { userName?: string; color?: string }
                    ).userName?.charAt(0) || "?"}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {(user as { userName?: string; color?: string }).userName ||
                    "匿名ユーザー"}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="relative ml-2 min-w-[4.5rem] w-24">
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            className="text-primary font-medium text-sm tracking-widest text-center w-full border-none focus:ring-0 focus:border-none shadow-none"
            value={item.durationInMinutes}
            onChange={(e) => onEdit(item.id, item.name, Number(e.target.value))}
            onFocus={onDurationFocus}
            onBlur={onDurationBlur}
          />
          {/* Avatars for duration focus */}
          <div className="absolute -top-3 -right-3 flex space-x-1">
            {(durationFocusUsers || []).map((user, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor:
                        (user as { userName?: string; color?: string }).color ||
                        "#ccc",
                    }}
                  >
                    {(
                      user as { userName?: string; color?: string }
                    ).userName?.charAt(0) || "?"}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {(user as { userName?: string; color?: string }).userName ||
                    "匿名ユーザー"}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <span className="ml-1 text-sm text-muted-foreground">分</span>
      </span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onRemove(item.id)}
        aria-label="削除"
      >
        <Trash2 className="size-5 text-muted-foreground" />
      </Button>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              setEditName(item.name);
              setEditDuration(item.durationInMinutes.toString());
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>項目を編集</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">項目名</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">所要時間（分）</label>
              <Input
                type="number"
                min="0"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                onEdit(item.id, editName, Number(editDuration));
                setEditDialogOpen(false);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
