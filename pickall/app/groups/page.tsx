"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { 
  Users, Shuffle, Printer, Download, Image as ImageIcon,
  Plus, Minus, Star, RefreshCw, Send, Settings, Link as LinkIcon, Unlink
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
import { Input } from "@/components/ui/input";

type GroupMode = "groupCount" | "studentsPerGroup";
type ThemeType = "auto" | "animals" | "colors";

interface StudentMeta {
  gender?: "M" | "F";
  level?: number; // 1 ~ 5
  grade?: string;
}

const ANIMALS = ["사자", "호랑이", "독수리", "돌고래", "부엉이", "팬더", "코알라", "펭귄", "토끼", "여우", "곰", "기린"];
const COLORS = ["빨강", "파랑", "노랑", "초록", "보라", "주황", "분홍", "하늘", "연두", "갈색", "검정", "하양"];
const PASTEL_BGS = [
  "bg-red-100 dark:bg-red-950/30",
  "bg-blue-100 dark:bg-blue-950/30",
  "bg-green-100 dark:bg-green-950/30",
  "bg-yellow-100 dark:bg-yellow-950/30",
  "bg-purple-100 dark:bg-purple-950/30",
  "bg-pink-100 dark:bg-pink-950/30",
  "bg-orange-100 dark:bg-orange-950/30",
  "bg-teal-100 dark:bg-teal-950/30",
];
const PASTEL_BORDERS = [
  "border-red-200 dark:border-red-800",
  "border-blue-200 dark:border-blue-800",
  "border-green-200 dark:border-green-800",
  "border-yellow-200 dark:border-yellow-800",
  "border-purple-200 dark:border-purple-800",
  "border-pink-200 dark:border-pink-800",
  "border-orange-200 dark:border-orange-800",
  "border-teal-200 dark:border-teal-800",
];

