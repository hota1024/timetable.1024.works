import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Liveblocksクライアントを作成
const client = createClient({
  // 開発環境では認証なしで動作
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_live", // 開発用の仮キー
  throttle: 100,
});

// プレゼンス（他のユーザーの状態）の型定義
type Presence = {
  cursor: { x: number; y: number } | null;
  editingItem: string | null; // 編集中のアイテムID
  userName: string;
  focusedField?: string | null; // 追加: フォーカス中のフィールド
  color?: string; // 追加: ユーザーごとの色
  draggingItemId?: string | null; // 追加: ドラッグ中のタイムテーブル項目ID
};

// ストレージ（共有データ）の型定義
type Storage = {
  id: string;
  eventName: string;
  startDate: string;
  items: Array<{
    id: string;
    name: string;
    durationInMinutes: number;
  }>;
};

// ユーザーメタの型定義
type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
  };
};

// ルームイベントの型定義
type RoomEvent = {
  type: string;
  [key: string]: string | number | boolean | null;
};

// ルームコンテキストを作成してエクスポート
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useOthers,
    useMutation,
    useStorage,
    useBroadcastEvent,
    useEventListener,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

export { client };
