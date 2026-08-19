import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export type EventImportFormat = "json" | "markdown";

const FORMAT_CONFIG: Record<
  EventImportFormat,
  { accept: string; description: string; placeholder: string }
> = {
  json: {
    accept: "application/json,.json",
    description:
      "イベントデータのJSONを貼り付けるか、ファイルを選択してください。",
    placeholder: "ここにJSONを貼り付けてください",
  },
  markdown: {
    accept: "text/markdown,text/plain,.md,.markdown",
    description:
      "タイムテーブルのMarkdownを貼り付けるか、ファイルを選択してください。見出しと開催日時の行があれば、イベント名と開催日時も取り込みます。",
    placeholder: `# イベント名

開催日時: 2026-08-19 10:00

| 開始時刻 | 名前 | 所要時間(分) |
|----------|------|--------------|
| 10:00 | オープニング | 15 |`,
  },
};

export type EventImportDialogProps = {
  open: boolean;
  format: EventImportFormat;
  importText: string;
  importError: string | null;
  onOpenChange: (open: boolean) => void;
  onFormatChange: (format: EventImportFormat) => void;
  onTextChange: (text: string) => void;
  onImport: () => void;
  onCancel: () => void;
  onFileSelect: (file: File) => void;
};

const EventImportDialog: React.FC<EventImportDialogProps> = React.memo(
  ({
    open,
    format,
    importText,
    importError,
    onOpenChange,
    onFormatChange,
    onTextChange,
    onImport,
    onCancel,
    onFileSelect,
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          インポート
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>イベントデータをインポート</DialogTitle>
          <DialogDescription>
            {FORMAT_CONFIG[format].description}
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={format}
          onValueChange={(value) => onFormatChange(value as EventImportFormat)}
        >
          <TabsList className="mb-2">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </Tabs>
        <hr className="mb-2 border-muted-foreground/20" />
        <input
          key={format}
          type="file"
          accept={FORMAT_CONFIG[format].accept}
          className="mb-2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
        <Textarea
          className="font-mono text-xs min-h-32 bg-muted/40"
          placeholder={FORMAT_CONFIG[format].placeholder}
          value={importText}
          onChange={(e) => onTextChange(e.target.value)}
        />
        {importError && (
          <div className="text-destructive text-sm mt-2">{importError}</div>
        )}
        <div className="flex justify-end gap-2 mt-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="button" variant="default" onClick={onImport}>
            インポート
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
);
EventImportDialog.displayName = "EventImportDialog";

export default EventImportDialog;
