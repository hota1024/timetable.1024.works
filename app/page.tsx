"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EventData } from "@/models/event";
import { loadEventDataFromStorage } from "@/lib/eventStorage";
import { List, Grid2X2 } from "lucide-react";

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [viewMode, setViewMode] = useState<"row" | "grid">("row");

  useEffect(() => {
    // localStorage から eventData: で始まる全イベントを取得
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("eventData:")
    );
    const loaded = keys
      .map((key) => loadEventDataFromStorage(key.replace("eventData:", "")))
      .filter((e): e is EventData => !!e);
    setEvents(loaded);
  }, []);

  return (
    <main className="max-w-3xl mx-auto py-16 px-4 flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">イベント一覧</h1>
        <div className="flex gap-2 items-center">
          <div className="flex border rounded-md overflow-hidden mr-2">
            <button
              className={`px-2 py-1 flex items-center justify-center transition-colors ${
                viewMode === "row"
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setViewMode("row")}
              aria-label="行表示"
              type="button"
            >
              <List className="size-5" />
            </button>
            <button
              className={`px-2 py-1 flex items-center justify-center transition-colors ${
                viewMode === "grid"
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setViewMode("grid")}
              aria-label="グリッド表示"
              type="button"
            >
              <Grid2X2 className="size-5" />
            </button>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/new">イベント新規作成</Link>
          </Button>
        </div>
      </div>
      {/* Event List Section */}
      <section className="bg-muted/40 rounded-xl p-6 shadow-inner min-h-[200px]">
        {events.length === 0 ? (
          <div className="text-muted-foreground text-center py-12">
            イベントが見つかりません
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {events.map((event) => {
              const totalDuration = event.items.reduce(
                (sum, item) => sum + item.durationInMinutes,
                0
              );
              return (
                <Card
                  key={event.id}
                  className="relative rounded-2xl border border-border/40 bg-white/90 dark:bg-background/80 shadow-sm hover:shadow-lg transition-shadow p-0 overflow-hidden group"
                >
                  {/* 編集ボタンを右上に */}
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 z-10 opacity-70 hover:opacity-100"
                  >
                    <Link href={`/${event.id}`} aria-label="編集">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16.475 5.408l2.117 2.117a1.5 1.5 0 010 2.121l-8.485 8.485a2 2 0 01-.707.464l-3.536 1.178a.5.5 0 01-.632-.632l1.178-3.536a2 2 0 01.464-.707l8.485-8.485a1.5 1.5 0 012.121 0z"></path>
                      </svg>
                    </Link>
                  </Button>
                  <CardHeader className="pb-2 pt-6 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold tracking-tight truncate">
                        {event.name}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                        {new Date(event.startDate).toLocaleString("ja-JP", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-5 px-6">
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold">
                        項目数: {event.items.length}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded bg-secondary/30 text-secondary-foreground text-xs font-semibold">
                        合計 {totalDuration}分
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
