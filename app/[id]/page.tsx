"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { EventData } from "@/models/event";
import {
  loadEventDataFromStorage,
  saveEventDataToStorage,
} from "@/lib/eventStorage";
import { EventEditor } from "@/components/event-editor";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const loaded = loadEventDataFromStorage(id);
    if (!loaded) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setEvent(loaded);
    setLoading(false);
  }, [id]);

  const handleSubmit = (updated: Omit<EventData, "createdAt">) => {
    saveEventDataToStorage({ ...updated, createdAt: new Date() }, id);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        読み込み中...
      </div>
    );
  }
  if (notFound || !event) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center text-destructive">
        イベントが見つかりません
      </div>
    );
  }

  return (
    <main className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <EventEditor
          initialEvent={event}
          onSubmit={handleSubmit}
          title="イベント編集"
          submitLabel="保存"
        />
      </div>
    </main>
  );
}
