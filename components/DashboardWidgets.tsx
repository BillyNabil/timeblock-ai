"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Timer, Flame, CheckCircle2 } from "lucide-react";

// --- STREAK WIDGET ---
export function StreakFlame({ streak }: { streak: number }) {
    return (
        <div className="flex items-center gap-0.5 sm:gap-1 bg-orange-100 border-2 sm:border-[3px] border-black px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform cursor-help" title={`${streak} Day Streak!`}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [-5, 5, -5],
                    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
            >
                <Flame className={`w-3 h-3 sm:w-5 sm:h-5 ${streak > 0 ? "fill-orange-500 text-orange-600" : "text-gray-400"}`} />
            </motion.div>
            <span className="font-black text-black text-[10px] sm:text-sm">{streak}</span>
        </div>
    );
}

// --- DAILY DONUT CHART ---
export function DailyDonut({ total, completed }: { total: number, completed: number }) {
    const data = [
        { name: 'Completed', value: completed },
        { name: 'Remaining', value: total - completed }
    ];
    const COLORS = ['#ec4899', '#ffffff']; // Pink-500 & White

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex items-center justify-center p-2 shrink-0"
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-black leading-none">{percentage}%</span>
                <span className="text-[10px] font-bold text-black/50 uppercase">Done</span>
            </div>

            {/* The Chart */}
            <div className="w-32 h-32">
                <PieChart width={128} height={128}>
                    <Pie
                        data={data}
                        cx={64}
                        cy={64}
                        innerRadius={36}
                        outerRadius={52}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="black"
                        strokeWidth={3}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </div>
        </motion.div>
    );
}

// --- COUNTDOWN TIMER ---
export function CountdownToFreedom() {
    const [timeLeft, setTimeLeft] = useState("");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(17, 0, 0, 0); // 5:00 PM

            // If it's past 5 PM, maybe set to tomorrow or just show "Freedom!"
            if (now > endOfDay) {
                setTimeLeft("FREEDOM!");
                setProgress(100);
                return;
            }

            const diffMs = endOfDay.getTime() - now.getTime();
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

            // Calc percentage passed (Assuming 9 AM start)
            const startOfDay = new Date();
            startOfDay.setHours(9, 0, 0, 0);
            const totalWorkDay = endOfDay.getTime() - startOfDay.getTime();
            const elapsed = now.getTime() - startOfDay.getTime();
            const pct = Math.min(100, Math.max(0, (elapsed / totalWorkDay) * 100));

            setTimeLeft(`${diffHrs}h ${diffMins}m`);
            setProgress(pct);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); // Update every min
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="bg-cyan-200 border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black rounded-lg sm:rounded-xl overflow-hidden relative">
            {/* Progress Bar Background */}
            <div className="absolute top-0 left-0 h-full bg-cyan-300 transition-all duration-1000" style={{ width: `${progress}%`, opacity: 0.5 }} />

            <CardContent className="p-2 sm:p-4 relative z-10 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-[10px] sm:text-xs uppercase opacity-70 flex items-center gap-1"><Timer size={10} className="sm:hidden" /><Timer size={12} className="hidden sm:inline" /> Freedom In</h3>
                    <div className="text-lg sm:text-2xl font-black tracking-tighter">{timeLeft}</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 sm:border-[3px] border-black rounded-full flex items-center justify-center animate-pulse">
                    <Zap className="fill-yellow-400 text-black w-4 h-4 sm:w-6 sm:h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

export function DailyProgressWidget({ tasks }: { tasks: any[] }) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done' || t.finished_at).length;

    return (
        <Card className="bg-white border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg sm:rounded-xl overflow-hidden h-full">
            <CardHeader className="pb-0 pt-2 sm:pt-4 px-3 sm:px-4 bg-pink-200 border-b-2 sm:border-b-[3px] border-black">
                <CardTitle className="text-sm sm:text-lg text-black font-black uppercase flex items-center gap-1 sm:gap-2">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Daily Grind
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 flex flex-col items-center">
                <DailyDonut total={total} completed={completed} />
                <p className="text-[10px] sm:text-xs font-bold text-center mt-1 sm:mt-2 max-w-[150px]">
                    {completed === total && total > 0 ? "You're a machine! 🤖" : "Keep crushing it!"}
                </p>
            </CardContent>
        </Card>
    );
}
