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
import { Textarea } from "@/components/ui/textarea";

export type EventImportDialogProps = {
  open: boolean;
  importText: string;
  importError: string | null;
  onOpenChange: (open: boolean) => void;
  onTextChange: (text: string) => void;
  onImport: () => void;
  onCancel: () => void;
  onFileSelect: (file: File) => void;
};

const EventImportDialog: React.FC<EventImportDialogProps> = React.memo(
  ({
    open,
    importText,
    importError,
    onOpenChange,
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
          <DialogTitle>JSONからインポート</DialogTitle>
          <DialogDescription>
            イベントデータのJSONを貼り付けるか、ファイルを選択してください。
          </DialogDescription>
        </DialogHeader>
        <input
          type="file"
          accept="application/json,.json"
          className="mb-2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
        <Textarea
          className="font-mono text-xs min-h-32 bg-muted/40"
          placeholder="ここにJSONを貼り付けてください"
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
