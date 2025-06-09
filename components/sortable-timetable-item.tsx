import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TimetableItem } from "@/models/event";

export type SortableTimetableItemProps = {
  item: TimetableItem;
  idx: number;
  items: TimetableItem[];
  date: Date | undefined;
  time: string;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string, duration: number) => void;
};

const SortableTimetableItem: React.FC<SortableTimetableItemProps> = React.memo(
  ({ item, idx, items, date, time, onRemove, onEdit }) => {
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
        <span className="flex items-center gap-4 min-w-0 flex-1">
          <span
            {...listeners}
            className="text-muted-foreground cursor-grab mr-1"
          >
            <GripVertical size={20} />
          </span>
          {startTime && (
            <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium text-sm tracking-widest min-w-[4.5rem] text-center border border-border">
              {startTime}
            </span>
          )}
          <Input
            className="font-semibold truncate text-lg min-w-0 max-w-[10rem] border-none focus:ring-0 focus:border-none shadow-none"
            value={item.name}
            onChange={(e) =>
              onEdit(item.id, e.target.value, item.durationInMinutes)
            }
          />
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            className="ml-2 text-primary font-medium text-sm tracking-widest min-w-[4.5rem] text-center w-24 border-none focus:ring-0 focus:border-none shadow-none"
            value={item.durationInMinutes}
            onChange={(e) => onEdit(item.id, item.name, Number(e.target.value))}
          />
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
      </li>
    );
  }
);
SortableTimetableItem.displayName = "SortableTimetableItem";

export default SortableTimetableItem;
