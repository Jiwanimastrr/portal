"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { 
  Grid3X3, Settings, Users, Shuffle, Printer, Download, Image as ImageIcon,
  Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, UserMinus, UserPlus,
  Star, Link as LinkIcon, Unlink, AlertCircle, Save, RotateCcw
} from "lucide-react";

import { useListStore } from "@/lib/store/useListStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useTickSound } from "@/lib/hooks/useTickSound";
import { secureRandom } from "@/lib/utils/random";
import { QuickInputPanel } from "@/components/shared/QuickInputPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type BoardPos = "top" | "bottom" | "left" | "right";

export default function SeatsPage() {
  const lists = useListStore((state) => state.lists);
  const currentListId = useListStore((state) => state.currentListId);
  const currentList = lists.find((l) => l.id === currentListId);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const { initAudio, playTick, playSuccess } = useTickSound();

  const [step, setStep] = useState<1 | 2>(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Quick input
  const [quickItems, setQuickItems] = useState<string[]>([]);
  const [quickActive, setQuickActive] = useState(false);

  const activeSourceItems = useMemo(() => {
    if (quickActive && quickItems.length > 0) return quickItems;
    return currentList?.items ?? [];
  }, [quickActive, quickItems, currentList]);

  const handleQuickApply = (items: string[]) => {
    setQuickItems(items);
    setQuickActive(true);
    setAssignments({});
    setAnimatedSeats(new Set());
  };

  // ================= 1단계: 교실 레이아웃 상태 =================
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [boardPos, setBoardPos] = useState<BoardPos>("top");
  const [disabledSeats, setDisabledSeats] = useState<Set<string>>(new Set());
  const [isDisableMode, setIsDisableMode] = useState(false);

  // ================= 2단계: 제약 조건 상태 =================
  const [frontRows, setFrontRows] = useState<Set<string>>(new Set());
  const [keepApart, setKeepApart] = useState<{n1: string; n2: string}[]>([]);
  const [keepTogether, setKeepTogether] = useState<{n1: string; n2: string}[]>([]);
  
  // ================= 3단계: 결과 상태 =================
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // "r-c" -> "name"
  const [isAnimating, setIsAnimating] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [animatedSeats, setAnimatedSeats] = useState<Set<string>>(new Set());
  const captureRef = useRef<HTMLDivElement>(null);

  // 유효 좌석 계산
  const availableSeatsCount = rows * cols - disabledSeats.size;
  const studentsCount = activeSourceItems.length;

  useEffect(() => {
    setAssignments({});
    setAnimatedSeats(new Set());
    setSwapTarget(null);
    setFrontRows(new Set());
    setKeepApart([]);
    setKeepTogether([]);
    setQuickActive(false);
  }, [currentListId]);

  // Load saved layout on mount
  useEffect(() => {
    const saved = localStorage.getItem("pickall_classroom_layout");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRows(parsed.rows || 5);
        setCols(parsed.cols || 6);
        setBoardPos(parsed.boardPos || "top");
        setDisabledSeats(new Set(parsed.disabledSeats || []));
      } catch {
        // ignore
      }
    }
  }, []);

  const saveLayout = () => {
    const layout = {
      rows, cols, boardPos, disabledSeats: Array.from(disabledSeats)
    };
    localStorage.setItem("pickall_classroom_layout", JSON.stringify(layout));
    toast.success("교실 레이아웃이 저장되었습니다.");
  };

  const resetLayout = () => {
    setRows(5);
    setCols(6);
    setBoardPos("top");
    setDisabledSeats(new Set());
    setIsDisableMode(false);
    setAssignments({});
    setAnimatedSeats(new Set());
    localStorage.removeItem("pickall_classroom_layout");
    toast.success("교실 레이아웃이 초기화되었습니다.");
  };

  const handleSeatClick = (r: number, c: number) => {
    const key = `${r}-${c}`;
    
    // 1단계: 빈자리 모드
    if (step === 1 && isDisableMode) {
      setDisabledSeats((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      return;
    }

    // 2단계: 수동 스왑 모드
    if (step === 2 && !isAnimating && Object.keys(assignments).length > 0) {
      if (disabledSeats.has(key)) return; // 빈자리는 클릭 불가
      
      if (!swapTarget) {
        setSwapTarget(key);
        if (soundEnabled) playTick(600, 0.05);
      } else {
        if (swapTarget === key) {
          setSwapTarget(null); // 취소
          return;
        }
        // 스왑 실행
        setAssignments((prev) => {
          const next = { ...prev };
          const p1 = prev[swapTarget];
          const p2 = prev[key];
          
          if (p2) next[swapTarget] = p2;
          else delete next[swapTarget];
          
          if (p1) next[key] = p1;
          else delete next[key];
          
          return next;
        });
        setSwapTarget(null);
        if (soundEnabled) playSuccess();
      }
    }
  };

  const handleAddAisle = () => {
    if (cols >= 10) {
      toast.error("열은 최대 10개까지만 가능합니다.");
      return;
    }
    const centerCol = Math.floor(cols / 2);
    setCols(cols + 1);
    setDisabledSeats((prev) => {
      const next = new Set<string>();
      // 기존 자리 이동
      Array.from(prev).forEach((key) => {
        const [rStr, cStr] = key.split("-");
        const r = parseInt(rStr);
        const c = parseInt(cStr);
        if (c >= centerCol) {
          next.add(`${r}-${c + 1}`);
        } else {
          next.add(key);
        }
      });
      // 새로운 빈자리 열 추가
      for (let r = 0; r < rows; r++) {
        next.add(`${r}-${centerCol}`);
      }
      return next;
    });
    toast.info("가운데에 복도를 추가했습니다.");
  };

  const evaluateConstraints = (assignment: Record<string, string>) => {
    let violations = 0;
    // 거리를 계산하기 위해 map 구축
    const posMap: Record<string, {r:number, c:number}> = {};
    for (const [key, name] of Object.entries(assignment)) {
      const [rStr, cStr] = key.split("-");
      posMap[name] = { r: parseInt(rStr), c: parseInt(cStr) };
    }

    for (const pair of keepApart) {
      const p1 = posMap[pair.n1];
      const p2 = posMap[pair.n2];
      if (p1 && p2) {
        const dist = Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c);
        if (dist <= 1) violations++; // 상하좌우 인접해있으면 실패
      }
    }

    for (const pair of keepTogether) {
      const p1 = posMap[pair.n1];
      const p2 = posMap[pair.n2];
      if (p1 && p2) {
        const dist = Math.abs(p1.r - p2.r) + Math.abs(p1.c - p2.c);
        if (dist > 1) violations++; // 떨어져 있으면 실패
      }
    }
    return violations;
  };

  const handleStartAllocation = () => {
    if (!hasInteracted) {
      initAudio();
      setHasInteracted(true);
    }

    if (activeSourceItems.length === 0) {
      toast.error("명단을 먼저 입력하거나 선택해주세요.");
      return;
    }
    if (studentsCount > availableSeatsCount) {
      toast.error(`학생 수(${studentsCount}명)가 좌석 수(${availableSeatsCount}개)보다 많습니다!`);
      return;
    }

    setIsAnimating(true);
    setSwapTarget(null);
    setAssignments({});
    setAnimatedSeats(new Set());

    // 1. 가용 좌석 리스트업
    const availablePos: {r:number, c:number, dist: number}[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!disabledSeats.has(`${r}-${c}`)) {
          // 칠판과의 거리 계산 (간단히 앞자리 우선용)
          let dist = 0;
          if (boardPos === "top") dist = r;
          if (boardPos === "bottom") dist = rows - 1 - r;
          if (boardPos === "left") dist = c;
          if (boardPos === "right") dist = cols - 1 - c;
          availablePos.push({r, c, dist});
        }
      }
    }

    // 앞자리 우선을 위해 거리순 정렬
    availablePos.sort((a, b) => a.dist - b.dist);

    let bestAssignment: Record<string, string> = {};
    let success = false;
    let minViolations = Infinity;
    const maxRetries = 200;

    for (let retry = 0; retry < maxRetries; retry++) {
      const tempAssignment: Record<string, string> = {};
      const remainingPos = [...availablePos];
      const students = [...activeSourceItems];
      
      // 앞자리 배정
      const frontStudents = students.filter(s => frontRows.has(s));
      const normalStudents = students.filter(s => !frontRows.has(s));
      
      // 셔플 함수
      const shuffleArray = <T,>(arr: T[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = secureRandom(i + 1);
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      };
      
      shuffleArray(frontStudents);
      shuffleArray(normalStudents);

      let placeError = false;
      
      // 앞자리 학생 먼저 앞쪽 좌석에 배정
      for (const fs of frontStudents) {
        if (remainingPos.length > 0) {
          const pos = remainingPos.shift()!; // 거리가 가까운 순서대로 앞에서 빼기
          tempAssignment[`${pos.r}-${pos.c}`] = fs;
        } else {
          placeError = true;
        }
      }

      // 나머지 학생 랜덤 배정
      shuffleArray(remainingPos); // 남은 자리는 섞음
      for (const ns of normalStudents) {
        if (remainingPos.length > 0) {
          const pos = remainingPos.shift()!;
          tempAssignment[`${pos.r}-${pos.c}`] = ns;
        } else {
          placeError = true;
        }
      }

      if (!placeError) {
        const violations = evaluateConstraints(tempAssignment);
        if (violations === 0) {
          bestAssignment = tempAssignment;
          success = true;
          break;
        }
        if (violations < minViolations) {
          minViolations = violations;
          bestAssignment = tempAssignment;
        }
      } else {
        // 실패 시 마지막 결과를 베스트로 저장해둠 (최선책)
        bestAssignment = tempAssignment;
      }
    }

    if (!success) {
      toast.warning("제약 조건이 너무 까다로워 일부 조건이 무시된 결과를 표시합니다.", { duration: 5000 });
    }

    // 애니메이션으로 렌더링
    const targetKeys = Object.keys(bestAssignment);
    // 섞어서 하나씩 등장하도록
    for (let i = targetKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targetKeys[i], targetKeys[j]] = [targetKeys[j], targetKeys[i]];
    }

    let currentIdx = 0;
    const finalAssignment: Record<string, string> = {};

    const animInterval = setInterval(() => {
      if (currentIdx >= targetKeys.length) {
        clearInterval(animInterval);
        setIsAnimating(false);
        if (soundEnabled) playSuccess();
        if (!shouldReduceMotion) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        return;
      }
      
      const key = targetKeys[currentIdx];
      finalAssignment[key] = bestAssignment[key];
      setAssignments({ ...finalAssignment });
      setAnimatedSeats(prev => new Set(prev).add(key));
      
      if (soundEnabled) playTick(800 + Math.random() * 400, 0.05);
      
      currentIdx++;
    }, 100);
  };

  const handleExportExcel = () => {
    if (Object.keys(assignments).length === 0) {
      toast.error("결과가 없습니다.");
      return;
    }
    const data = [];
    for (let r = 0; r < rows; r++) {
      const rowData: Record<string, string> = {};
      for (let c = 0; c < cols; c++) {
        const name = assignments[`${r}-${c}`] || (disabledSeats.has(`${r}-${c}`) ? "복도/빈자리" : "빈자리");
        rowData[`${c + 1}열`] = name;
      }
      data.push(rowData);
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "자리배치도");
    XLSX.writeFile(wb, `자리배치_${new Date().getTime()}.xlsx`);
  };

  const handleExportImage = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `자리배치_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("이미지가 저장되었습니다.");
    } catch {
      toast.error("이미지 저장에 실패했습니다.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const BoardIndicator = ({ pos }: { pos: BoardPos }) => {
    if (boardPos !== pos) return null;
    return (
      <div className={`absolute flex items-center justify-center bg-slate-800 text-white font-bold text-lg md:text-xl rounded-md shadow-md
        ${pos === "top" ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-12" : ""}
        ${pos === "bottom" ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2/3 h-12" : ""}
        ${pos === "left" ? "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-2/3 w-12 writing-vertical" : ""}
        ${pos === "right" ? "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-2/3 w-12 writing-vertical" : ""}
      `}>
        칠 판
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[1400px]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 20px; }
          @page { size: A4 landscape; margin: 10mm; }
        }
        .writing-vertical { writing-mode: vertical-rl; text-orientation: upright; }
      `}} />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Grid3X3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">자리뽑기</h1>
            <p className="text-muted-foreground hidden sm:block">교실 도면을 만들고 무작위로 자리를 배정합니다.</p>
          </div>
        </div>
        
        {/* 단계 탭 */}
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${step === 1 ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
            onClick={() => setStep(1)}
          >
            1단계: 교실 만들기
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${step === 2 ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}
            onClick={() => {
              if (activeSourceItems.length === 0) toast.error("먼저 명단을 입력하거나 선택해주세요.");
              else if (studentsCount > availableSeatsCount) toast.error("유효 좌석이 학생 수보다 적습니다.");
              else setStep(2);
            }}
          >
            2단계: 자리 배치
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ==================== 좌측 패널 (제어부) ==================== */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                {step === 1 ? <><Settings className="w-5 h-5 mr-2" /> 교실 설정</> : <><Users className="w-5 h-5 mr-2" /> 제약 조건</>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <QuickInputPanel
                    onQuickApply={handleQuickApply}
                    quickActive={quickActive}
                    quickItemsCount={quickItems.length}
                    accentFrom="from-indigo-500"
                    accentTo="to-violet-600"
                    savedListInfo={
                      activeSourceItems.length > 0 ? (
                        <div className={`text-sm font-medium p-3 rounded-md border ${studentsCount > availableSeatsCount ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-600 dark:text-red-400' : 'bg-muted'}`}>
                          <div className="flex justify-between mb-1">
                            <span>학생 수: <b>{studentsCount}명</b></span>
                            <span>자리 수: <b>{availableSeatsCount}개</b></span>
                          </div>
                          {studentsCount > availableSeatsCount && (
                            <p className="text-xs font-bold mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {studentsCount - availableSeatsCount}자리가 부족합니다!</p>
                          )}
                        </div>
                      ) : undefined
                    }
                  />

                  {/* 빠른입력 적용 시에도 학생/좌석 수 표시 */}
                  {quickActive && quickItems.length > 0 && (
                    <div className={`text-sm font-medium p-3 rounded-md border ${studentsCount > availableSeatsCount ? 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-600 dark:text-red-400' : 'bg-muted'}`}>
                      <div className="flex justify-between mb-1">
                        <span>학생 수: <b>{studentsCount}명</b></span>
                        <span>자리 수: <b>{availableSeatsCount}개</b></span>
                      </div>
                      {studentsCount > availableSeatsCount && (
                        <p className="text-xs font-bold mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {studentsCount - availableSeatsCount}자리가 부족합니다!</p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>행 (Row)</Label>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="icon" onClick={() => setRows(Math.max(1, rows - 1))}><Minus className="w-4 h-4" /></Button>
                          <span className="w-8 text-center font-bold">{rows}</span>
                          <Button variant="outline" size="icon" onClick={() => setRows(Math.min(10, rows + 1))}><Plus className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>열 (Col)</Label>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="icon" onClick={() => setCols(Math.max(1, cols - 1))}><Minus className="w-4 h-4" /></Button>
                          <span className="w-8 text-center font-bold">{cols}</span>
                          <Button variant="outline" size="icon" onClick={() => setCols(Math.min(10, cols + 1))}><Plus className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label>칠판 위치</Label>
                      <div className="flex gap-2">
                        <Button variant={boardPos === "top" ? "default" : "outline"} size="icon" onClick={() => setBoardPos("top")}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant={boardPos === "bottom" ? "default" : "outline"} size="icon" onClick={() => setBoardPos("bottom")}><ArrowDown className="w-4 h-4" /></Button>
                        <Button variant={boardPos === "left" ? "default" : "outline"} size="icon" onClick={() => setBoardPos("left")}><ArrowLeft className="w-4 h-4" /></Button>
                        <Button variant={boardPos === "right" ? "default" : "outline"} size="icon" onClick={() => setBoardPos("right")}><ArrowRight className="w-4 h-4" /></Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                      <button
                        onClick={() => setIsDisableMode(!isDisableMode)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                          isDisableMode
                            ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20 hover:bg-red-600"
                            : "bg-background text-muted-foreground border-input hover:border-red-300 hover:text-red-500"
                        }`}
                      >
                        <UserMinus className="w-4 h-4" />
                        자리 비우기 모드
                        <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                          isDisableMode
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {isDisableMode ? "ON" : "OFF"}
                        </span>
                      </button>
                      {isDisableMode && (
                        <p className="text-xs text-red-500 text-center font-medium animate-pulse">
                          좌석을 클릭하면 비활성화/활성화됩니다
                        </p>
                      )}
                      <Button variant="secondary" className="w-full" onClick={handleAddAisle}>
                        <UserMinus className="w-4 h-4 mr-2" /> 중앙 복도 추가
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full" onClick={saveLayout}>
                          <Save className="w-4 h-4 mr-2" /> 저장
                        </Button>
                        <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={resetLayout}>
                          <RotateCcw className="w-4 h-4 mr-2" /> 초기화
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && activeSourceItems.length > 0 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold">
                      <Star className="w-4 h-4 mr-1 fill-indigo-600 dark:fill-indigo-400" /> 앞자리 우선 학생
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {activeSourceItems.map(name => (
                        <Badge 
                          key={`front-${name}`}
                          variant={frontRows.has(name) ? "default" : "outline"}
                          className={`cursor-pointer text-sm ${frontRows.has(name) ? 'bg-indigo-500 hover:bg-indigo-600' : ''}`}
                          onClick={() => {
                            setFrontRows(prev => {
                              const next = new Set(prev);
                              if (next.has(name)) next.delete(name);
                              else next.add(name);
                              return next;
                            });
                          }}
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">클릭하여 앞자리에 배치할 학생을 선택하세요.</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label className="flex items-center text-red-500 font-bold">
                      <Unlink className="w-4 h-4 mr-1" /> 이 둘은 떨어뜨리기
                    </Label>
                    {keepApart.map((pair, idx) => (
                      <div key={`apart-${idx}`} className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{pair.n1}</span> ↔ <span className="font-bold">{pair.n2}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setKeepApart(prev => prev.filter((_, i) => i !== idx))}><Minus className="w-3 h-3" /></Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('apart1')?.setAttribute('value', v); }}>
                        <SelectTrigger id="apart1"><SelectValue placeholder="학생1" /></SelectTrigger>
                        <SelectContent>{activeSourceItems.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('apart2')?.setAttribute('value', v); }}>
                        <SelectTrigger id="apart2"><SelectValue placeholder="학생2" /></SelectTrigger>
                        <SelectContent>{activeSourceItems.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => {
                        const n1 = document.getElementById('apart1')?.getAttribute('value');
                        const n2 = document.getElementById('apart2')?.getAttribute('value');
                        if (n1 && n2 && n1 !== n2) setKeepApart([...keepApart, {n1, n2}]);
                      }}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label className="flex items-center text-green-500 font-bold">
                      <LinkIcon className="w-4 h-4 mr-1" /> 이 둘은 붙여놓기 (짝꿍)
                    </Label>
                    {keepTogether.map((pair, idx) => (
                      <div key={`tgt-${idx}`} className="flex items-center gap-2 text-sm">
                        <span className="font-bold">{pair.n1}</span> + <span className="font-bold">{pair.n2}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setKeepTogether(prev => prev.filter((_, i) => i !== idx))}><Minus className="w-3 h-3" /></Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('tgt1')?.setAttribute('value', v); }}>
                        <SelectTrigger id="tgt1"><SelectValue placeholder="학생1" /></SelectTrigger>
                        <SelectContent>{activeSourceItems.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('tgt2')?.setAttribute('value', v); }}>
                        <SelectTrigger id="tgt2"><SelectValue placeholder="학생2" /></SelectTrigger>
                        <SelectContent>{activeSourceItems.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => {
                        const n1 = document.getElementById('tgt1')?.getAttribute('value');
                        const n2 = document.getElementById('tgt2')?.getAttribute('value');
                        if (n1 && n2 && n1 !== n2) setKeepTogether([...keepTogether, {n1, n2}]);
                      }}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <Button 
                      size="lg" 
                      onClick={handleStartAllocation}
                      disabled={isAnimating}
                      className="w-full text-xl font-bold h-14 bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    >
                      <Shuffle className="w-5 h-5 mr-2" /> 자리 뽑기 시작
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==================== 우측 패널 (교실 렌더링) ==================== */}
        <div className="xl:col-span-3">
          <Card className="h-full min-h-[600px] flex flex-col border-2 shadow-sm relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            {/* 결과 액션바 */}
            {step === 2 && Object.keys(assignments).length > 0 && !isAnimating && (
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button variant="secondary" size="sm" onClick={handlePrint} title="인쇄 (A4 가로 추천)"><Printer className="w-4 h-4 mr-2" /> 인쇄</Button>
                <Button variant="secondary" size="sm" onClick={handleExportImage} title="이미지로 저장"><ImageIcon className="w-4 h-4 mr-2" /> 캡처</Button>
                <Button variant="secondary" size="sm" onClick={handleExportExcel} title="엑셀로 다운로드"><Download className="w-4 h-4 mr-2" /> 엑셀</Button>
              </div>
            )}

            {step === 2 && swapTarget && (
              <div className="absolute top-4 left-4 z-10 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 px-4 py-2 rounded-md font-bold shadow-md animate-pulse border border-indigo-300">
                변경할 자리를 하나 더 선택하세요.
              </div>
            )}

            <div className="flex-1 w-full h-full p-4 md:p-12 flex items-center justify-center relative overflow-auto">
              <div 
                id="print-area" 
                ref={captureRef}
                aria-live="polite"
                aria-atomic="true"
                className="relative bg-white dark:bg-slate-950 p-12 md:p-16 rounded-2xl border-4 border-slate-200 dark:border-slate-800 shadow-xl transition-all"
                style={{ 
                  display: 'grid', 
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, 
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, 
                  gap: '1rem',
                  minWidth: `${cols * 100}px`, // 최소 크기 보장
                  minHeight: `${rows * 80}px`
                }}
              >
                <BoardIndicator pos={boardPos} />

                {Array.from({ length: rows }).map((_, r) => (
                  Array.from({ length: cols }).map((_, c) => {
                    const key = `${r}-${c}`;
                    const isDisabled = disabledSeats.has(key);
                    const name = assignments[key];
                    const isAnimated = animatedSeats.has(key);
                    const isSwapTarget = swapTarget === key;

                    if (isDisabled) {
                      return (
                        <div 
                          key={key} 
                          onClick={() => handleSeatClick(r, c)}
                          className={`w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl transition-all
                            ${step === 1 && isDisableMode ? 'cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300' : 'opacity-30'}
                          `}
                        />
                      );
                    }

                    return (
                      <div
                        key={key}
                        onClick={() => handleSeatClick(r, c)}
                        className={`relative w-full h-full min-h-[60px] md:min-h-[80px] rounded-xl border-2 flex items-center justify-center p-2 text-center transition-all shadow-sm
                          ${step === 1 && isDisableMode ? 'cursor-pointer hover:bg-slate-200 hover:scale-95' : ''}
                          ${step === 2 && !isAnimating ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md' : ''}
                          ${isSwapTarget ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-105 ring-4 ring-indigo-200 dark:ring-indigo-800 z-10' : 'border-slate-300 bg-card text-foreground'}
                        `}
                      >
                        {/* 책상 등받이 디테일 */}
                        <div className="absolute -top-1 left-1/4 right-1/4 h-2 bg-slate-200 dark:bg-slate-700 rounded-t-md opacity-50" />
                        
                        {/* 학생 이름 애니메이션 */}
                        <AnimatePresence>
                          {name && isAnimated && (
                            <motion.div
                              initial={{ y: shouldReduceMotion ? 0 : -100, opacity: 0, scale: shouldReduceMotion ? 1 : 0.5 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 260, damping: 20, duration: shouldReduceMotion ? 0 : undefined }}
                              className="w-full font-bold text-lg md:text-xl truncate"
                            >
                              {frontRows.has(name) && <Star className="inline-block w-4 h-4 fill-yellow-400 text-yellow-400 mr-1 -mt-1" />}
                              {name}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* 애니메이션 없이 이미 있는 이름 (스왑 시 등) */}
                        {name && !isAnimated && (
                          <div className="w-full font-bold text-lg md:text-xl truncate">
                            {frontRows.has(name) && <Star className="inline-block w-4 h-4 fill-yellow-400 text-yellow-400 mr-1 -mt-1" />}
                            {name}
                          </div>
                        )}
                        
                        {/* 1단계에서는 책상 아이콘 표시 */}
                        {!name && step === 1 && <UserPlus className="w-6 h-6 text-slate-300" />}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
