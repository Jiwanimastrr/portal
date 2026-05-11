"use client";

import { useState } from "react";
import { Zap, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NameListSelector } from "@/components/shared/NameListSelector";
import { NameListInput } from "@/components/shared/NameListInput";
import { toast } from "sonner";
import { InputMode } from "@/lib/hooks/useQuickInput";

interface QuickInputPanelProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onQuickApply: (items: string[]) => void;
  quickActive: boolean;
  quickItemsCount: number;
  /** 저장된 명단이 선택됐을 때 보여줄 추가 정보 */
  savedListInfo?: React.ReactNode;
  /** 그라디언트 색상 (기본: emerald→teal) */
  accentFrom?: string;
  accentTo?: string;
}

export function QuickInputPanel({
  inputMode,
  onModeChange,
  onQuickApply,
  quickActive,
  quickItemsCount,
  savedListInfo,
  accentFrom = "from-emerald-500",
  accentTo = "to-teal-600",
}: QuickInputPanelProps) {
  const [quickText, setQuickText] = useState("");
  const [editListId, setEditListId] = useState<string | null>(null);

  const handleQuickApply = () => {
    const items = quickText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (items.length === 0) {
      toast.error("명단에 포함될 항목을 입력해주세요.");
      return;
    }

    onQuickApply(items);
    toast.success(`${items.length}명의 임시 명단이 적용되었습니다.`);
  };

  return (
    <>
      {/* 모드 선택 탭 */}
      <div className="flex rounded-lg border overflow-hidden">
        <button
          onClick={() => onModeChange("quick")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
            inputMode === "quick"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Zap className="w-4 h-4" />
          빠른 입력
        </button>
        <button
          onClick={() => onModeChange("saved")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
            inputMode === "saved"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Save className="w-4 h-4" />
          명단 선택
        </button>
        <button
          onClick={() => {
            setEditListId(null);
            onModeChange("create");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
            inputMode === "create"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Plus className="w-4 h-4" />
          {editListId ? "명단 수정" : "명단 생성"}
        </button>
      </div>

      {inputMode === "quick" ? (
        /* 빠른 입력 모드 */
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            이름이나 항목을 입력하면 저장 없이 바로 사용합니다.<br/>
            줄바꿈 또는 쉼표(,)로 구분하세요.
          </p>
          <textarea
            className="w-full min-h-[150px] rounded-lg border border-input bg-transparent px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            placeholder={"홍길동\n김철수\n이영희\n박지민\n최수현"}
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <Button
            onClick={handleQuickApply}
            className={`w-full h-11 text-base bg-gradient-to-r ${accentFrom} ${accentTo} hover:opacity-90 text-white`}
          >
            <Zap className="w-4 h-4 mr-2" />
            바로 사용하기
          </Button>
          {quickActive && quickItemsCount > 0 && (
            <div className="text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-md text-center border border-emerald-200 dark:border-emerald-800">
              ⚡ 임시 명단 사용 중: <span className="font-bold">{quickItemsCount}명</span>
            </div>
          )}
        </div>
      ) : inputMode === "saved" ? (
        /* 저장된 명단 모드 */
        <div className="space-y-4">
          <NameListSelector
            onEdit={(id) => {
              setEditListId(id);
              onModeChange("create");
            }}
          />
          {savedListInfo}
        </div>
      ) : (
        /* 명단 생성/수정 모드 */
        <div className="space-y-4">
          <NameListInput
            editListId={editListId}
            onEditComplete={() => {
              setEditListId(null);
              onModeChange("saved");
            }}
          />
        </div>
      )}
    </>
  );
}
