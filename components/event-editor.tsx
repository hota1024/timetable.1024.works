"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { EventData, TimetableItem } from "@/models/event";
import { Users } from "lucide-react";
import EventImportDialog, {
  EventImportFormat,
} from "@/components/event-import-dialog";
import EventExportDialog from "@/components/event-export-dialog";
import { useRouter } from "next/navigation";
import SortableTimetableItem from "@/components/sortable-timetable-item";
import { EventForm } from "@/components/event-form";
import { TimetableList } from "@/components/timetable-list";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  parseEventMarkdown,
  type ParsedEventMarkdown,
} from "@/lib/eventMarkdown";

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
  const [importFormat, setImportFormat] = useState<EventImportFormat>("json");
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

  const handleDragEnd = (event: unknown) => {
    const { active, over } = event as DragEndEvent;
    if (!over || active.id === over.id) return;
    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const applyImported = (imported: ParsedEventMarkdown) => {
    if (imported.name) setName(imported.name);
    if (imported.startDate) setDate(imported.startDate);
    if (imported.startTime) setTime(imported.startTime);
    setItems(imported.items);
    setImportDialogOpen(false);
    setImportText("");
  };

  const handleImport = () => {
    setImportError(null);

    if (importFormat === "markdown") {
      let parsed: ParsedEventMarkdown;
      try {
        parsed = parseEventMarkdown(importText);
      } catch (error) {
        setImportError(
          error instanceof Error
            ? error.message
            : "Markdownの読み取りに失敗しました"
        );
        return;
      }
      applyImported(parsed);
      return;
    }

    let data: Partial<{
      name: string;
      startDate: string;
      items: TimetableItem[];
    }>;
    try {
      data = JSON.parse(importText);
    } catch {
      setImportError("JSONのパースに失敗しました");
      return;
    }
    if (!data.name || !data.startDate || !Array.isArray(data.items)) {
      setImportError("必要なフィールド(name, startDate, items)がありません");
      return;
    }
    const startDate = new Date(data.startDate);
    if (Number.isNaN(startDate.getTime())) {
      setImportError("startDateを日時として読み取れません");
      return;
    }
    applyImported({
      name: data.name,
      startDate,
      startTime: startDate.toTimeString().slice(0, 5),
      items: data.items,
    });
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
                format={importFormat}
                importText={importText}
                importError={importError}
                onOpenChange={setImportDialogOpen}
                onFormatChange={(format) => {
                  setImportFormat(format);
                  setImportError(null);
                }}
                onTextChange={setImportText}
                onImport={handleImport}
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
              onDragEnd={handleDragEnd}
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
