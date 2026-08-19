import type { TimetableItem } from "@/models/event";

const DATE_LABEL = "開催日時";
const TABLE_HEADER = "| 開始時刻 | 名前 | 所要時間(分) |";
const TABLE_SEPARATOR = "|----------|------|--------------|";

/**
 * Markdown を生成するための元データ。
 */
export type EventMarkdownSource = {
  name: string;
  // 日付と時刻を合成済みの開始日時
  startDate: Date | undefined;
  items: TimetableItem[];
};

/**
 * Markdown から読み取ったイベントデータ。
 */
export type ParsedEventMarkdown = {
  // 見出し（例：`# イベント名`）から読み取ったイベント名
  name?: string;
  // 「開催日時」行から読み取った開始日時（時刻が分かる場合は時刻入り）
  startDate?: Date;
  // 「開催日時」行または表の先頭行から読み取った開始時刻（"HH:MM"）
  startTime?: string;
  items: TimetableItem[];
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatTime(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatDateTime(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )} ${formatTime(date)}`;
}

// セル内の `|` は表の区切りと区別できないためエスケープする。
function escapeCell(text: string) {
  return text.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

/**
 * イベントデータを Markdown（見出し + 開催日時 + テーブル）に変換する。
 */
export function formatEventMarkdown({
  name,
  startDate,
  items,
}: EventMarkdownSource): string {
  const blocks: string[] = [];

  if (name) blocks.push(`# ${name.replace(/\r?\n/g, " ")}`);
  if (startDate) blocks.push(`${DATE_LABEL}: ${formatDateTime(startDate)}`);

  const rows: string[] = [];
  let current = startDate ? new Date(startDate) : null;
  for (const item of items) {
    const start = current ? formatTime(current) : "";
    rows.push(
      `| ${start} | ${escapeCell(item.name)} | ${item.durationInMinutes} |`
    );
    if (current) {
      current = new Date(current.getTime() + item.durationInMinutes * 60000);
    }
  }
  blocks.push([TABLE_HEADER, TABLE_SEPARATOR, ...rows].join("\n"));

  return blocks.join("\n\n");
}

// 行を `|` で分割する。`\|` はエスケープされたセル内の文字として扱う。
function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  for (let i = 0; i < line.length; ++i) {
    const char = line[i];
    if (char === "\\" && line[i + 1] === "|") {
      cell += "|";
      ++i;
      continue;
    }
    if (char === "|") {
      cells.push(cell);
      cell = "";
      continue;
    }
    cell += char;
  }
  cells.push(cell);

  // 行頭・行末の `|` によって生まれる空セルを取り除く
  if (cells.length > 0 && cells[0].trim() === "") cells.shift();
  if (cells.length > 0 && cells[cells.length - 1].trim() === "") cells.pop();

  return cells.map((cell) => cell.trim());
}

function hasCellSeparator(line: string) {
  return /(^|[^\\])\|/.test(line);
}

function isSeparatorRow(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

function parseTime(cell: string): string | null {
  const matched = cell.match(/^(\d{1,2})\s*[:：]\s*(\d{1,2})$/);
  if (!matched) return null;
  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

function parseDuration(cell: string): number | null {
  const matched = cell.match(
    /^(\d+(?:\.\d+)?)\s*(?:分|分間|min(?:utes?)?|m)?$/i
  );
  if (!matched) return null;
  return Math.round(Number(matched[1]));
}

// 「開催日時: 2026-08-19 10:00」のような行から日付と時刻を読み取る。
function parseDateLine(line: string): { date: Date; time?: string } | null {
  const matched = line.match(
    /(\d{4})\s*[-/年]\s*(\d{1,2})\s*[-/月]\s*(\d{1,2})\s*日?(?:[\sT]+(\d{1,2})\s*[:：]\s*(\d{1,2}))?/
  );
  if (!matched) return null;

  const [, year, month, day, hours, minutes] = matched;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours ? Number(hours) : 0,
    minutes ? Number(minutes) : 0,
    0,
    0
  );
  if (Number.isNaN(date.getTime())) return null;

  if (hours === undefined || minutes === undefined) return { date };
  return { date, time: `${pad2(Number(hours))}:${pad2(Number(minutes))}` };
}

/**
 * Markdown からイベントデータを読み取る。
 * 読み取れない場合は Error を投げる。
 */
export function parseEventMarkdown(markdown: string): ParsedEventMarkdown {
  const lines = markdown.split(/\r?\n/);

  let name: string | undefined;
  let dateLine: { date: Date; time?: string } | null = null;
  const rows: { cells: string[]; lineNumber: number }[] = [];

  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("```")) continue;

    if (hasCellSeparator(line)) {
      rows.push({ cells: splitRow(line), lineNumber: i + 1 });
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading && name === undefined) {
      name = heading[1].trim();
      continue;
    }

    if (!dateLine) {
      dateLine = parseDateLine(line);
    }
  }

  if (rows.length === 0) {
    throw new Error("Markdownの表が見つかりません");
  }

  // 区切り行（|---|---|）より後ろを本文とみなす。区切り行がない場合は、
  // 先頭行が数値の所要時間を持たなければ見出し行として読み飛ばす。
  const separatorIndex = rows.findIndex((row) => isSeparatorRow(row.cells));
  let dataRows: typeof rows;
  if (separatorIndex >= 0) {
    dataRows = rows
      .slice(separatorIndex + 1)
      .filter((row) => !isSeparatorRow(row.cells));
  } else {
    dataRows = parseRow(rows[0].cells) === null ? rows.slice(1) : rows;
  }

  const items: TimetableItem[] = [];
  let startTime: string | undefined;

  for (const row of dataRows) {
    const parsed = parseRow(row.cells);
    if (!parsed) {
      throw new Error(
        `${row.lineNumber}行目: 名前と所要時間(分)を読み取れません`
      );
    }
    if (parsed.name === "") {
      throw new Error(`${row.lineNumber}行目: 名前が空です`);
    }
    if (items.length === 0 && parsed.time) startTime = parsed.time;
    items.push({
      id: generateId(),
      name: parsed.name,
      durationInMinutes: parsed.duration,
    });
  }

  if (items.length === 0) {
    throw new Error("タイムテーブルの項目が1件も見つかりません");
  }

  if (dateLine?.time) startTime = dateLine.time;

  let startDate: Date | undefined;
  if (dateLine) {
    startDate = new Date(dateLine.date);
    if (!dateLine.time && startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }
  }

  return { name, startDate, startTime, items };
}

function parseRow(
  cells: string[]
): { time: string | null; name: string; duration: number } | null {
  // 3列以上かつ先頭セルが時刻（または空欄）なら「開始時刻 | 名前 | 所要時間」とみなす
  if (cells.length >= 3 && (cells[0] === "" || parseTime(cells[0]) !== null)) {
    const duration = parseDuration(cells[2]);
    if (duration === null) return null;
    return { time: parseTime(cells[0]), name: cells[1], duration };
  }

  if (cells.length >= 2) {
    const duration = parseDuration(cells[1]);
    if (duration === null) return null;
    return { time: null, name: cells[0], duration };
  }

  return null;
}
