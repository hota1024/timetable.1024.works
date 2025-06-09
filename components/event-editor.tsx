"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { EventData, TimetableItem } from "@/models/event";
import { Users } from "lucide-react";
import EventImportDialog from "@/components/event-import-dialog";
import EventExportDialog from "@/components/event-export-dialog";
import { useRouter } from "next/navigation";
import SortableTimetableItem from "@/components/sortable-timetable-item";
import { EventForm } from "@/components/event-form";
import { TimetableList } from "@/components/timetable-list";

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

export type EventEditorProps = {
  initialEvent?: Partial<EventData>;
  onSubmit: (event: Omit<EventData, "createdAt">) => void;
  submitLabel?: string;
  title?: string;
};

export function EventEditor({
  initialEvent,
  onSubmit,
  submitLabel = "保存",
  title = "イベント",
}: EventEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialEvent?.name ?? "");
  const [date, setDate] = useState<Date | undefined>(
    initialEvent?.startDate ? new Date(initialEvent.startDate) : undefined
  );
  const [time, setTime] = useState(() => {
    if (initialEvent?.startDate) {
      const d = new Date(initialEvent.startDate);
      return d.toTimeString().slice(0, 5);
    }
    return "";
  });
  const [items, setItems] = useState<TimetableItem[]>(
    initialEvent?.items ?? []
  );
  const [itemName, setItemName] = useState("");
  const [itemDuration, setItemDuration] = useState("0");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [copiedTab, setCopiedTab] = useState<null | "json" | "markdown">(null);
  const [showTooltip, setShowTooltip] = useState<null | "json" | "markdown">(
    null
  );
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    if (initialEvent) {
      setName(initialEvent.name ?? "");
      setDate(
        initialEvent.startDate ? new Date(initialEvent.startDate) : undefined
      );
      setTime(() => {
        if (initialEvent.startDate) {
          const d = new Date(initialEvent.startDate);
          return d.toTimeString().slice(0, 5);
        }
        return "";
      });
      setItems(initialEvent.items ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEvent?.id]);

  const addItem = () => {
    if (!itemName || !itemDuration) return;
    setItems([
      ...items,
      {
        id: generateId(),
        name: itemName,
        durationInMinutes: Number(itemDuration),
      },
    ]);
    setItemName("");
    setItemDuration("0");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const editItem = (id: string, name: string, duration: number) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, name, durationInMinutes: duration } : item
      )
    );
  };

  const handleSubmit = (_: React.FormEvent) => {
    _.preventDefault();
    const startDate = combineDateAndTime(date, time);
    if (!name || !startDate || items.length === 0) return;
    onSubmit({
      ...(initialEvent?.id ? { id: initialEvent.id } : { id: generateId() }),
      name,
      startDate,
      items,
    });
  };

  const handleStartCollaboration = () => {
    // リアルタイム編集用のルームIDを生成
    const roomId = generateId();
    const collaborationUrl = `/collaborate/${roomId}`;

    // idを決定
    const eventId = initialEvent?.id || generateId();

    // 現在の編集内容をURLパラメータとして渡す
    const currentData = {
      id: eventId,
      name: name || "新しいイベント",
      startDate:
        combineDateAndTime(date, time)?.toISOString() ||
        new Date().toISOString(),
      items: items,
    };

    const encodedData = encodeURIComponent(JSON.stringify(currentData));
    router.push(`${collaborationUrl}?data=${encodedData}`);
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleStartCollaboration}
                className="flex items-center gap-2"
                disabled={!name || !date || !time}
              >
                <Users className="w-4 h-4" />
                リアルタイム編集を開始
              </Button>
              <EventImportDialog
                open={importDialogOpen}
                importText={importText}
                importError={importError}
                onOpenChange={setImportDialogOpen}
                onTextChange={setImportText}
                onImport={() => {
                  setImportError(null);
                  try {
                    const data = JSON.parse(importText);
                    if (
                      !data.name ||
                      !data.startDate ||
                      !Array.isArray(data.items)
                    ) {
                      setImportError(
                        "必要なフィールド(name, startDate, items)がありません"
                      );
                      return;
                    }
                    setName(data.name);
                    setDate(new Date(data.startDate));
                    setTime(() => {
                      const d = new Date(data.startDate);
                      return d.toTimeString().slice(0, 5);
                    });
                    setItems(data.items);
                    setImportDialogOpen(false);
                    setImportText("");
                  } catch {
                    setImportError("JSONのパースに失敗しました");
                  }
                }}
                onCancel={() => {
                  setImportDialogOpen(false);
                  setImportText("");
                  setImportError(null);
                }}
                onFileSelect={(file) => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setImportText((ev.target?.result as string) || "");
                  };
                  reader.readAsText(file);
                }}
              />
              <EventExportDialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                name={name}
                date={date}
                time={time}
                items={items}
                copiedTab={copiedTab}
                showTooltip={showTooltip}
                onCopy={(tab, text) => {
                  navigator.clipboard.writeText(text);
                  setCopiedTab(tab);
                  setShowTooltip(tab);
                  setTimeout(() => {
                    setCopiedTab(null);
                    setShowTooltip(null);
                  }, 1200);
                }}
                onDownload={(tab, text) => {
                  const type =
                    tab === "json" ? "application/json" : "text/markdown";
                  const ext = tab === "json" ? "json" : "md";
                  const blob = new Blob([text], { type });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${name || "event"}.${ext}`;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 100);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <EventForm
              name={name}
              setName={setName}
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              itemName={itemName}
              setItemName={setItemName}
              itemDuration={itemDuration}
              setItemDuration={setItemDuration}
              onAddItem={addItem}
              datePopoverOpen={datePopoverOpen}
              setDatePopoverOpen={setDatePopoverOpen}
            />
            <TimetableList
              items={items}
              date={date}
              time={time}
              onRemove={removeItem}
              onEdit={editItem}
              ItemComponent={SortableTimetableItem}
              onDragEnd={() => {}}
            />
            <Button
              type="submit"
              size="lg"
              className="mt-2"
              disabled={!name || !date || !time || items.length === 0}
            >
              {submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
