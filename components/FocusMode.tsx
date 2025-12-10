"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Play, Pause, CheckCircle, Music } from 'lucide-react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
    task: Task | null;
    onClose: () => void;
    onComplete: (task: Task) => void;
}

export function FocusMode({ task, onClose, onComplete }: Props) {
    const [timeLeft, setTimeLeft] = useState(task ? task.duration * 60 : 0);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (task) {
            setTimeLeft(task.duration * 60);
            setIsActive(true);
        }
    }, [task]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    if (!task) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = 1 - (timeLeft / (task.duration * 60));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-yellow-100 flex flex-col items-center justify-center p-4"
        >
            <div className="absolute top-6 right-6 flex gap-4">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-black/10 text-black border-[3px] border-transparent hover:border-black transition-all">
                    <Minimize2 size={32} strokeWidth={3} />
                </Button>
            </div>

            <div className="max-w-2xl w-full flex flex-col items-center gap-8 text-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-foreground">
                        {task.title}
                    </h2>
                    <div className="flex justify-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest ${task.color === 'blue' ? 'bg-cyan-300 text-black' :
                            task.color === 'pink' ? 'bg-pink-300 text-black' :
                                task.color === 'green' ? 'bg-lime-300 text-black' :
                                    task.color === 'purple' ? 'bg-purple-300 text-black' :
                                        task.color === 'yellow' ? 'bg-yellow-300 text-black' :
                                            'bg-white text-black'
                            }`}>
                            Focus Mode
                        </span>
                    </div>
                </motion.div>

                {/* Timer Circle */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="black"
                            strokeWidth="8"
                            className="opacity-20"
                        />
                        <motion.circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="black"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="drop-shadow-sm"
                            strokeDasharray="283"
                            strokeDashoffset={283 * (1 - progress)}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <div className="text-6xl md:text-8xl font-black tabular-nums tracking-tight text-black drop-shadow-sm">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Button
                        size="lg"
                        className="rounded-full w-20 h-20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl border-[3px] border-black bg-white text-black hover:bg-gray-100 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
                        onClick={() => setIsActive(!isActive)}
                    >
                        {isActive ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} />}
                    </Button>

                    <Button
                        size="lg"
                        className="rounded-full h-20 px-10 text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-400 hover:bg-green-300 text-black border-[3px] border-black active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase tracking-wide"
                        onClick={() => {
                            onComplete(task);
                            onClose();
                        }}
                    >
                        <CheckCircle className="mr-3" size={32} strokeWidth={3} />
                        Done!
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
