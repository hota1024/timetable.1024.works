"use client";
import { useRouter } from "next/navigation";
import { EventData } from "@/models/event";
import { saveEventDataToStorage } from "@/lib/eventStorage";
import { EventEditor } from "@/components/event-editor";

export default function NewEventPage() {
  const router = useRouter();

  const handleSubmit = (event: Omit<EventData, "createdAt">) => {
    saveEventDataToStorage({ ...event, createdAt: new Date() }, event.id);
    router.push("/");
  };

  return (
    <main className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <EventEditor
          onSubmit={handleSubmit}
          title="新規イベント作成"
          submitLabel="保存"
        />
      </div>
    </main>
  );
}
