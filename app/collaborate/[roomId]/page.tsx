"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RoomProvider } from "@/lib/liveblocks";
import { CollaborativeEventEditor } from "@/components/collaborative-event-editor";
import { ClientSideSuspenseWrapper } from "@/components/client-side-suspense-wrapper";
import { useMemo } from "react";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function CollaboratePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = typeof params.roomId === "string" ? params.roomId : "";

  const initialData = useMemo(() => {
    const dataParam = searchParams.get("data");
    let id = generateId();
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        id = parsed.id || id;
        return {
          id,
          eventName: parsed.name || "新しいイベント",
          startDate: parsed.startDate || new Date().toISOString(),
          items: parsed.items || [],
        };
      } catch (e) {
        console.error("Failed to parse initial data:", e);
      }
    }
    return {
      id,
      eventName: "新しいイベント",
      startDate: new Date().toISOString(),
      items: [],
    };
  }, [searchParams]);

  if (!roomId) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center text-destructive">
        無効なルームIDです
      </div>
    );
  }

  return (
    <main className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            editingItem: null,
            userName: `ユーザー${Math.floor(Math.random() * 1000)}`,
          }}
          initialStorage={initialData}
        >
          <ClientSideSuspenseWrapper
            fallback={
              <div className="flex flex-col items-center justify-center py-16">
                <div className="flex space-x-2 mb-4">
                  <span className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                  <span className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                  <span className="w-4 h-4 bg-blue-300 rounded-full animate-bounce"></span>
                </div>
                <div className="text-lg font-semibold text-blue-600 tracking-wide animate-pulse">
                  協調編集ルームに接続中...
                </div>
              </div>
            }
          >
            <CollaborativeEventEditor />
          </ClientSideSuspenseWrapper>
        </RoomProvider>
      </div>
    </main>
  );
}