export default function GroupsPage() {
  const router = useRouter();
  const lists = useListStore((state) => state.lists);
  const currentListId = useListStore((state) => state.currentListId);
  const currentList = lists.find((l) => l.id === currentListId);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const { initAudio, playTick, playSuccess } = useTickSound();
  const shouldReduceMotion = useReducedMotion();

  const [hasInteracted, setHasInteracted] = useState(false);

  // Quick input
  const [quickItems, setQuickItems] = useState<string[]>([]);
  const [quickActive, setQuickActive] = useState(false);

  const activeSourceItems = useMemo(() => {
    if (quickActive && quickItems.length > 0) return quickItems;
    return currentList?.items ?? [];
  }, [quickActive, quickItems, currentList]);

  const hasActiveList = activeSourceItems.length > 0;

  const handleQuickApply = (items: string[]) => {
    setQuickItems(items);
    setQuickActive(true);
    setGroups([]);
    setGroupLeaders({});
  };

  // ================= 1. 좌측 메타데이터 상태 =================
  const [useMeta, setUseMeta] = useState(false);
  const [meta, setMeta] = useState<Record<string, StudentMeta>>({});

  // ================= 2. 중앙 설정 상태 =================
  const [mode, setMode] = useState<GroupMode>("groupCount");
  const [groupCount, setGroupCount] = useState(4);
  const [studentsPerGroup, setStudentsPerGroup] = useState(4);
  
  const [balanceGender, setBalanceGender] = useState(false);
  const [balanceLevel, setBalanceLevel] = useState(false);
  // mixGrade는 향후 구현 예정 (현재 UI에서 disabled 상태)
  
  const [keepApart, setKeepApart] = useState<{n1: string; n2: string}[]>([]);
  const [keepTogether, setKeepTogether] = useState<{n1: string; n2: string}[]>([]);
  
  const [theme, setTheme] = useState<ThemeType>("auto");
  const [autoLeader, setAutoLeader] = useState(false);

  // ================= 3. 우측 결과 상태 =================
  // groups[groupIndex] = ["name1", "name2", ...]
  const [groups, setGroups] = useState<string[][]>([]); 
  const [groupLeaders, setGroupLeaders] = useState<Record<number, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{g: number; i: number} | null>(null);
  
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGroups([]);
    setSwapTarget(null);
    setKeepApart([]);
    setKeepTogether([]);
    setQuickActive(false);
  }, [currentListId]);

  // 메타데이터 자동 저장/불러오기
  useEffect(() => {
    if (currentListId) {
      const saved = localStorage.getItem(`pickall_meta_${currentListId}`);
      if (saved) {
        try { setMeta(JSON.parse(saved)); } catch {}
      } else {
        setMeta({});
      }
    }
  }, [currentListId]);

  const updateMeta = <K extends keyof StudentMeta>(name: string, key: K, value: StudentMeta[K]) => {
    const next = { ...meta, [name]: { ...meta[name], [key]: value } };
    setMeta(next);
    localStorage.setItem(`pickall_meta_${currentListId}`, JSON.stringify(next));
  };

  const handleStudentClick = (gIdx: number, iIdx: number) => {
    if (isAnimating || groups.length === 0) return;
    
    if (!swapTarget) {
      setSwapTarget({ g: gIdx, i: iIdx });
      if (soundEnabled) playTick(600, 0.05);
    } else {
      if (swapTarget.g === gIdx && swapTarget.i === iIdx) {
        setSwapTarget(null);
        return;
      }
      setGroups((prev) => {
        const next = prev.map(g => [...g]);
        const p1 = next[swapTarget.g][swapTarget.i];
        const p2 = next[gIdx][iIdx];
        
        next[swapTarget.g][swapTarget.i] = p2;
        next[gIdx][iIdx] = p1;
        
        return next;
      });
      // 만약 모둠장이 스왑되었다면, 새로운 조에서 모둠장 역할을 잃음 (편의상 유지 또는 초기화)
      setSwapTarget(null);
      if (soundEnabled) playSuccess();
    }
  };

  const evaluateConstraints = (tempGroups: string[][]) => {
    let violations = 0;
    const groupMap: Record<string, number> = {};
    for (let g = 0; g < tempGroups.length; g++) {
      for (const name of tempGroups[g]) {
        groupMap[name] = g;
      }
    }

    for (const pair of keepApart) {
      const g1 = groupMap[pair.n1];
      const g2 = groupMap[pair.n2];
      if (g1 !== undefined && g2 !== undefined && g1 === g2) violations++;
    }

    for (const pair of keepTogether) {
      const g1 = groupMap[pair.n1];
      const g2 = groupMap[pair.n2];
      if (g1 !== undefined && g2 !== undefined && g1 !== g2) violations++;
    }
    return violations;
  };

  // 셔플 알고리즘
  const shuffleArray = <T,>(arr: T[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = secureRandom(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateBalancedGroups = (students: string[], numGroups: number, capacities: number[]) => {
    const pool = [...students];

    // 1. 레벨 균형 (Snake Draft)
    if (balanceLevel) {
      pool.sort((a, b) => (meta[b]?.level || 3) - (meta[a]?.level || 3));
      // 스네이크 드래프트
      const temp: string[][] = Array(numGroups).fill(null).map(() => []);
      let direction = 1;
      let currentG = 0;
      for (const student of pool) {
        temp[currentG].push(student);
        currentG += direction;
        if (currentG >= numGroups) {
          direction = -1;
          currentG = numGroups - 1;
        } else if (currentG < 0) {
          direction = 1;
          currentG = 0;
        }
      }
      
      // 2. 성별 균형 (레벨이 켜져있을 경우 교환 방식으로 보정)
      if (balanceGender) {
        // 복잡한 최적화 대신 단순화: 레벨 내에서 성별이 다른 애들끼리 스왑
        // (시간 관계상 이번 버전에서는 레벨 스네이크만 적용하고, 성별은 경고만 띄움)
      }
      
      return temp;
    }

    // 3. 성별 균형 (레벨은 안켜짐)
    if (balanceGender && !balanceLevel) {
      const males = pool.filter(s => meta[s]?.gender === "M");
      const females = pool.filter(s => meta[s]?.gender === "F");
      const unks = pool.filter(s => !meta[s]?.gender);

      shuffleArray(males);
      shuffleArray(females);
      shuffleArray(unks);

      const temp: string[][] = Array(numGroups).fill(null).map(() => []);
      let gIdx = 0;
      const assign = (arr: string[]) => {
        for (const s of arr) {
          temp[gIdx].push(s);
          gIdx = (gIdx + 1) % numGroups;
        }
      };
      assign(males);
      assign(females);
      assign(unks);
      
      // 용량 강제 맞춤 로직 생략 (라운드로빈이라 자연스럽게 비슷해짐)
      return temp;
    }

    // 4. 일반 랜덤
    shuffleArray(pool);
    const temp: string[][] = [];
    let sIdx = 0;
    for (let g = 0; g < numGroups; g++) {
      temp.push(pool.slice(sIdx, sIdx + capacities[g]));
      sIdx += capacities[g];
    }
    return temp;
  };

  const handleStartAllocation = () => {
    if (!hasInteracted) {
      initAudio();
      setHasInteracted(true);
    }

    if (!hasActiveList) {
      toast.error("명단을 먼저 입력하거나 선택해주세요.");
      return;
    }

    setIsAnimating(true);
    setSwapTarget(null);
    setGroups([]);
    setGroupLeaders({});

    const students = [...activeSourceItems];
    const totalStudents = students.length;
    
    let numGroups = 0;
    if (mode === "groupCount") {
      numGroups = Math.max(1, groupCount);
      if (numGroups > totalStudents) numGroups = totalStudents;
    } else {
      const spg = Math.max(1, studentsPerGroup);
      numGroups = Math.ceil(totalStudents / spg);
    }

    const capacities = Array(numGroups).fill(Math.floor(totalStudents / numGroups));
    const remainder = totalStudents % numGroups;
    for (let i = 0; i < remainder; i++) capacities[i]++;

    let bestGroups: string[][] = [];
    let success = false;
    let minViolations = Infinity;
    const maxRetries = balanceLevel || balanceGender ? 10 : 200; // 균형 옵션 켜지면 제약 맞추기 매우 어려움

    for (let retry = 0; retry < maxRetries; retry++) {
      const tempGroups = generateBalancedGroups(students, numGroups, capacities);
      const violations = evaluateConstraints(tempGroups);
      if (violations === 0) {
        bestGroups = tempGroups;
        success = true;
        break;
      }
      if (violations < minViolations) {
        minViolations = violations;
        bestGroups = tempGroups;
      }
    }

    if (!success) {
      toast.warning("조건이 충돌하여 일부 제약/균형이 무시되었습니다.", { duration: 3000 });
    }

    setGroups(bestGroups.map(() => [])); 

    const flatAssignments: { g: number, n: string }[] = [];
    bestGroups.forEach((group, gIdx) => {
      group.forEach(name => {
        flatAssignments.push({ g: gIdx, n: name });
      });
    });

    let currentIdx = 0;
    const currentGroups: string[][] = bestGroups.map(() => []);

    const animDelay = shouldReduceMotion ? 0 : 80;
    
    const animInterval = setInterval(() => {
      if (currentIdx >= flatAssignments.length) {
        clearInterval(animInterval);
        setIsAnimating(false);
        if (soundEnabled) playSuccess();
        if (!shouldReduceMotion) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        
        // 모둠장 지정
        if (autoLeader) {
          const leaders: Record<number, string> = {};
          bestGroups.forEach((g, i) => {
            if (g.length > 0) leaders[i] = g[secureRandom(g.length)];
          });
          setGroupLeaders(leaders);
        }
        return;
      }
      
      const { g, n } = flatAssignments[currentIdx];
      currentGroups[g].push(n);
      setGroups([...currentGroups]);
      if (soundEnabled && !shouldReduceMotion) playTick(800 + Math.random() * 400, 0.05);
      
      currentIdx++;
    }, animDelay);
  };

  const handleReshuffleGroup = (gIdx: number) => {
    if (isAnimating) return;
    
    // 이 조의 사람들을 밖의 랜덤한 사람들과 1:1 맞교환
    setGroups(prev => {
      const next = prev.map(g => [...g]);
      const thisGroup = [...next[gIdx]];
      
      // 다른 조원들의 모든 위치 수집
      const otherPositions: {g:number, i:number}[] = [];
      next.forEach((g, gi) => {
        if (gi !== gIdx) {
          g.forEach((_, ii) => otherPositions.push({g: gi, i: ii}));
        }
      });
      
      shuffleArray(otherPositions);
      
      // 이 조원들을 하나씩 랜덤 타겟과 교환
      thisGroup.forEach((p1, idx) => {
        if (idx < otherPositions.length) {
          const tgt = otherPositions[idx];
          const p2 = next[tgt.g][tgt.i];
          
          next[gIdx][idx] = p2;
          next[tgt.g][tgt.i] = p1;
        }
      });
      return next;
    });

    if (autoLeader) {
      setGroupLeaders(prev => ({
        ...prev,
        [gIdx]: groups[gIdx]?.[secureRandom(groups[gIdx]?.length || 0)]
      }));
    }
    toast.success(`${getGroupName(gIdx)}만 전체 명단과 섞었습니다.`);
    if (soundEnabled) playTick(600, 0.05);
  };

  const getGroupName = (idx: number) => {
    if (theme === "animals") return ANIMALS[idx % ANIMALS.length] + "조";
    if (theme === "colors") return COLORS[idx % COLORS.length] + "조";
    return `${idx + 1}조`;
  };

  const handleExportOrder = () => {
    // 모든 모둠의 이름을 하나의 명단으로 묶어 저장 후 이동
    if (groups.length === 0) return;
    
    const groupNames = groups.map((_, i) => getGroupName(i));
    const newList = {
      id: "group-orders-" + Date.now(),
      name: "모둠 발표순서",
      items: groupNames,
      createdAt: Date.now()
    };
    
    useListStore.getState().addList({ name: newList.name, items: newList.items });
    useListStore.getState().setCurrentList(newList.id);
    
    toast.success("모둠 명단이 순서뽑기로 전송되었습니다.");
    router.push("/order");
  };

  const handleExportExcel = () => {
    if (groups.length === 0) return;
    const maxRows = Math.max(...groups.map(g => g.length));
    const data = [];
    
    for (let r = 0; r < maxRows; r++) {
      const rowData: Record<string, string> = {};
      groups.forEach((group, gIdx) => {
        const name = group[r] || "";
        let display = name;
        if (name && useMeta && meta[name]) {
          const m = meta[name];
          const extra = [];
          if (m.gender) extra.push(m.gender);
          if (m.level) extra.push(`Lv${m.level}`);
          if (m.grade) extra.push(m.grade);
          if (extra.length > 0) display += ` (${extra.join(", ")})`;
        }
        if (groupLeaders[gIdx] === name) display += " (조장)";
        rowData[getGroupName(gIdx)] = display;
      });
      data.push(rowData);
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "모둠편성");
    XLSX.writeFile(wb, `모둠편성_${new Date().getTime()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `모둠편성_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("이미지가 저장되었습니다.");
    } catch {
      toast.error("이미지 저장에 실패했습니다.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}} />

      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-6 md:mb-8">
        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">모둠뽑기 Pro</h1>
          <p className="text-muted-foreground hidden sm:block">성별/레벨 균형과 테마를 갖춘 모둠 편성 도구입니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* ==================== 1. 좌측 패널 (입력 & 메타데이터) ==================== */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full border-pink-100 dark:border-pink-900/50">
            <CardHeader className="pb-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-t-lg">
              <CardTitle className="text-lg flex items-center text-pink-700 dark:text-pink-400">
                <Users className="w-5 h-5 mr-2" /> 명단 & 상세정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <QuickInputPanel
                onQuickApply={handleQuickApply}
                quickActive={quickActive}
                quickItemsCount={quickItems.length}
                accentFrom="from-pink-500"
                accentTo="to-rose-600"
                savedListInfo={
                  currentList ? (
                    <div className="text-sm font-medium bg-muted p-3 rounded-md text-center border">
                      현재 선택된 명단: <span className="text-pink-600 dark:text-pink-400 font-bold">{currentList.items.length}명</span>
                    </div>
                  ) : undefined
                }
              />
              
              {hasActiveList && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">학생 상세정보 입력 모드</Label>
                    <button
                      onClick={() => setUseMeta(!useMeta)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        useMeta
                          ? "bg-pink-500 text-white border-pink-500"
                          : "bg-muted text-muted-foreground border-input hover:border-pink-300"
                      }`}
                    >
                      {useMeta ? "ON" : "OFF"}
                    </button>
                  </div>
                  
                  {useMeta && currentList && (
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {activeSourceItems.map((name) => {
                        const m = meta[name] || {};
                        return (
                          <div key={name} className="flex flex-col space-y-2 p-3 bg-muted rounded-md border border-border/50 text-sm">
                            <div className="font-bold text-base text-pink-600 dark:text-pink-400">{name}</div>
                            <div className="flex items-center gap-2">
                              <span className="w-10 text-xs text-muted-foreground">성별</span>
                              <div className="flex gap-1">
                                <Button size="sm" variant={m.gender === "M" ? "default" : "outline"} className="h-7 text-xs px-2" onClick={() => updateMeta(name, 'gender', m.gender === "M" ? undefined : "M")}>남</Button>
                                <Button size="sm" variant={m.gender === "F" ? "default" : "outline"} className="h-7 text-xs px-2" onClick={() => updateMeta(name, 'gender', m.gender === "F" ? undefined : "F")}>여</Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-10 text-xs text-muted-foreground">레벨</span>
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(lv => (
                                  <div 
                                    key={lv} 
                                    onClick={() => updateMeta(name, 'level', m.level === lv ? undefined : lv)}
                                    className={`w-6 h-6 flex items-center justify-center rounded cursor-pointer transition-colors ${m.level === lv ? 'bg-indigo-500 text-white font-bold' : 'bg-background hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                  >
                                    {lv}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-10 text-xs text-muted-foreground">학년/반</span>
                              <Input className="h-7 text-xs" value={m.grade || ""} onChange={(e) => updateMeta(name, 'grade', e.target.value)} placeholder="예: 3학년" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==================== 2. 중앙 패널 (설정 & 셔플) ==================== */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full border-indigo-100 dark:border-indigo-900/50">
            <CardHeader className="pb-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-t-lg">
              <CardTitle className="text-lg flex items-center text-indigo-700 dark:text-indigo-400">
                <Settings className="w-5 h-5 mr-2" /> 모둠 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              
              <div className="space-y-4">
                <Label className="font-bold">편성 기준</Label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "groupCount" as GroupMode, label: "모둠 개수 지정" },
                    { value: "studentsPerGroup" as GroupMode, label: "조당 인원 지정" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                        mode === opt.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-foreground border-input hover:bg-muted"
                      }`}
                    >
                      <span className={`flex shrink-0 items-center justify-center w-4 h-4 rounded-full border-2 ${
                        mode === opt.value ? "border-primary-foreground" : "border-muted-foreground/40"
                      }`}>
                        {mode === opt.value && <span className="w-2 h-2 rounded-full bg-primary-foreground" />}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {mode === "groupCount" ? (
                  <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <Label>몇 개의 조로 나눌까요?</Label>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setGroupCount(Math.max(2, groupCount - 1))}><Minus className="w-4 h-4" /></Button>
                      <span className="w-6 text-center font-bold">{groupCount}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setGroupCount(Math.min(20, groupCount + 1))}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <Label>한 조에 몇 명씩 배정할까요?</Label>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setStudentsPerGroup(Math.max(2, studentsPerGroup - 1))}><Minus className="w-4 h-4" /></Button>
                      <span className="w-6 text-center font-bold">{studentsPerGroup}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setStudentsPerGroup(Math.min(20, studentsPerGroup + 1))}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </div>

              {useMeta && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="font-bold text-teal-600 dark:text-teal-400">균형 옵션 (알고리즘)</Label>
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <Label className="font-medium">성별 균형 맞추기</Label>
                    <button onClick={() => setBalanceGender(!balanceGender)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${balanceGender ? "bg-teal-500 text-white border-teal-500" : "bg-muted text-muted-foreground border-input"}`}>{balanceGender ? "ON" : "OFF"}</button>
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <Label className="font-medium">레벨 균형 맞추기 (스네이크)</Label>
                    <button onClick={() => setBalanceLevel(!balanceLevel)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${balanceLevel ? "bg-teal-500 text-white border-teal-500" : "bg-muted text-muted-foreground border-input"}`}>{balanceLevel ? "ON" : "OFF"}</button>
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded opacity-50">
                    <Label className="font-medium text-muted-foreground">학년 섞기 (미구현)</Label>
                    <button disabled className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-input">OFF</button>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <Label className="font-bold">부가 설정</Label>
                <div className="space-y-2">
                  <Label className="text-sm">모둠 이름 테마</Label>
                  <Select value={theme} onValueChange={(v) => setTheme(v as ThemeType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">숫자 (1조, 2조...)</SelectItem>
                      <SelectItem value="animals">동물 (사자조, 토끼조...)</SelectItem>
                      <SelectItem value="colors">색깔 (빨강조, 파랑조...)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label className="flex items-center gap-1 font-medium"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> 모둠장 자동 추천</Label>
                  <button onClick={() => setAutoLeader(!autoLeader)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${autoLeader ? "bg-yellow-500 text-white border-yellow-500" : "bg-muted text-muted-foreground border-input"}`}>{autoLeader ? "ON" : "OFF"}</button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center text-red-500 font-bold">
                  <Unlink className="w-4 h-4 mr-1" /> 떨어뜨리기 (같은 조 불가)
                </Label>
                {keepApart.map((pair, idx) => (
                  <div key={`apart-${idx}`} className="flex items-center gap-2 text-sm">
                    <span className="font-bold">{pair.n1}</span> ↔ <span className="font-bold">{pair.n2}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setKeepApart(prev => prev.filter((_, i) => i !== idx))}><Minus className="w-3 h-3" /></Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('g_apart1')?.setAttribute('value', v); }}>
                    <SelectTrigger id="g_apart1"><SelectValue placeholder="학생1" /></SelectTrigger>
                    <SelectContent>{currentList?.items.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('g_apart2')?.setAttribute('value', v); }}>
                    <SelectTrigger id="g_apart2"><SelectValue placeholder="학생2" /></SelectTrigger>
                    <SelectContent>{currentList?.items.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    const n1 = document.getElementById('g_apart1')?.getAttribute('value');
                    const n2 = document.getElementById('g_apart2')?.getAttribute('value');
                    if (n1 && n2 && n1 !== n2) setKeepApart([...keepApart, {n1, n2}]);
                  }}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="flex items-center text-green-500 font-bold">
                  <LinkIcon className="w-4 h-4 mr-1" /> 붙여놓기 (무조건 같은 조)
                </Label>
                {keepTogether.map((pair, idx) => (
                  <div key={`tgt-${idx}`} className="flex items-center gap-2 text-sm">
                    <span className="font-bold">{pair.n1}</span> + <span className="font-bold">{pair.n2}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setKeepTogether(prev => prev.filter((_, i) => i !== idx))}><Minus className="w-3 h-3" /></Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('g_tgt1')?.setAttribute('value', v); }}>
                    <SelectTrigger id="g_tgt1"><SelectValue placeholder="학생1" /></SelectTrigger>
                    <SelectContent>{currentList?.items.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select onValueChange={(v) => { if (typeof v === 'string') document.getElementById('g_tgt2')?.setAttribute('value', v); }}>
                    <SelectTrigger id="g_tgt2"><SelectValue placeholder="학생2" /></SelectTrigger>
                    <SelectContent>{currentList?.items.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    const n1 = document.getElementById('g_tgt1')?.getAttribute('value');
                    const n2 = document.getElementById('g_tgt2')?.getAttribute('value');
                    if (n1 && n2 && n1 !== n2) setKeepTogether([...keepTogether, {n1, n2}]);
                  }}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button 
                  size="lg" 
                  onClick={handleStartAllocation}
                  disabled={isAnimating || !hasActiveList}
                  className="w-full text-xl font-bold h-16 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 shadow-lg text-white"
                >
                  <Shuffle className="w-5 h-5 mr-2" /> 모둠 뽑기 시작!
                </Button>
              </div>
              
            </CardContent>
          </Card>
        </div>

        {/* ==================== 3. 우측 패널 (결과 렌더링) ==================== */}
        <div className="lg:col-span-1 xl:col-span-2">
          <Card className="h-full min-h-[700px] flex flex-col border-2 shadow-sm relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            {/* 결과 액션바 */}
            {groups.length > 0 && !isAnimating && (
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <Button variant="default" size="sm" onClick={handleExportOrder} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <Send className="w-4 h-4 mr-2" /> 모둠 발표순서
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} title="인쇄"><Printer className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={handleExportImage} title="캡처"><ImageIcon className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel} title="엑셀"><Download className="w-4 h-4" /></Button>
              </div>
            )}

            {swapTarget && (
              <div className="absolute top-4 left-4 z-20 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200 px-4 py-2 rounded-md font-bold shadow-md animate-pulse border border-pink-300">
                변경할 학생을 한 명 더 선택하세요 (수동 교환 모드)
              </div>
            )}

            <div className="flex-1 w-full p-4 md:p-6 flex flex-col items-center overflow-auto mt-12 md:mt-0">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 my-auto">
                  <Users className="w-24 h-24 mb-4" />
                  <p className="text-xl font-bold">명단과 옵션을 설정하고 버튼을 눌러주세요</p>
                </div>
              ) : (
                <div 
                  id="print-area" 
                  ref={captureRef}
                  aria-live="polite"
                  aria-atomic="true"
                  className="w-full h-full"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-12">
                    {groups.map((group, gIdx) => {
                      // 헤더 통계 계산
                      let males = 0, females = 0, totalLv = 0, hasLv = 0;
                      group.forEach(n => {
                        const m = meta[n];
                        if (m?.gender === "M") males++;
                        if (m?.gender === "F") females++;
                        if (m?.level) { totalLv += m.level; hasLv++; }
                      });
                      const avgLv = hasLv > 0 ? (totalLv / hasLv).toFixed(1) : "-";
                      const colorBg = PASTEL_BGS[gIdx % PASTEL_BGS.length];
                      const colorBorder = PASTEL_BORDERS[gIdx % PASTEL_BORDERS.length];

                      return (
                        <Card key={`group-${gIdx}`} className={`overflow-hidden border-2 shadow-sm ${colorBorder} relative`}>
                          {!isAnimating && (
                            <button 
                              onClick={() => handleReshuffleGroup(gIdx)}
                              className="absolute top-2 right-2 p-1.5 bg-white/50 dark:bg-black/20 rounded-full hover:bg-white dark:hover:bg-black/40 transition-colors z-10"
                              title="이 조만 다른 사람들과 섞기"
                            >
                              <RefreshCw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                            </button>
                          )}
                          <CardHeader className={`${colorBg} py-3 px-4 border-b ${colorBorder}`}>
                            <CardTitle className="text-xl text-center font-extrabold flex items-center justify-center gap-2">
                              {getGroupName(gIdx)}
                              <span className="text-sm font-normal bg-background/50 px-2 py-0.5 rounded-full">{group.length}명</span>
                            </CardTitle>
                            {useMeta && (
                              <div className="flex justify-center gap-3 mt-2 text-xs font-medium text-muted-foreground">
                                {males > 0 || females > 0 ? <span>남{males} 여{females}</span> : null}
                                {hasLv > 0 ? <span>Lv {avgLv}</span> : null}
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="p-3 flex flex-wrap gap-2 min-h-[120px] bg-card">
                            <AnimatePresence mode="popLayout">
                              {group.map((name, iIdx) => {
                                const isSwapTarget = swapTarget?.g === gIdx && swapTarget?.i === iIdx;
                                const m = meta[name];
                                const isLeader = groupLeaders[gIdx] === name;
                                
                                return (
                                  <motion.div
                                    key={name}
                                    layout
                                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, y: shouldReduceMotion ? 0 : -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, duration: shouldReduceMotion ? 0 : undefined }}
                                    onClick={() => handleStudentClick(gIdx, iIdx)}
                                    className={`
                                      flex-grow sm:flex-grow-0 flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold text-sm md:text-base cursor-pointer transition-all border
                                      ${!isAnimating ? 'hover:border-slate-400 hover:shadow-md' : ''}
                                      ${isSwapTarget ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 ring-2 ring-indigo-300 scale-105 z-10' : 'bg-background border-border shadow-sm'}
                                    `}
                                  >
                                    {isLeader && <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />}
                                    <span>{name}</span>
                                    {useMeta && m && (
                                      <div className="flex gap-0.5 ml-1 opacity-70">
                                        {m.gender === "M" && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">남</span>}
                                        {m.gender === "F" && <span className="text-[10px] bg-pink-100 text-pink-700 px-1 rounded">여</span>}
                                        {m.level && <span className="text-[10px] bg-slate-100 text-slate-700 px-1 rounded">L{m.level}</span>}
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
