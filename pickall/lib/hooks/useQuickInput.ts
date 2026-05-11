import { useState, useMemo, useEffect } from "react";
import { useListStore } from "@/lib/store/useListStore";

export type InputMode = "quick" | "saved" | "create";

export function useQuickInput() {
  const lists = useListStore((state) => state.lists);
  const currentListId = useListStore((state) => state.currentListId);
  const currentList = lists.find((l) => l.id === currentListId);

  const [inputMode, setInputMode] = useState<InputMode>("quick");
  const [quickItems, setQuickItems] = useState<string[]>([]);
  const [quickActive, setQuickActive] = useState(false);

  // 모드 변경 시 동작
  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    if (mode !== "quick") {
      setQuickActive(false); // 명단 선택/생성 탭으로 가면 빠른입력 비활성화
    }
  };

  const handleQuickApply = (items: string[]) => {
    setQuickItems(items);
    setQuickActive(true);
  };

  // 통합 소스: 빠른 입력 모드 vs 저장된 명단 모드
  const activeSourceItems = useMemo(() => {
    if (inputMode === "quick" && quickActive) {
      return quickItems;
    }
    return currentList?.items ?? [];
  }, [inputMode, quickActive, quickItems, currentList]);

  const hasActiveList = activeSourceItems.length > 0;

  // currentListId가 변경되면 명단 선택 모드로 변경됨 (이건 NameListSelector 클릭 시 발생)
  useEffect(() => {
    if (inputMode === "quick" && currentListId !== null) {
        setInputMode("saved");
        setQuickActive(false);
    }
  }, [currentListId, inputMode]);

  return {
    inputMode,
    setInputMode: handleModeChange,
    quickItems,
    quickActive,
    activeSourceItems,
    hasActiveList,
    handleQuickApply,
    currentList
  };
}
