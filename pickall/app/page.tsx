"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, ListOrdered, UserRound, Users, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "랜덤뽑기",
    description: "이름·항목을 무작위로 뽑아요",
    icon: <Dices className="w-10 h-10 text-emerald-500" />,
    href: "/random",
    color: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    title: "순서뽑기",
    description: "발표·차례 순서를 정해요",
    icon: <ListOrdered className="w-10 h-10 text-indigo-500" />,
    href: "/order",
    color: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    title: "자리뽑기",
    description: "교실 자리를 배치해요",
    icon: <UserRound className="w-10 h-10 text-amber-500" />,
    href: "/seats",
    color: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    title: "모둠뽑기",
    description: "조를 편성해요",
    icon: <Users className="w-10 h-10 text-rose-500" />,
    href: "/groups",
    color: "bg-rose-50 dark:bg-rose-950/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 },
  },
};

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pickall_onboarding_done") !== "true") {
      // hydration 이후 표시
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  const closeOnboarding = () => {
    localStorage.setItem("pickall_onboarding_done", "true");
    setShowOnboarding(false);
  };

  return (
    <div className="flex flex-col items-center pt-8 md:pt-12 space-y-12 relative">
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute top-32 z-50 bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl max-w-[300px] text-center"
          >
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 text-primary-foreground/80 hover:text-white" onClick={closeOnboarding}>
              <X className="w-4 h-4" />
            </Button>
            <h3 className="font-bold text-lg mb-2">👋 환영합니다!</h3>
            <p className="text-sm opacity-90 mb-3">먼저 랜덤뽑기에 들어가서 명단을 생성해보세요. 만들어진 명단은 다른 메뉴에서도 사용할 수 있습니다.</p>
            <Button variant="secondary" size="sm" onClick={closeOnboarding} className="w-full">확인했어요</Button>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <motion.div 
        className="text-center space-y-4 flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Image
          src="/willgrow-logo.png"
          alt="윌그로우 로고"
          width={120}
          height={120}
          className="rounded-2xl shadow-md mb-2"
          priority
        />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">모두의 뽑기</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] px-4">
          수업 시간에 필요한 모든 뽑기 도구를 한 곳에서 만나보세요.
        </p>
      </motion.div>

      {/* Grid Area */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl px-4 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link href={feature.href} className="block h-full">
              <Card className={`h-full border-2 hover:border-primary/50 transition-colors cursor-pointer shadow-md hover:shadow-lg ${feature.color} border-transparent`}>
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <div className="p-3 bg-background rounded-2xl shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mt-2 font-medium">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Lists Placeholder */}
      <motion.div 
        className="w-full max-w-4xl px-4 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">최근 사용한 명단</h2>
        </div>
        <div className="bg-muted/50 rounded-xl p-8 border border-dashed border-muted-foreground/30 text-center text-muted-foreground">
          아직 저장된 명단이 없습니다. 각 메뉴에서 명단을 생성해 보세요!
        </div>
      </motion.div>
    </div>
  );
}
