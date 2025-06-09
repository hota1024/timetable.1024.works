import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TimetableItem } from "@/models/event";

export interface TimetableListProps {
  items: TimetableItem[];
  date: Date | undefined;
  time: string;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string, duration: number) => void;
  onDragEnd: (event: any) => void;
  onDragStart?: (event: any) => void;
  ItemComponent: React.ComponentType<{
    item: TimetableItem;
    idx: number;
    items: TimetableItem[];
    date: Date | undefined;
    time: string;
    onRemove: (id: string) => void;
    onEdit: (id: string, name: string, duration: number) => void;
  }>;
}

export function TimetableList({
  items,
  date,
  time,
  onRemove,
  onEdit,
  onDragEnd,
  onDragStart,
  ItemComponent,
}: TimetableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="mt-2 flex flex-col gap-2">
          {items.map((item, idx) => (
            <ItemComponent
              key={item.id}
              item={item}
              idx={idx}
              items={items}
              date={date}
              time={time}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
