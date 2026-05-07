"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useListStore } from "@/lib/store/useListStore";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export function NameListInput() {
  const [listName, setListName] = useState("");
  const [rawText, setRawText] = useState("");
  const [startNum, setStartNum] = useState("");
  const [endNum, setEndNum] = useState("");
  const addList = useListStore((state) => state.addList);

  const handleSaveText = () => {
    if (!listName.trim()) {
      toast.error("명단 이름을 입력해주세요.");
      return;
    }
    const items = rawText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
      
    if (items.length === 0) {
      toast.error("명단에 포함될 항목을 입력해주세요.");
      return;
    }

    addList({ name: listName, items });
    toast.success(`"${listName}" 명단이 저장되었습니다. (총 ${items.length}명)`);
    setListName("");
    setRawText("");
  };

  const handleSaveRange = () => {
    if (!listName.trim()) {
      toast.error("명단 이름을 입력해주세요.");
      return;
    }
    const start = parseInt(startNum);
    const end = parseInt(endNum);
    
    if (isNaN(start) || isNaN(end) || start > end) {
      toast.error("올바른 숫자 범위를 입력해주세요.");
      return;
    }

    const items = Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
    addList({ name: listName, items });
    toast.success(`"${listName}" 명단이 저장되었습니다. (${start}~${end}번)`);
    setListName("");
    setStartNum("");
    setEndNum("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!listName.trim()) {
      toast.error("명단 이름을 먼저 입력해주세요.");
      e.target.value = ""; // reset
      return;
    }

    const validExts = [".xlsx", ".xls", ".csv"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(fileExt)) {
      toast.error(`지원하지 않는 파일 형식입니다. (${fileExt})\n.xlsx, .xls, .csv 파일만 가능합니다.`);
      e.target.value = ""; // reset
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          toast.error("엑셀 파일에 시트가 존재하지 않습니다.");
          return;
        }
        
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // 첫 번째 열만 가져오기 (A열)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        if (!data || data.length === 0) {
          toast.error("빈 파일이거나 데이터를 읽을 수 없습니다.");
          return;
        }

        const items = data.map((row) => String(row[0] || "")).filter((val) => val.trim() !== "");
        
        if (items.length === 0) {
          toast.error("파일에서 항목을 찾을 수 없습니다. 첫 번째 열(A열)에 데이터를 입력해주세요.");
          return;
        }

        addList({ name: listName, items });
        toast.success(`"${listName}" 명단이 엑셀에서 저장되었습니다. (총 ${items.length}명)`);
        setListName("");
      } catch (error) {
        console.error("Excel Parsing Error:", error);
        toast.error("파일을 분석하는 데 실패했습니다. 파일이 암호화되어 있거나 손상되었을 수 있습니다.");
      }
    };
    reader.onerror = () => {
      toast.error("파일을 읽는 중 운영체제에서 문제가 발생했습니다.");
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; // reset
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>새 명단 추가</CardTitle>
        <CardDescription>학생 이름이나 항목을 추가하여 명단을 만듭니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">명단 이름</label>
          <Input 
            placeholder="예: 1학년 2반, 조별 과제 명단 등" 
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
          {/* 직접 입력 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-primary">1. 직접 입력 / 붙여넣기</h3>
            <p className="text-xs text-muted-foreground">줄바꿈이나 쉼표로 구분하세요.</p>
            <textarea 
              className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="홍길동&#13;&#10;김철수&#13;&#10;이영희"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <Button onClick={handleSaveText} className="w-full">저장하기</Button>
          </div>

          {/* 숫자 범위 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-primary">2. 번호로 자동 생성</h3>
            <p className="text-xs text-muted-foreground">시작과 끝 번호를 입력하세요.</p>
            <div className="flex items-center space-x-2">
              <Input type="number" placeholder="시작" value={startNum} onChange={e => setStartNum(e.target.value)} />
              <span>~</span>
              <Input type="number" placeholder="끝" value={endNum} onChange={e => setEndNum(e.target.value)} />
            </div>
            <div className="flex space-x-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => { setStartNum("1"); setEndNum("30"); }}
              >
                1~30번
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => { setStartNum("1"); setEndNum("50"); }}
              >
                1~50번
              </Button>
            </div>
            <Button onClick={handleSaveRange} className="w-full mt-2" variant="secondary">생성 및 저장</Button>
          </div>

          {/* 엑셀 업로드 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-primary">3. 엑셀/CSV 업로드</h3>
            <p className="text-xs text-muted-foreground">첫 번째 열(A열)을 명단으로 가져옵니다.</p>
            <div className="flex h-[120px] items-center justify-center rounded-md border border-dashed border-input p-4 text-center">
              <div>
                <Input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
