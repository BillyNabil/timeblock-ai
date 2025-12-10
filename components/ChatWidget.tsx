"use client";

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, MessageCircle, Bot } from "lucide-react";
import { generateChatResponse } from "@/lib/ai";

interface Props {
    schedule: Task[];
    backlog: Task[];
    onUpdate: (schedule: Task[], backlog: Task[]) => void;
}

export function ChatWidget({ schedule, backlog, onUpdate }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Hey! I'm your Time Buddy. Getting off track? Tell me about it!" }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const currentTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta', hour12: false });

            const data = await generateChatResponse(userMsg, schedule, backlog, currentTime);

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
            }

            if (data.schedule && data.backlog) {
                onUpdate(data.schedule, data.backlog);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Oops, my brain froze! Try again?" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="pointer-events-auto"
                    >
                        <Card className="w-96 mb-6 h-[500px] flex flex-col overflow-hidden shadow-2xl border-4 border-white/50 bg-white/95 backdrop-blur-md dark:bg-slate-900/95">
                            {/* Header */}
                            <CardHeader className="bg-primary/90 p-4 border-b border-primary/20 flex flex-row justify-between items-center space-y-0">
                                <div className="flex items-center gap-3 text-primary-foreground">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/30 text-white">
                                        <Bot size={24} />
                                    </div>
                                    <CardTitle className="tracking-wide text-white drop-shadow-sm font-black text-xl">Time Buddy</CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-primary-foreground hover:bg-white/20 hover:text-white rounded-full h-8 w-8"
                                >
                                    <X size={20} />
                                </Button>
                            </CardHeader>

                            {/* Chat Area */}
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20" ref={scrollRef}>
                                {messages.map((m, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`
                                            max-w-[85%] p-3 text-sm font-bold shadow-sm relative
                                            ${m.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                                                : 'bg-card text-card-foreground border-2 border-muted rounded-2xl rounded-tl-sm'
                                            }
                                        `}>
                                            {m.text}
                                        </div>
                                    </motion.div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-card p-3 rounded-xl rounded-bl-none text-xs font-bold animate-pulse text-muted-foreground border-2 border-muted">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            {/* Input Area */}
                            <div className="p-4 bg-card border-t border-border">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <Input
                                        className="flex-1"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type here..."
                                    />
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        size="icon"
                                        className="shadow-lg hover:-translate-y-0.5 transition-transform"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-3xl pointer-events-auto transition-colors duration-300
                    shadow-xl border-4 border-white z-50
                    ${isOpen ? 'bg-destructive text-destructive-foreground rotate-90' : 'bg-primary text-primary-foreground'}
                `}
            >
                {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
            </motion.button>
        </div>
    );
}
