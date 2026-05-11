"use client";

import * as React from "react";
import { useListStore } from "@/lib/store/useListStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface NameListSelectorProps {
  onEdit?: (id: string) => void;
}

export function NameListSelector({ onEdit }: NameListSelectorProps) {
  const lists = useListStore((state) => state.lists);
  const currentListId = useListStore((state) => state.currentListId);
  const setCurrentList = useListStore((state) => state.setCurrentList);
  const deleteList = useListStore((state) => state.deleteList);

  if (lists.length === 0) {
    return <EmptyState />;
  }

  const selectedList = lists.find((l) => l.id === currentListId);
  const displayText = selectedList
    ? `${selectedList.name} (${selectedList.items.length}명)`
    : "명단을 선택하세요";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">사용할 명단 선택</label>
      <div className="flex gap-2">
        <Select
          value={currentListId || ""}
          onValueChange={(value) => setCurrentList(value)}
        >
          <SelectTrigger className="w-full">
            <span className="truncate">{displayText}</span>
          </SelectTrigger>
          <SelectContent>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name} ({list.items.length}명)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentListId && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(currentListId)}
              title="명단 수정"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                if (confirm("정말로 이 명단을 삭제하시겠습니까?")) {
                  deleteList(currentListId);
                }
              }}
              title="명단 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
