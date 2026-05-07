"use client";

import * as React from "react";
import { useListStore } from "@/lib/store/useListStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { EmptyState } from "./EmptyState";

export function NameListSelector() {
  const lists = useListStore((state) => state.lists);
  const currentListId = useListStore((state) => state.currentListId);
  const setCurrentList = useListStore((state) => state.setCurrentList);

  if (lists.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">사용할 명단 선택</label>
      <Select
        value={currentListId || ""}
        onValueChange={(value) => setCurrentList(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="명단을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {lists.map((list) => (
            <SelectItem key={list.id} value={list.id}>
              {list.name} ({list.items.length}명)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
