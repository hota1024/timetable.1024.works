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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Download, Copy, Check } from "lucide-react";
import { TimetableItem } from "@/models/event";

export type EventExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  date: Date | undefined;
  time: string;
  items: TimetableItem[];
  copiedTab: null | "json" | "markdown";
  showTooltip: null | "json" | "markdown";
  onCopy: (tab: "json" | "markdown", text: string) => void;
  onDownload: (tab: "json" | "markdown", text: string) => void;
};

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

const EventExportDialog: React.FC<EventExportDialogProps> = React.memo(
  ({
    open,
    onOpenChange,
    name,
    date,
    time,
    items,
    copiedTab,
    showTooltip,
    onCopy,
    onDownload,
  }) => {
    const jsonText = React.useMemo(
      () =>
        JSON.stringify(
          {
            name,
            startDate: combineDateAndTime(date, time),
            items,
          },
          null,
          2
        ),
      [name, date, time, items]
    );
    const markdownText = React.useMemo(() => {
      const result = [];
      const base = combineDateAndTime(date, time);
      let current = base ? new Date(base) : null;
      for (let i = 0; i < items.length; ++i) {
        const start = current ? current.toTimeString().slice(0, 5) : "";
        result.push(
          `| ${start} | ${items[i].name} | ${items[i].durationInMinutes} |`
        );
        if (current)
          current = new Date(
            current.getTime() + items[i].durationInMinutes * 60000
          );
      }
      return `| 開始時刻 | 名前 | 所要時間(分) |\n|----------|------|--------------|\n${result.join(
        "\n"
      )}`;
    }, [date, time, items]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            エクスポート
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>イベントデータをエクスポート</DialogTitle>
            <DialogDescription>
              このイベントのデータをJSONまたはMarkdownテーブル形式でエクスポートできます。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Tabs defaultValue="json">
              <TabsList className="mb-2">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
              <hr className="mb-4 border-muted-foreground/20" />
              <TabsContent value="json">
                <Label htmlFor="export-json" className="mb-1">
                  JSON
                </Label>
                <Textarea
                  id="export-json"
                  className="font-mono text-xs min-h-32 max-h-64 bg-muted/40 rounded-lg border border-muted-foreground/20"
                  value={jsonText}
                  readOnly
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Tooltip
                    open={copiedTab === "json" || showTooltip === "json"}
                    onOpenChange={() => {}}
                  >
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onCopy("json", jsonText)}
                      >
                        <Copy className="size-4 mr-1" /> コピー
                        {copiedTab === "json" && (
                          <Check className="size-4 ml-1 text-green-600" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      コピーしました
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onDownload("json", jsonText)}
                  >
                    <Download className="size-4 mr-1" />{" "}
                    jsonファイルをダウンロード
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="markdown">
                <Label htmlFor="export-md" className="mb-1">
                  Markdownテーブル
                </Label>
                <Textarea
                  id="export-md"
                  className="font-mono text-xs min-h-32 max-h-64 bg-muted/40 rounded-lg border border-muted-foreground/20"
                  value={markdownText}
                  readOnly
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Tooltip
                    open={
                      copiedTab === "markdown" || showTooltip === "markdown"
                    }
                    onOpenChange={() => {}}
                  >
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onCopy("markdown", markdownText)}
                      >
                        <Copy className="size-4 mr-1" /> コピー
                        {copiedTab === "markdown" && (
                          <Check className="size-4 ml-1 text-green-600" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      コピーしました
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onDownload("markdown", markdownText)}
                  >
                    <Download className="size-4 mr-1" />{" "}
                    .mdファイルをダウンロード
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
EventExportDialog.displayName = "EventExportDialog";

export default EventExportDialog;
