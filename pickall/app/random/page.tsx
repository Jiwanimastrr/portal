"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import { Dices, RefreshCcw, UserMinus, Download, Settings, History, Zap, Save } from "lucide-react";

import { useListStore } from "@/lib/store/useListStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useTickSound } from "@/lib/hooks/useTickSound";
import { secureRandom } from "@/lib/utils/random";
import { NameListSelector } from "@/components/shared/NameListSelector";
import { NameListInput } from "@/components/shared/NameListInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type DrawMode = "single" | "cycle" | "allow_dup";
type InputMode = "quick" | "saved";

interface HistoryItem {
  id: string;
  round: number;
  time: string;
  results: string[];
}

export default function RandomPage() {
  const lists = useListStore((state) => state.lists);
  const currentListId = useListStore((state) => state.currentListId);
  const setCurrentList = useListStore((state) => state.setCurrentList);
  const currentList = lists.find((l) => l.id === currentListId);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>("quick");
  const [quickText, setQuickText] = useState("");
  const [quickItems, setQuickItems] = useState<string[]>([]);
  const [quickActive, setQuickActive] = useState(false); // 빠른 입력이 활성화 상태인지

  // States
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [drawMode, setDrawMode] = useState<DrawMode>("single");
  const [drawCount, setDrawCount] = useState<number>(1);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRollingItems, setCurrentRollingItems] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const { initAudio, playTick, playSuccess } = useTickSound();
  const shouldReduceMotion = useReducedMotion();

  // 통합 소스: 빠른 입력 모드 vs 저장된 명단 모드
  const activeSourceItems = useMemo(() => {
    if (inputMode === "quick" && quickActive) {
      return quickItems;
    }
    return currentList?.items ?? [];
  }, [inputMode, quickActive, quickItems, currentList]);

  const hasActiveList = activeSourceItems.length > 0;

  // Initialize available items when source changes
  useEffect(() => {
    if (activeSourceItems.length > 0) {
      setAvailableItems([...activeSourceItems]);
      setHistory([]);
      setWinners([]);
      setCurrentRollingItems([]);
    } else {
      setAvailableItems([]);
    }
  }, [activeSourceItems]);

  // 모드 전환 시 상태 초기화
  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setHistory([]);
    setWinners([]);
    setCurrentRollingItems([]);
    if (mode === "quick") {
      // 빠른 입력 모드로 전환
      setCurrentList(null);
      if (quickActive && quickItems.length > 0) {
        setAvailableItems([...quickItems]);
      } else {
        setAvailableItems([]);
      }
    } else {
      // 저장된 명단 모드로 전환
      setQuickActive(false);
      if (currentList) {
        setAvailableItems([...currentList.items]);
      } else {
        setAvailableItems([]);
      }
    }
  };

  // 빠른 입력 적용
  const handleQuickApply = () => {
    const items = quickText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (items.length === 0) {
      toast.error("명단에 포함될 항목을 입력해주세요.");
      return;
    }

    setQuickItems(items);
    setQuickActive(true);
    setAvailableItems([...items]);
    setHistory([]);
    setWinners([]);
    setCurrentRollingItems([]);
    toast.success(`${items.length}명의 임시 명단이 적용되었습니다.`);
  };

  const handleResetAvailable = useCallback(() => {
    if (activeSourceItems.length > 0) {
      setAvailableItems([...activeSourceItems]);
      toast.success("명단이 초기화되었습니다.");
    }
  }, [activeSourceItems]);

  const handleStartDraw = useCallback(() => {
    if (!hasInteracted) {
      initAudio();
      setHasInteracted(true);
    }

    if (!hasActiveList) {
      toast.error("먼저 명단을 입력해주세요.");
      return;
    }

    // Check available items
    if (drawMode === "single" && availableItems.length === 0) {
      toast.error("모두 뽑혔어요! 초기화할까요?", {
        action: {
          label: "초기화",
          onClick: handleResetAvailable
        }
      });
      return;
    }

    let itemsPool = [...availableItems];
    if (drawMode === "allow_dup") {
      itemsPool = [...activeSourceItems];
    } else if (drawMode === "cycle") {
      if (itemsPool.length === 0) {
        itemsPool = [...activeSourceItems];
        setAvailableItems(itemsPool);
        toast.info("모든 인원이 뽑혀 새로운 사이클을 시작합니다.");
      }
    }

    // Clamp draw count
    const actualDrawCount = Math.min(drawCount, itemsPool.length);
    if (actualDrawCount === 0) return;

    setIsDrawing(true);
    setWinners([]);
    setCurrentRollingItems(Array(actualDrawCount).fill("?"));

    // Slot machine logic (slow down over 3 seconds)
    const duration = 3000;
    const startTime = Date.now();
    let lastTick = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out (slowing down)
      const currentTick = Math.floor(progress * progress * progress * 50);

      if (currentTick !== lastTick && progress < 1) {
        if (soundEnabled) playTick(800 + Math.random() * 200, 0.05);
        const rolling = Array.from({ length: actualDrawCount }, () => itemsPool[secureRandom(itemsPool.length)]);
        setCurrentRollingItems(rolling);
        lastTick = currentTick;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Finish
        const finalWinners: string[] = [];
        const remainingPool = [...itemsPool];
        
        for (let i = 0; i < actualDrawCount; i++) {
          const idx = secureRandom(remainingPool.length);
          finalWinners.push(remainingPool[idx]);
          remainingPool.splice(idx, 1);
        }

        if (soundEnabled) playSuccess();
        if (!shouldReduceMotion) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10B981', '#6366F1', '#F59E0B', '#F43F5E']
          });
        }

        setCurrentRollingItems(finalWinners);
        setWinners(finalWinners);
        setIsDrawing(false);

        // Update state
        if (drawMode !== "allow_dup") {
          setAvailableItems(remainingPool);
        }

        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          round: history.length + 1,
          time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
          results: finalWinners
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    };

    requestAnimationFrame(animate);
  }, [hasInteracted, hasActiveList, activeSourceItems, drawMode, availableItems, drawCount, history.length, soundEnabled, initAudio, playTick, playSuccess, handleResetAvailable, shouldReduceMotion]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isDrawing && hasActiveList && availableItems.length > 0) {
        // textarea에 포커스되어 있으면 스페이스바 동작 방지
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        e.preventDefault();
        handleStartDraw();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawing, hasActiveList, availableItems, handleStartDraw]);

  const handleResetHistory = () => {
    setHistory([]);
    setWinners([]);
    setCurrentRollingItems([]);
    setAvailableItems([...activeSourceItems]);
    toast.success("이력이 초기화되었습니다.");
  };

  const handleExcludeLast = () => {
    if (winners.length === 0) return;
    setAvailableItems(prev => prev.filter(item => !winners.includes(item)));
    toast.success("방금 뽑힌 항목을 명단에서 제외했습니다.");
  };

  const handleExportExcel = () => {
    if (history.length === 0) {
      toast.error("내보낼 이력이 없습니다.");
      return;
    }
    const data = history.map(h => ({
      회차: h.round,
      시각: h.time,
      결과: h.results.join(", ")
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "뽑기이력");
    XLSX.writeFile(wb, `랜덤뽑기_이력_${new Date().getTime()}.xlsx`);
  };

  // Stats calculation
  const totalCount = activeSourceItems.length;
  const remainingCount = availableItems.length;
  const drawnCount = totalCount - remainingCount;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center space-x-3 mb-6 md:mb-8">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <Dices className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">랜덤뽑기</h1>
          <p className="text-muted-foreground hidden sm:block">명단에서 인원을 무작위로 추첨합니다. (스페이스바로 시작 가능)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Panel: 명단 입력 및 선택 (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">명단 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 모드 선택 탭 */}
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => handleModeChange("quick")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                    inputMode === "quick"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  빠른 입력
                </button>
                <button
                  onClick={() => handleModeChange("saved")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
                    inputMode === "saved"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  저장된 명단
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
                    className="w-full min-h-[180px] rounded-lg border border-input bg-transparent px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                    placeholder={"홍길동\n김철수\n이영희\n박지민\n최수현"}
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                  />
                  <Button
                    onClick={handleQuickApply}
                    className="w-full h-11 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    바로 사용하기
                  </Button>
                  {quickActive && quickItems.length > 0 && (
                    <div className="text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-md text-center border border-emerald-200 dark:border-emerald-800">
                      ⚡ 임시 명단 사용 중: <span className="font-bold">{quickItems.length}명</span>
                    </div>
                  )}
                </div>
              ) : (
                /* 저장된 명단 모드 */
                <div className="space-y-4">
                  <NameListSelector />
                  {currentList && (
                    <div className="text-sm font-medium bg-muted p-3 rounded-md text-center border">
                      현재 선택된 명단: <span className="text-primary font-bold">{totalCount}명</span>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <NameListInput />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: 메인 추첨 영역 (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px] flex flex-col p-4 md:p-8 border-2 shadow-sm bg-gradient-to-b from-background to-emerald-50/30 dark:to-emerald-950/20">
            {!hasActiveList ? (
              <div className="m-auto text-center text-muted-foreground flex flex-col items-center">
                <Dices className="w-20 h-20 mb-6 opacity-20" />
                <p className="text-lg">
                  {inputMode === "quick"
                    ? "좌측에서 이름을 입력하고 '바로 사용하기'를 눌러주세요."
                    : "좌측 패널에서 명단을 선택하거나 새로 추가해주세요."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-between h-full w-full">
                <div 
                  className="flex-1 flex items-center justify-center w-full my-8"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {currentRollingItems.length === 0 ? (
                    <div className="text-4xl md:text-6xl font-bold text-muted-foreground/30 uppercase tracking-widest">
                      Ready
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                      <AnimatePresence mode="popLayout">
                        {currentRollingItems.map((item, idx) => (
                          <motion.div
                            key={`roll-${idx}-${item}`}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ 
                              y: 0, 
                              opacity: 1, 
                              scale: winners.length > 0 && !shouldReduceMotion ? [1, 1.2, 1] : 1 
                            }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 260, 
                              damping: 20,
                              scale: { duration: shouldReduceMotion ? 0 : 0.5, ease: "easeInOut" }
                            }}
                            className={`flex items-center justify-center p-6 md:p-8 rounded-3xl border-4 shadow-xl bg-card w-full max-w-[400px] ${
                              winners.length > 0 ? "border-emerald-500 shadow-emerald-500/20" : "border-emerald-100 dark:border-emerald-900"
                            } ${currentRollingItems.length > 1 ? "max-w-[250px] md:max-w-[300px]" : "max-w-[500px]"}`}
                          >
                            <span className={`${currentRollingItems.length > 1 ? "text-4xl md:text-5xl" : "text-6xl md:text-7xl"} font-black tracking-tight text-center break-keep w-full ${
                              winners.length > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                            }`}>
                              {item}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* 하단 액션 버튼들 */}
                <div className="w-full flex flex-col gap-4 mt-auto">
                  <Button 
                    size="lg" 
                    onClick={handleStartDraw}
                    disabled={isDrawing || (drawMode === "single" && availableItems.length === 0)}
                    className="w-full h-20 md:h-24 text-3xl md:text-4xl font-black rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white relative overflow-hidden group"
                  >
                    <span className="relative z-10">{isDrawing ? "추첨 중..." : "START"}</span>
                    {!isDrawing && <div className="absolute inset-0 bg-white/20 animate-pulse z-0 rounded-3xl"></div>}
                  </Button>

                  {winners.length > 0 && drawMode === "allow_dup" && (
                    <Button variant="outline" onClick={handleExcludeLast} className="w-full" size="lg">
                      <UserMinus className="w-4 h-4 mr-2" /> 이 결과 명단에서 제외하기
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel: 설정 및 이력 (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center"><Settings className="w-5 h-5 mr-2"/> 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">추첨 방식</Label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "single" as DrawMode, label: "단일 추첨 (중복X)" },
                    { value: "cycle" as DrawMode, label: "모든 항목 순환" },
                    { value: "allow_dup" as DrawMode, label: "중복 허용" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDrawMode(opt.value)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                        drawMode === opt.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-input hover:bg-muted"
                      }`}
                    >
                      <span className={`flex shrink-0 items-center justify-center w-4 h-4 rounded-full border-2 ${
                        drawMode === opt.value
                          ? "border-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}>
                        {drawMode === opt.value && (
                          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">한 번에 뽑을 인원 (1~10명)</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={drawCount} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setDrawCount(Math.max(1, Math.min(10, val)));
                  }}
                />
              </div>

              {hasActiveList && (
                <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-4 text-center text-sm border">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">총 인원</div>
                    <div className="font-bold text-lg">{totalCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">남은 인원</div>
                    <div className="font-bold text-lg text-primary">{remainingCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">뽑힌 인원</div>
                    <div className="font-bold text-lg">{drawnCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">총 횟수</div>
                    <div className="font-bold text-lg">{history.length}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[400px]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between sticky top-0 bg-card z-10 rounded-t-xl border-b">
              <CardTitle className="text-lg flex items-center"><History className="w-5 h-5 mr-2"/> 추첨 이력</CardTitle>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExportExcel} title="엑셀로 내보내기">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleResetHistory} title="이력 초기화">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {history.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                  아직 추첨 이력이 없습니다.
                </div>
              ) : (
                <div className="divide-y">
                  {history.slice(0, 20).map((h) => (
                    <div key={h.id} className="p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">{h.round}회차</span>
                        <span>{h.time}</span>
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        {h.results.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
