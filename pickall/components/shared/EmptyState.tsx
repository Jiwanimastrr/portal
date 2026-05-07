"use client";

import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/30 rounded-xl border border-dashed border-border/60"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse"></div>
        <FolderOpen className="w-16 h-16 text-primary/50 relative z-10" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">저장된 명단이 없어요</h3>
        <p className="text-sm text-muted-foreground">아래에서 새로운 명단을 먼저 추가해주세요!</p>
      </div>
    </motion.div>
  );
}
