"use client";

import { useState, useEffect } from "react";
import { Settings, Download, Upload, HardDrive, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 5 * 1024 * 1024, percent: 0 });

  useEffect(() => {
    if (open) {
      calculateStorage();
    }
  }, [open]);

  const calculateStorage = () => {
    let _lsTotal = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("pickall")) {
        const value = localStorage.getItem(key) || "";
        _lsTotal += (key.length + value.length) * 2; // UTF-16 is 2 bytes per char
      }
    }
    const percent = Math.min(100, (_lsTotal / (5 * 1024 * 1024)) * 100);
    setStorageUsage({ used: _lsTotal, total: 5 * 1024 * 1024, percent });
  };

  const handleExportData = () => {
    try {
      const exportData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("pickall")) {
          exportData[key] = localStorage.getItem(key) || "";
        }
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `pickall_backup_${new Date().getTime()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("백업 파일이 다운로드되었습니다.");
    } catch {
      toast.error("데이터 내보내기에 실패했습니다.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const importedData = JSON.parse(result);
        
        let importedCount = 0;
        for (const key in importedData) {
          if (key.startsWith("pickall")) {
            localStorage.setItem(key, importedData[key]);
            importedCount++;
          }
        }
        
        if (importedCount > 0) {
          toast.success("데이터 복원이 완료되었습니다. 변경사항 적용을 위해 새로고침합니다.");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error("유효한 백업 데이터가 파일에 없습니다.");
        }
      } catch {
        toast.error("지원하지 않는 형식이거나 파일이 손상되었습니다.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" aria-label="설정 및 데이터 백업" onClick={() => setOpen(true)}>
        <Settings className="w-5 h-5 text-muted-foreground" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>데이터 관리</DialogTitle>
          <DialogDescription>
            모든 명단과 설정은 브라우저 내부에 저장됩니다. 다른 기기에서 사용하려면 데이터를 백업하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4 border p-4 rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-sm">저장소 사용량</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">사용 중</span>
                <span className="font-medium">{formatBytes(storageUsage.used)} / ~5 MB</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${storageUsage.percent > 80 ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${storageUsage.percent}%` }}
                />
              </div>
            </div>

            {storageUsage.percent > 80 && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>브라우저 저장 공간이 얼마 남지 않았습니다. 불필요한 명단을 삭제하거나 백업 후 비워주세요.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm">백업 및 복원</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleExportData} className="w-full flex items-center gap-2" variant="outline">
                <Download className="w-4 h-4" /> 내보내기 (JSON)
              </Button>
              <div className="relative">
                <Input 
                  type="file" 
                  accept=".json" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImportData}
                  aria-label="JSON 파일 가져오기"
                />
                <Button className="w-full flex items-center gap-2 pointer-events-none" variant="outline">
                  <Upload className="w-4 h-4" /> 가져오기
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              주의: 가져오기를 실행하면 현재 브라우저의 기존 명단과 설정이 덮어씌워질 수 있습니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
