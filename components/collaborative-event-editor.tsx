"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Users, Link, Share2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useMyPresence,
  useOthers,
  useMutation,
  useStorage,
} from "@/lib/liveblocks";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CollaborativeTimetableItem } from "@/components/collaborative-timetable-item";
import { EventForm } from "@/components/event-form";
import { TimetableList } from "@/components/timetable-list";
import { saveEventDataToStorage } from "@/lib/eventStorage";
import { useRouter } from "next/navigation";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function combineDateAndTime(
  date: Date | undefined,
  time: string
): Date | undefined {
  if (!date || !time) return undefined;
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours);
  result.setMinutes(minutes);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

export function CollaborativeEventEditor() {
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const router = useRouter();

  // Liveblocksストレージからデータを取得
  const eventName = useStorage((root) => root.eventName);
  const startDate = useStorage((root) => root.startDate);
  const items = useStorage((root) => root.items);
  const id = useStorage((root) => root.id);

  // ローカル状態
  const [localName, setLocalName] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDuration, setItemDuration] = useState("0");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // ストレージを更新するミューテーション
  const updateEventName = useMutation(({ storage }, name: string) => {
    storage.set("eventName", name);
  }, []);

  const updateStartDate = useMutation(({ storage }, dateStr: string) => {
    storage.set("startDate", dateStr);
  }, []);

  const addItem = useMutation(
    (
      { storage },
      item: { id: string; name: string; durationInMinutes: number }
    ) => {
      const currentItems = storage.get("items");
      const newItems = [...currentItems, item];
      storage.set("items", newItems);
    },
    []
  );

  const removeItem = useMutation(({ storage }, id: string) => {
    const currentItems = storage.get("items");
    const newItems = currentItems.filter((item) => item.id !== id);
    storage.set("items", newItems);
  }, []);

  const updateItem = useMutation(
    (
      { storage },
      {
        id,
        name,
        durationInMinutes,
      }: { id: string; name: string; durationInMinutes: number }
    ) => {
      const currentItems = storage.get("items");
      const newItems = currentItems.map((item) =>
        item.id === id ? { ...item, name, durationInMinutes } : item
      );
      storage.set("items", newItems);
    },
    []
  );

  const reorderItems = useMutation(
    (
      { storage },
      { oldIndex, newIndex }: { oldIndex: number; newIndex: number }
    ) => {
      const currentItems = storage.get("items");
      const newItems = [...currentItems];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      storage.set("items", newItems);
    },
    []
  );

  // ストレージの値をローカル状態に同期
  useEffect(() => {
    if (eventName !== undefined) {
      setLocalName(eventName);
    }
  }, [eventName]);

  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate);
      setDate(d);
      setTime(d.toTimeString().slice(0, 5));
    }
  }, [startDate]);

  // 名前の変更をLiveblocksに同期（デバウンス）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localName !== eventName) {
        updateEventName(localName);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localName, eventName, updateEventName]);

  const handleDateTimeChange = useCallback(() => {
    const combinedDate = combineDateAndTime(date, time);
    if (combinedDate) {
      updateStartDate(combinedDate.toISOString());
    }
  }, [date, time, updateStartDate]);

  useEffect(() => {
    handleDateTimeChange();
  }, [handleDateTimeChange]);

  const handleAddItem = () => {
    if (!itemName || !itemDuration) return;

    const newItem = {
      id: generateId(),
      name: itemName,
      durationInMinutes: Number(itemDuration),
    };

    addItem(newItem);
    setItemName("");
    setItemDuration("0");
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // DnD handler
  function handleDragEnd(event: any) {
    const { active, over } = event;
    // Clear dragging state
    updateMyPresence({ draggingItemId: null });
    if (active.id !== over?.id) {
      const itemsArray = items || [];
      const oldIndex = itemsArray.findIndex((i: any) => i.id === active.id);
      const newIndex = itemsArray.findIndex((i: any) => i.id === over.id);
      reorderItems({ oldIndex, newIndex });
    }
  }

  // DnD: Set dragging state
  function handleDragStart(event: any) {
    if (event.active?.id) {
      updateMyPresence({ draggingItemId: String(event.active.id) });
    }
  }

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("協調編集リンクをクリップボードにコピーしました");
  };

  const currentUsers = [myPresence, ...others.map((o) => o.presence)];

  // --- Collaborative Focus Logic ---
  // Helper to get users focusing a field
  const getFocusUsers = (field: string) =>
    others
      .filter((o) => o.presence.focusedField === field)
      .map((o) => o.presence);

  // Focus/blur handlers for each field
  const handleFocus = (field: string) =>
    updateMyPresence({ focusedField: field });
  const handleBlur = () => updateMyPresence({ focusedField: null });

  // 保存処理
  const handleSave = () => {
    if (!id || !eventName || !startDate || !items) {
      toast.error("保存できるデータがありません");
      return;
    }
    const eventData = {
      id,
      name: eventName,
      startDate: new Date(startDate),
      items: items,
      createdAt: new Date(),
    };
    saveEventDataToStorage(eventData, id);
    toast.success("イベントを保存しました");
  };

  // Set a random color for the user if not already set
  useEffect(() => {
    if (!myPresence.color) {
      // Generate a visually distinct random HSL color
      const hue = Math.floor(Math.random() * 360);
      const color = `hsl(${hue}, 70%, 60%)`;
      updateMyPresence({ color });
    }
  }, [myPresence.color, updateMyPresence]);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">リアルタイム協調編集</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {currentUsers.length}人
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {currentUsers.slice(0, 5).map((user, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: user.color,
                        }}
                      >
                        {user.userName?.charAt(0) || "?"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {user.userName || "匿名ユーザー"}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {currentUsers.length > 5 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs">
                    +{currentUsers.length - 5}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                リンク共有
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-8">
            <EventForm
              name={localName}
              setName={setLocalName}
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              itemName={itemName}
              setItemName={setItemName}
              itemDuration={itemDuration}
              setItemDuration={setItemDuration}
              onAddItem={handleAddItem}
              datePopoverOpen={datePopoverOpen}
              setDatePopoverOpen={setDatePopoverOpen}
              onNameFocus={() => handleFocus("eventName")}
              onNameBlur={handleBlur}
              nameFocusUsers={getFocusUsers("eventName")}
              onDateFocus={() => handleFocus("startDate")}
              onDateBlur={handleBlur}
              dateFocusUsers={getFocusUsers("startDate")}
              onTimeFocus={() => handleFocus("startTime")}
              onTimeBlur={handleBlur}
              timeFocusUsers={getFocusUsers("startTime")}
              onItemNameFocus={() => handleFocus("itemName")}
              onItemNameBlur={handleBlur}
              itemNameFocusUsers={getFocusUsers("itemName")}
              onItemDurationFocus={() => handleFocus("itemDuration")}
              onItemDurationBlur={handleBlur}
              itemDurationFocusUsers={getFocusUsers("itemDuration")}
            />
            <TimetableList
              items={items || []}
              date={date}
              time={time}
              onRemove={removeItem}
              onEdit={(id, name, duration) =>
                updateItem({ id, name, durationInMinutes: duration })
              }
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              ItemComponent={(props) => (
                <CollaborativeTimetableItem
                  {...props}
                  onNameFocus={() => handleFocus(`item-${props.item.id}-name`)}
                  onNameBlur={handleBlur}
                  nameFocusUsers={getFocusUsers(`item-${props.item.id}-name`)}
                  onDurationFocus={() =>
                    handleFocus(`item-${props.item.id}-duration`)
                  }
                  onDurationBlur={handleBlur}
                  durationFocusUsers={getFocusUsers(
                    `item-${props.item.id}-duration`
                  )}
                  draggingUsers={others
                    .filter((o) => o.presence.draggingItemId === props.item.id)
                    .map((o) => o.presence)}
                />
              )}
            />
            <Button
              type="button"
              size="lg"
              className="mt-2"
              onClick={handleSave}
              disabled={
                !eventName || !startDate || !items || items.length === 0
              }
            >
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
