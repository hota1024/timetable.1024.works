import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface EventFormProps {
  name: string;
  setName: (v: string) => void;
  date: Date | undefined;
  setDate: (v: Date | undefined) => void;
  time: string;
  setTime: (v: string) => void;
  itemName: string;
  setItemName: (v: string) => void;
  itemDuration: string;
  setItemDuration: (v: string | ((prev: string) => string)) => void;
  onAddItem: () => void;
  datePopoverOpen: boolean;
  setDatePopoverOpen: (v: boolean) => void;
  onNameFocus?: () => void;
  onNameBlur?: () => void;
  nameFocusUsers?: any[];
  onDateFocus?: () => void;
  onDateBlur?: () => void;
  dateFocusUsers?: any[];
  onTimeFocus?: () => void;
  onTimeBlur?: () => void;
  timeFocusUsers?: any[];
  onItemNameFocus?: () => void;
  onItemNameBlur?: () => void;
  itemNameFocusUsers?: any[];
  onItemDurationFocus?: () => void;
  onItemDurationBlur?: () => void;
  itemDurationFocusUsers?: any[];
}

export function EventForm({
  name,
  setName,
  date,
  setDate,
  time,
  setTime,
  itemName,
  setItemName,
  itemDuration,
  setItemDuration,
  onAddItem,
  datePopoverOpen,
  setDatePopoverOpen,
  onNameFocus,
  onNameBlur,
  nameFocusUsers,
  onDateFocus,
  onDateBlur,
  dateFocusUsers,
  onTimeFocus,
  onTimeBlur,
  timeFocusUsers,
  onItemNameFocus,
  onItemNameBlur,
  itemNameFocusUsers,
  onItemDurationFocus,
  onItemDurationBlur,
  itemDurationFocusUsers,
}: EventFormProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">イベント名</Label>
        <div className="relative">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            onFocus={onNameFocus}
            onBlur={onNameBlur}
          />
          {/* Avatars for event name focus */}
          {nameFocusUsers && nameFocusUsers.length > 0 && (
            <div className="absolute -top-3 -right-3 flex space-x-1">
              {nameFocusUsers.map((user, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: user.color || "#ccc" }}
                    >
                      {user.userName?.charAt(0) || "?"}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {user.userName || "匿名ユーザー"}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>開催日時</Label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full sm:w-56 justify-between font-normal"
                    onFocus={onDateFocus}
                    onBlur={onDateBlur}
                  >
                    {date ? date.toLocaleDateString("ja-JP") : "日付を選択"}
                    <ChevronDownIcon />
                  </Button>
                  {/* Avatars for date focus */}
                  {dateFocusUsers && dateFocusUsers.length > 0 && (
                    <div className="absolute -top-3 -right-3 flex space-x-1">
                      {dateFocusUsers.map((user, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                              style={{ backgroundColor: user.color || "#ccc" }}
                            >
                              {user.userName?.charAt(0) || "?"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {user.userName || "匿名ユーザー"}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(d) => {
                    setDate(d ?? undefined);
                    setDatePopoverOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto relative">
            <Input
              type="time"
              id="time"
              step="60"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full sm:w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              onFocus={onTimeFocus}
              onBlur={onTimeBlur}
            />
            {/* Avatars for time focus */}
            {timeFocusUsers && timeFocusUsers.length > 0 && (
              <div className="absolute -top-3 -right-3 flex space-x-1">
                {timeFocusUsers.map((user, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: user.color || "#ccc" }}
                      >
                        {user.userName?.charAt(0) || "?"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {user.userName || "匿名ユーザー"}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-muted/20 rounded-lg p-4 border border-muted">
        <Label className="mb-1">タイムテーブル項目</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              id="item-name-input"
              placeholder="項目名"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="flex-1"
              onFocus={onItemNameFocus}
              onBlur={onItemNameBlur}
            />
            {/* Avatars for item name focus */}
            {itemNameFocusUsers && itemNameFocusUsers.length > 0 && (
              <div className="absolute -top-3 -right-3 flex space-x-1">
                {itemNameFocusUsers.map((user, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: user.color || "#ccc" }}
                      >
                        {user.userName?.charAt(0) || "?"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {user.userName || "匿名ユーザー"}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 relative">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              tabIndex={-1}
              onClick={() =>
                setItemDuration((prev) => String(Math.max(0, Number(prev) - 5)))
              }
            >
              -5分
            </Button>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                placeholder="所要時間(分)"
                value={itemDuration}
                onChange={(e) => setItemDuration(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddItem();
                  }
                }}
                className="w-24 text-center"
                onFocus={onItemDurationFocus}
                onBlur={onItemDurationBlur}
              />
              {/* Avatars for item duration focus */}
              {itemDurationFocusUsers && itemDurationFocusUsers.length > 0 && (
                <div className="absolute -top-3 -right-3 flex space-x-1">
                  {itemDurationFocusUsers.map((user, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                          style={{ backgroundColor: user.color || "#ccc" }}
                        >
                          {user.userName?.charAt(0) || "?"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {user.userName || "匿名ユーザー"}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              tabIndex={-1}
              onClick={() =>
                setItemDuration((prev) => String(Math.max(0, Number(prev) + 5)))
              }
            >
              +5分
            </Button>
          </div>
          <Button
            type="button"
            onClick={onAddItem}
            variant="secondary"
            className="shrink-0"
          >
            追加
          </Button>
        </div>
      </div>
    </>
  );
}
