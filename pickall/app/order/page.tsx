"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { ListOrdered, Save, Download, RefreshCcw, Image as ImageIcon, MousePointerClick } from "lucide-react";

import { useListStore } from "@/lib/store/useListStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useTickSound } from "@/lib/hooks/useTickSound";
import { secureShuffle } from "@/lib/utils/random";
import { QuickInputPanel } from "@/components/shared/QuickInputPanel";
import { useQuickInput } from "@/lib/hooks/useQuickInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OrderResult {
  rank: number;
  name: string;
}

export default function OrderPage() {
  const currentListId = useListStore((state) => state.currentListId);
  const addList = useListStore((state) => state.addList);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);

  const { initAudio, playTick, playSuccess } = useTickSound();
  const captureRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const {
    inputMode,
    setInputMode,
    quickItems,
    quickActive,
    activeSourceItems,
    hasActiveList,
    handleQuickApply: _handleQuickApply,
    currentList
  } = useQuickInput();

  const handleQuickApply = (items: string[]) => {
    _handleQuickApply(items);
    setResults(null);
    setRevealedCount(0);
    setClickedCard(null);
  };

  // Options
  const [revealOneByOne, setRevealOneByOne] = useState(false);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [partialCount, setPartialCount] = useState<number | "">("");

  // Game States
  const [isShuffling, setIsShuffling] = useState(false);
  const [results, setResults] = useState<OrderResult[] | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [clickedCard, setClickedCard] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Reset when list changes
  useEffect(() => {
    setResults(null);
    setRevealedCount(0);
    setClickedCard(null);
    setPartialCount("");
  }, [currentListId]);

  const fireConfetti = useCallback(() => {
    if (!shouldReduceMotion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#6366F1", "#F59E0B"],
      });
    }
  }, [shouldReduceMotion]);

  const handleStartOrder = useCallback(() => {
    if (!hasInteracted) {
      initAudio();
      setHasInteracted(true);
    }
    if (!hasActiveList) {
      toast.error("명단을 선택하거나 인원을 추가해주세요.");
      return;
    }

    const items = [...activeSourceItems];
    const total = items.length;
    let targetCount = total;

    if (typeof partialCount === "number" && partialCount > 0) {
      targetCount = Math.min(partialCount, total);
    }

    setIsShuffling(true);
    setResults(null);
    setRevealedCount(0);
    setClickedCard(null);

    // Shuffle animation tick sound
    let ticks = 0;
    const interval = setInterval(() => {
      if (soundEnabled) playTick(600 + Math.random() * 200, 0.05);
      ticks++;
      if (ticks > 15) clearInterval(interval);
    }, 100);

    // After shuffle (1.5s)
    setTimeout(() => {
      // Fisher-Yates Shuffle
      const shuffledItems = secureShuffle(items);

      const finalResults = shuffledItems.slice(0, targetCount).map((name, idx) => ({
        rank: idx + 1,
        name,
      }));

      if (soundEnabled) playSuccess();
      setResults(finalResults);
      setIsShuffling(false);

      if (!revealOneByOne) {
        setRevealedCount(targetCount);
        fireConfetti();
      }
    }, 1500);
  }, [hasInteracted, hasActiveList, activeSourceItems, partialCount, soundEnabled, revealOneByOne, initAudio, playTick, playSuccess, fireConfetti]);

  const handleRevealNext = useCallback(() => {
    if (results && revealedCount < results.length) {
      setRevealedCount((prev) => prev + 1);
      if (soundEnabled) playTick(1000, 0.1, "triangle");
      
      if (revealedCount + 1 === results.length) {
        if (soundEnabled) playSuccess();
        fireConfetti();
      }
    }
  }, [results, revealedCount, soundEnabled, playTick, playSuccess, fireConfetti]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.code === "Space" && hasActiveList) {
        e.preventDefault();
        if (!isShuffling && !results) {
          handleStartOrder();
        } else if (results && revealOneByOne && revealedCount < results.length) {
          handleRevealNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShuffling, results, revealOneByOne, revealedCount, hasActiveList, handleStartOrder, handleRevealNext]);

  const handleRevealAll = () => {
    if (results) {
      setRevealedCount(results.length);
      if (soundEnabled) playSuccess();
      fireConfetti();
    }
  };

  const handleSaveFixedOrder = () => {
    if (!results) return;
    const baseName = currentList?.name || "빠른입력";
    const newName = `${baseName} - 순서고정`;
    const newItems = results.map((r) => r.name);
    addList({ name: newName, items: newItems });
    toast.success(`새 명단 "${newName}"이 저장되었습니다.`);
  };

  const handleExportExcel = () => {
    if (!results) {
      toast.error("결과가 없습니다.");
      return;
    }
    const data = results.map((r) => ({
      순서: r.rank,
      이름: r.name,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "순서결과");
    XLSX.writeFile(wb, `순서뽑기_결과_${new Date().getTime()}.xlsx`);
  };

  const handleExportImage = async () => {
    if (!captureRef.current || !results) {
      toast.error("결과가 없습니다.");
      return;
    }
    try {
      const canvas = await html2canvas(captureRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `순서뽑기_결과_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("이미지가 저장되었습니다.");
    } catch {
      toast.error("이미지 저장에 실패했습니다.");
    }
  };

  // Helper to determine if a card at index is revealed
  const isCardRevealed = (index: number) => {
    if (!results) return false;
    if (!revealOneByOne) return true;
    if (reverseOrder) {
      return index >= results.length - revealedCount;
    } else {
      return index < revealedCount;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center space-x-3 mb-6 md:mb-8">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <ListOrdered className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">순서뽑기</h1>
          <p className="text-muted-foreground hidden sm:block">명단 인원들에게 무작위로 순서를 부여합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Settings & Input */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">명단 및 옵션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickInputPanel
                inputMode={inputMode}
                onModeChange={setInputMode}
                onQuickApply={handleQuickApply}
                quickActive={quickActive}
                quickItemsCount={quickItems.length}
                accentFrom="from-indigo-500"
                accentTo="to-purple-600"
                savedListInfo={
                  currentList ? (
                    <div className="text-sm font-medium bg-muted p-3 rounded-md text-center border">
                      현재 선택된 명단: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentList.items.length}명</span>
                    </div>
                  ) : undefined
                }
              />
              
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">한 명씩 공개</Label>
                  <button
                    onClick={() => { if (!isShuffling && !results) setRevealOneByOne(!revealOneByOne); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      revealOneByOne
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-muted text-muted-foreground border-input hover:border-indigo-300"
                    } ${isShuffling || results !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isShuffling || results !== null}
                  >
                    {revealOneByOne ? "ON" : "OFF"}
                  </button>
                </div>
                {revealOneByOne && (
                  <div className="flex items-center justify-between pl-4 border-l-2 border-indigo-100 dark:border-indigo-900">
                    <Label className="text-sm font-medium text-muted-foreground">꼴등부터 발표(역순)</Label>
                    <button
                      onClick={() => { if (!isShuffling && !results) setReverseOrder(!reverseOrder); }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        reverseOrder
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-muted text-muted-foreground border-input hover:border-indigo-300"
                      } ${isShuffling || results !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isShuffling || results !== null}
                    >
                      {reverseOrder ? "ON" : "OFF"}
                    </button>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">일부만 뽑기 (상위 N명)</Label>
                  <Input 
                    type="number" 
                    placeholder="전체 인원" 
                    value={partialCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val)) setPartialCount("");
                      else setPartialCount(Math.max(1, val));
                    }}
                    disabled={isShuffling || results !== null}
                  />
                  <p className="text-xs text-muted-foreground">빈칸일 경우 전체 인원의 순서를 정합니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Main Draw Area */}
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[600px] flex flex-col p-4 md:p-8 border-2 shadow-sm bg-gradient-to-br from-background via-indigo-50/20 to-slate-100/50 dark:from-background dark:via-indigo-950/10 dark:to-slate-900/20">
            {!hasActiveList ? (
              <div className="m-auto text-center text-muted-foreground flex flex-col items-center">
                <ListOrdered className="w-20 h-20 mb-6 opacity-20" />
                <p className="text-lg">좌측 패널에서 명단을 입력하거나 선택해주세요.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full w-full relative">
                
                {/* 결과 영역 */}
                <div 
                  className="flex-1 w-full min-h-[400px] relative rounded-xl" 
                  ref={captureRef}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {!isShuffling && !results && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground opacity-50 space-y-4">
                        <ListOrdered className="w-24 h-24 mx-auto opacity-50" />
                        <h2 className="text-2xl font-bold">대기 중...</h2>
                      </div>
                    </div>
                  )}

                  {isShuffling && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-32 h-48">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={`shuffle-${i}`}
                            className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl border shadow-lg"
                            initial={{ x: 0, y: 0, rotate: 0 }}
                            animate={{
                              x: [0, (i % 2 === 0 ? 1 : -1) * (50 + i * 10), 0],
                              y: [0, (i % 2 === 0 ? -1 : 1) * 20, 0],
                              rotate: [0, (i % 2 === 0 ? 1 : -1) * 15, 0],
                              zIndex: [i, 5 - i, i],
                            }}
                            transition={{
                              duration: 1.5,
                              ease: "easeInOut",
                              times: [0, 0.5, 1],
                              repeat: 0,
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center opacity-10">
                              <ListOrdered className="w-12 h-12" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {results && (
                    <div className={`grid gap-3 md:gap-4 p-2 pb-24 content-start
                      grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`}
                    >
                      {results.map((result, index) => {
                        const revealed = isCardRevealed(index);
                        const rank = result.rank;
                        const isClicked = clickedCard === rank;
                        
                        let rankStyle = "bg-card border-border text-foreground";
                        let rankBadgeStyle = "bg-muted text-muted-foreground";

                        if (revealed) {
                          if (rank === 1) {
                            rankStyle = "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700/50 shadow-yellow-200/50";
                            rankBadgeStyle = "bg-yellow-400 text-yellow-950 shadow-sm";
                          } else if (rank === 2) {
                            rankStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 shadow-slate-200/50";
                            rankBadgeStyle = "bg-slate-300 text-slate-900 shadow-sm";
                          } else if (rank === 3) {
                            rankStyle = "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/50 shadow-orange-200/50";
                            rankBadgeStyle = "bg-orange-400 text-orange-950 shadow-sm";
                          } else {
                            rankStyle = "bg-card border-border hover:border-indigo-200 dark:hover:border-indigo-800";
                            rankBadgeStyle = "bg-muted text-foreground";
                          }
                        }

                        return (
                          <motion.div
                            key={result.name + rank}
                            layout
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={
                              revealed
                                ? { 
                                    scale: isClicked ? 1.1 : 1, 
                                    opacity: 1, 
                                    y: 0,
                                    zIndex: isClicked ? 10 : 1,
                                    rotateY: 0
                                  }
                                : { scale: 0.9, opacity: 0, y: 0, rotateY: 180 }
                            }
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: shouldReduceMotion || revealOneByOne ? 0 : index * 0.05,
                            }}
                            onClick={() => revealed && setClickedCard(isClicked ? null : rank)}
                            className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-shadow ${rankStyle} ${isClicked ? 'shadow-2xl ring-4 ring-indigo-500/30' : 'shadow-sm hover:shadow-md'} min-h-[120px]`}
                          >
                            <div className="absolute top-3 left-3 flex items-center justify-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rankBadgeStyle}`}>
                                {rank}
                              </span>
                            </div>
                            <div className="mt-4 font-bold text-lg md:text-xl break-keep">
                              {result.name}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 하단 플로팅 액션 영역 */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pointer-events-none p-4 pb-0">
                  <div className="w-full max-w-2xl bg-background/80 backdrop-blur-md border shadow-lg rounded-2xl p-4 pointer-events-auto flex flex-col md:flex-row gap-3 items-center justify-between">
                    {!results ? (
                      <Button 
                        size="lg" 
                        onClick={handleStartOrder}
                        disabled={isShuffling}
                        className="w-full text-xl font-bold h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:-translate-y-1"
                      >
                        {isShuffling ? "셔플 중..." : "순서 정하기 START!"}
                      </Button>
                    ) : (
                      <>
                        {/* 한 명씩 공개 컨트롤 */}
                        {revealOneByOne && revealedCount < results.length && (
                          <div className="flex-1 flex gap-2 w-full">
                            <Button 
                              size="lg" 
                              onClick={handleRevealNext} 
                              className="flex-1 text-lg font-bold h-12 bg-indigo-600 hover:bg-indigo-700"
                            >
                              다음 공개 <MousePointerClick className="ml-2 w-5 h-5" />
                            </Button>
                            <Button 
                              size="lg" 
                              variant="secondary" 
                              onClick={handleRevealAll} 
                              className="h-12 whitespace-nowrap"
                            >
                              모두 공개
                            </Button>
                          </div>
                        )}

                        {/* 완료 후 옵션들 */}
                        {(!revealOneByOne || revealedCount === results.length) && (
                          <div className="w-full flex flex-wrap gap-2 items-center justify-center md:justify-between">
                            <Button variant="outline" onClick={() => { setResults(null); setRevealedCount(0); }}>
                              <RefreshCcw className="w-4 h-4 mr-2" /> 다시 뽑기
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="secondary" onClick={handleSaveFixedOrder} title="현재 순서를 명단으로 저장">
                                <Save className="w-4 h-4 mr-2" /> 순서 고정
                              </Button>
                              <Button variant="secondary" onClick={handleExportImage} title="결과 화면 이미지로 저장">
                                <ImageIcon className="w-4 h-4 mr-2" /> 이미지
                              </Button>
                              <Button variant="secondary" onClick={handleExportExcel} title="엑셀로 다운로드">
                                <Download className="w-4 h-4 mr-2" /> 엑셀
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
