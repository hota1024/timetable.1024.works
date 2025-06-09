/**
 * 開催予定のイベント。
 */
export interface EventData {
  // イベントのID
  id: string;
  // イベントの名前
  name: string;
  // イベントの開始日時
  startDate: Date;
  // イベントのタイムテーブルの項目
  items: TimetableItem[];

  createdAt: Date;
}

/**
 * タイムテーブルの項目。
 */
export interface TimetableItem {
  id: string;
  // 項目の名前（例：オープニング、基調講演、エンディング）
  name: string;
  // 項目の所要時間（分）
  durationInMinutes: number;
}
