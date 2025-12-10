"use client";

import { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    DragStartEvent
} from '@dnd-kit/core';
import { supabase } from '@/lib/supabaseClient';
import { Task } from '@/types';
import { DraggableTask } from './DraggableTask';
import { DroppableSlot } from './DroppableSlot';
import { ChatWidget } from './ChatWidget';
import { LoginScreen } from './LoginScreen';
import { createPortal } from 'react-dom';
import { Session } from '@supabase/supabase-js';
import { AddTaskModal } from './AddTaskModal';
import { ProfileModal } from './ProfileModal';
import { FocusMode } from './FocusMode';
import { StatsModal } from './StatsModal';
import { ConfirmDialog } from './ConfirmDialog';
import { LandingPage } from './LandingPage';
import { StreakFlame, DailyDonut, CountdownToFreedom, DailyProgressWidget } from './DashboardWidgets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, User, LogOut, Sparkles, Inbox, Zap, BarChart2, CloudSun, Target } from "lucide-react";
import { playSound } from "@/lib/sounds";
import { generateAutoSchedule } from "@/lib/ai";

const HOURS = Array.from({ length: 15 }, (_, i) => {
    const h = i + 8; // 08:00 to 22:00
    return `${h.toString().padStart(2, '0')}:00`;
});

function BacklogArea({ tasks, onDelete, onEdit, onDone, onFocus }: { tasks: Task[], onDelete: (id: string) => void, onEdit: (task: Task) => void, onDone: (task: Task) => void, onFocus: (task: Task) => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'backlog-area',
    });

    return (
        <Card
            ref={setNodeRef}
            className={`
        flex-1 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-full flex flex-col overflow-hidden rounded-xl
        ${isOver ? 'bg-blue-100' : 'bg-cyan-200'}
      `}
        >
            <CardHeader className="pb-2 pt-4 px-4 shrink-0 bg-white border-b-[3px] border-black">
                <CardTitle className="text-lg flex items-center gap-2 text-black font-black uppercase">
                    <Inbox className="w-5 h-5 text-black" fill="currentColor" />
                    To Do List
                </CardTitle>
                <CardDescription className="text-xs font-bold text-black/70">Drag tasks to schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 overflow-y-auto flex-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {tasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            layoutId={task.id}
                            className="relative hover:z-50"
                        >
                            <DraggableTask task={task} onDelete={onDelete} onEdit={onEdit} onDone={onDone} onFocus={onFocus} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-black/50 font-bold italic mt-8 text-sm"
                    >
                        No tasks! Relax or add more.
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}

export default function TimeBlockingApp() {
    const [session, setSession] = useState<Session | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);

    const [backlog, setBacklog] = useState<Task[]>([]);
    const [schedule, setSchedule] = useState<Task[]>([]);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [focusTask, setFocusTask] = useState<Task | null>(null);
    const [showStats, setShowStats] = useState(false);

    // Gamification State
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(0);

    // Landing State
    const [showLogin, setShowLogin] = useState(false);

    // Weather State
    const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);

    // Load Gamification Profile
    useEffect(() => {
        if (!session) return;

        async function loadProfile() {
            const { data } = await supabase.from('profiles').select('xp, level, streak_count').eq('id', session!.user.id).single();
            if (data) {
                setXp(data.xp || 0);
                setLevel(data.level || 1);
                setStreak(data.streak_count || 0);
            } else {
                // Init profile if missing
                await supabase.from('profiles').insert({ id: session!.user.id, email: session!.user.email, xp: 0, level: 1, streak_count: 0 });
            }
        }
        loadProfile();
    }, [session]);

    // Load Weather
    useEffect(() => {
        // Simple fetch for generic location (London) or browser geo if we wanted
        // Using open-meteo for a quick "demo" location (e.g. New York) to avoid permission prompts for now, 
        // or just ask user. Let's use a fixed cool city for the aesthetic or random?
        // Let's try to get real location.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                    const data = await res.json();
                    if (data.current_weather) {
                        setWeather({ temp: data.current_weather.temperature, code: data.current_weather.weathercode });
                    }
                } catch (e) { console.error("Weather error", e); }
            });
        }
    }, []);

    const addXp = async (amount: number) => {
        const newXp = xp + amount;
        let newLevel = level;
        // Simple level curve: Level * 1000 XP needed
        const xpNeeded = level * 1000;

        if (newXp >= xpNeeded) {
            newLevel += 1;
            playSound('success'); // Double ding for level up!
            alert(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
        }

        setXp(newXp);
        setLevel(newLevel);

        if (session) {
            await supabase.from('profiles').update({ xp: newXp, level: newLevel }).eq('id', session.user.id);
        }
    };

    // Auth Handling
    useEffect(() => {
        // Check if user chose "keep logged in"
        const keepLoggedIn = localStorage.getItem('keepLoggedIn');
        const tempSession = sessionStorage.getItem('tempSession');
        
        // If user chose NOT to keep logged in and this is a new app session, sign out
        if (keepLoggedIn === 'false' && !tempSession) {
            supabase.auth.signOut();
            setCheckingSession(false);
            return;
        }
        
        // Set a timeout fallback in case Supabase is slow/unreachable
        const timeout = setTimeout(() => {
            setCheckingSession(false);
        }, 5000); // 5 second timeout
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(timeout);
            setSession(session);
            setCheckingSession(false);
        }).catch(() => {
            clearTimeout(timeout);
            setCheckingSession(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    // Data Fetching
    useEffect(() => {
        if (!session) return;

        async function loadTasks() {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .neq('status', 'done');

            if (error) {
                console.error("Error loading tasks:", error);
            }

            if (!data || data.length === 0) {
                // Fallback for demo if DB empty
                // Use valid UUIDs to prevent 400 errors if these get pushed back
                setBacklog([]);
                setSchedule([]);
            } else {
                // Map DB columns to Frontend Model
                const tasks: Task[] = data.map((d: any) => {
                    // Extract "HH:mm" from ISO string if present
                    let timeStr = null;
                    if (d.start_time) {
                        const date = new Date(d.start_time);
                        // Get HH:mm in local time
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        timeStr = `${hours}:${minutes}`;
                    }

                    return {
                        id: d.id,
                        title: d.title,
                        duration: d.duration_minutes || 30, // Map duration_minutes -> duration
                        status: d.status,
                        start_time: timeStr,
                        color: d.color
                    };
                });
                setBacklog(tasks.filter(t => !t.start_time));
                setSchedule(tasks.filter(t => t.start_time));
            }
        }

        loadTasks();
    }, [session]);

    // Notification Logic
    useEffect(() => {
        if (!("Notification" in window)) return;

        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const checkTime = () => {
            if (Notification.permission !== "granted") return;

            const now = new Date();
            const currentHHMM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            schedule.forEach(task => {
                if (!task.start_time) return;

                // Check Start Time
                if (task.start_time === currentHHMM) {
                    new Notification(`🚀 Starting: ${task.title}`, {
                        body: `Focus for ${task.duration} minutes!`,
                        icon: '/favicon.ico' // Optional
                    });
                }

                // Check End Time
                const [h, m] = task.start_time.split(':').map(Number);
                const endDate = new Date();
                endDate.setHours(h, m + task.duration);
                const endHHMM = endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                if (endHHMM === currentHHMM) {
                    new Notification(`🎉 Finished: ${task.title}`, {
                        body: `Great job! Take a break?`,
                        icon: '/favicon.ico'
                    });
                }
            });
        };

        // Check every minute (at 00 seconds)
        // To be precise and avoiding double, we can check every 30s and store last fired minute, 
        // or just rely on the fact that if we match exact string, it happens once per minute.
        // However, setInterval might drift. Safe to check every 10s and keep a ref of last fired time.

        let lastFiredTime = "";

        const interval = setInterval(() => {
            const now = new Date();
            const currentHHMM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            if (currentHHMM !== lastFiredTime) {
                checkTime();
                lastFiredTime = currentHHMM;
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [schedule]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [modalTime, setModalTime] = useState<string | null>(null);
    const [showSpotify, setShowSpotify] = useState(false);
    const [spotifyId, setSpotifyId] = useState("37i9dQZF1DXcBWIGoYBM5M"); // Default Playlist
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const handleDelete = async (id: string) => {
        triggerConfirm(
            'Nuke this task? 🗑️',
            'Are you sure? This action cannot be undone.',
            async () => {
                setBacklog(prev => prev.filter(t => t.id !== id));
                setSchedule(prev => prev.filter(t => t.id !== id));

                if (session) {
                    await supabase.from('tasks').delete().eq('id', id);
                }
            }
        );
    };

    const handleDoneTask = async (task: Task) => {
        // Confetti! 🎉
        import('canvas-confetti').then((confetti) => {
            confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        });

        // Play sound if we have one (maybe later)

        // For now, let's just delete it from view but maybe we want a Done list?
        // User asked for "Done Button", assuming it marks as completed. 
        // Let's update status to 'done' and remove from active views.
        const updatedTask = { ...task, status: 'done' };

        setBacklog(prev => prev.filter(t => t.id !== task.id));
        setSchedule(prev => prev.filter(t => t.id !== task.id));

        if (session) {
            await supabase.from('tasks').update({ status: 'done' }).eq('id', task.id);
        }

        playSound('success');
        addXp(50); // +50 XP for completing a task
    };

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{ title: string; description: string; action: () => void } | null>(null);

    const triggerConfirm = (title: string, description: string, action: () => void) => {
        setConfirmConfig({ title, description, action });
        setConfirmOpen(true);
    };

    const handleConfirmAction = () => {
        if (confirmConfig) {
            confirmConfig.action();
        }
        setConfirmOpen(false);
    };

    const handleUpdateProfile = async (name: string) => {
        const { data: { user }, error } = await supabase.auth.updateUser({
            data: { full_name: name }
        });

        if (error) {
            console.error("Error updating profile:", error);
        } else if (user) {
            setSession(prev => prev ? { ...prev, user } : null);
        }
        setShowProfileModal(false);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowAddModal(true);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
        if (editingTask) {
            // Update existing
            const updatedTask: Task = { ...editingTask, ...taskData };

            // Optimistic Update
            setBacklog(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            setSchedule(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

            // If start_time changed, might need to move between arrays
            if (updatedTask.start_time && !editingTask.start_time) {
                // Moved from backlog to schedule
                setBacklog(prev => prev.filter(t => t.id !== updatedTask.id));
                setSchedule(prev => [...prev, updatedTask]);
            } else if (!updatedTask.start_time && editingTask.start_time) {
                // Moved from schedule to backlog
                setSchedule(prev => prev.filter(t => t.id !== updatedTask.id));
                setBacklog(prev => [...prev, updatedTask]);
            }

            setEditingTask(null);
            updateTask(updatedTask);
        } else {
            // Create New
            handleAddTask(taskData);
        }
    };



    const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
        playSound('pop'); // Sound on add
        // Use crypto.randomUUID for valid UUIDs
        const task: Task = {
            ...newTask,
            id: crypto.randomUUID(),
        };

        if (task.start_time) {
            setSchedule(prev => [...prev, task]);
        } else {
            setBacklog(prev => [...prev, task]);
        }

        updateTask(task);
    };

    const openAddModal = (time?: string) => {
        setEditingTask(null);
        setModalTime(time || null);
        setShowAddModal(true);
    };

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        playSound('pop');
        setActiveTask(event.active.data.current?.task);
    };

    const updateTask = async (task: Task) => {
        // Optimistic upate, send to DB
        if (session) {
            // Convert Frontend Model -> DB Columns

            let isoStartTime = null;
            if (task.start_time) {
                // Create a date object for TODAY at this time
                const [hours, mins] = task.start_time.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, mins, 0, 0);
                isoStartTime = date.toISOString();
            }

            const dbPayload = {
                id: task.id,
                user_id: session.user.id,
                title: task.title,
                duration_minutes: task.duration, // Map duration -> duration_minutes
                status: task.status,
                start_time: isoStartTime,
                color: task.color
            };

            const { error } = await supabase.from('tasks').upsert(dbPayload);
            if (error) {
                console.error("Supabase upsert error:", error);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        playSound('hover'); // Soft click on drop

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        const overId = over.id as string;

        let task = backlog.find(t => t.id === taskId) || schedule.find(t => t.id === taskId);
        if (!task) {
            setActiveTask(null);
            return;
        }

        // Clone arrays
        let nextBacklog = [...backlog];
        let nextSchedule = [...schedule];

        // Remove from source
        if (backlog.find(t => t.id === taskId)) {
            nextBacklog = nextBacklog.filter(t => t.id !== taskId);
        } else {
            nextSchedule = nextSchedule.filter(t => t.id !== taskId);
        }

        // Add to target
        if (overId === 'backlog-area') {
            task = { ...task, start_time: null };
            nextBacklog.push(task);
        }
        else if (overId.startsWith('slot-')) {
            // "slot-09:00" -> "09:00"
            const time = overId.replace('slot-', '');
            if (time) {
                task = { ...task, start_time: time };
                nextSchedule.push(task);
            }
        }

        setBacklog(nextBacklog);
        setSchedule(nextSchedule);
        setActiveTask(null);
        updateTask(task);
    };

    const handleChatUpdate = (newSchedule: Task[], newBacklog: Task[]) => {
        // Helper to ensure IDs are valid UUIDs for NEW tasks
        const sanitize = (list: Task[]) => list.map(t => {
            const exists = [...backlog, ...schedule].some(existing => existing.id === t.id);
            if (exists) return t;

            // If it's a new task (not found) and ID doesn't look like a UUID, generate one
            if (!t.id || t.id.length < 30) {
                return { ...t, id: crypto.randomUUID() };
            }
            return t;
        });

        const safeSchedule = sanitize(newSchedule);
        const safeBacklog = sanitize(newBacklog);

        setSchedule(safeSchedule);
        setBacklog(safeBacklog);

        // Sync changes to Supabase
        [...safeSchedule, ...safeBacklog].forEach(t => updateTask(t));
    };

    const handleAutoSchedule = async () => {
        playSound('pop');

        triggerConfirm(
            'Start AI Auto-Pilot? 🤖',
            'I will rearrange your entire schedule to be optimum. Ready?',
            async () => {
                try {
                    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    // Using a simple loading indicator in UI would be better, but for now:
                    new Notification("🤖 AI is thinking...", { body: "Rearranging your schedule..." });

                    const data = await generateAutoSchedule(schedule, backlog, now);
                    if (data.schedule) {
                        handleChatUpdate(data.schedule, data.backlog);
                        new Notification("✅ Done!", { body: "Your schedule has been optimized." });
                    }
                } catch (e) {
                    alert("AI Optimization failed. Try again later.");
                }
            }
        );
    };

    if (checkingSession) return <div className="text-center font-bold text-2xl mt-20 p-10 animate-pulse text-primary">LOADING...</div>;

    if (!session) {
        if (showLogin) return <LoginScreen />;
        return <LandingPage onStart={() => setShowLogin(true)} />;
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col relative z-10"
            >


                {/* Header */}
                <div className="flex justify-between items-center p-4 mb-4 shrink-0 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setShowProfileModal(true)}
                            title="Edit Profile"
                        >
                            <div className="w-12 h-12 rounded-full bg-yellow-300 flex items-center justify-center text-black border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <User size={20} strokeWidth={3} />
                            </div>
                            <div>
                                <h2 className="font-black text-xl truncate max-w-[150px] md:max-w-xs text-black uppercase tracking-tight leading-none">
                                    {session.user.user_metadata?.full_name || session.user.email}
                                </h2>
                                {/* Gamification Bar */}
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="bg-black text-white px-2 py-0.5 rounded text-xs font-bold">LVL {level}</div>
                                    <div className="text-xs font-bold text-gray-500">{xp} XP</div>
                                    <StreakFlame streak={streak} />
                                </div>
                            </div>
                        </div>


                        {/* Weather Widget */}
                        {weather && (
                            <div className="hidden md:flex flex-col items-center bg-blue-100 p-1 px-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex items-center gap-1">
                                    <CloudSun size={16} strokeWidth={3} />
                                    <span className="font-black text-sm">{weather.temp}°C</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="z-20 text-center flex-1 hidden md:block">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black">
                                <svg viewBox="0 0 512 512" className="w-5 h-5">
                                    <circle cx="256" cy="256" r="200" fill="white" stroke="#8B5CF6" strokeWidth="20"/>
                                    <rect x="246" y="120" width="20" height="80" rx="10" fill="#8B5CF6"/>
                                    <rect x="246" y="256" width="20" height="60" rx="10" fill="#EC4899" transform="rotate(90 256 256)"/>
                                    <circle cx="256" cy="256" r="16" fill="#1F2937"/>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                TimeBlock
                            </h1>
                        </div>
                    </div>


                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleAutoSchedule()}
                            className="btn-neo bg-indigo-500 hover:bg-indigo-400 text-white h-9 hover:scale-105 transition-transform"
                            title="Auto Schedule with AI"
                        >
                            <Zap size={16} className="mr-1 fill-yellow-300 text-yellow-300 animate-pulse" /> Auto
                        </Button>
                        <Button
                            onClick={() => setShowStats(true)}
                            className="btn-neo bg-white hover:bg-gray-100 text-black h-9 hover:scale-105 transition-transform"
                            title="View Analytics"
                        >
                            <BarChart2 size={16} className="mr-1" /> Stats
                        </Button>
                        <Button
                            onClick={() => openAddModal()}
                            className="btn-neo bg-primary hover:bg-pink-400 text-white h-9"
                        >
                            <Plus size={16} className="mr-1" /> Add
                        </Button>
                        <Button
                            onClick={() => supabase.auth.signOut()}
                            className="btn-neo bg-red-500 hover:bg-red-400 text-white h-9"
                        >
                            <LogOut size={16} className="mr-1" />
                        </Button>
                    </div>
                </div >



                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full h-full min-h-0 pb-2">

                    {/* Left: Schedule (Takes 2 columns) */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="md:col-span-3 h-full min-h-0"
                    >
                        <Card className="flex flex-col overflow-hidden h-full border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl bg-white/60 backdrop-blur-sm">
                            <CardHeader className="flex flex-row justify-between items-center py-4 px-6 border-b-[3px] border-black shrink-0 bg-yellow-100">
                                <div>
                                    <CardTitle className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2 underline decoration-dashed decoration-2 underline-offset-4">
                                        <Sparkles className="text-yellow-400 fill-yellow-400 w-6 h-6" />
                                        Today&apos;s Focus
                                    </CardTitle>
                                </div>
                                <Button
                                    onClick={() => openAddModal('09:00')}
                                    size="icon"
                                    className="rounded-full w-10 h-10 border-[3px] border-black bg-black text-white hover:scale-110 hover:rotate-90 transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
                                >
                                    <Plus size={20} strokeWidth={4} />
                                </Button>
                            </CardHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                                {HOURS.map(time => {
                                    // Filter tasks that fall within this hour block (e.g. 14:00 to 14:59)
                                    const tasksAtTime = schedule.filter(t => {
                                        if (!t.start_time) return false;
                                        const [taskH] = t.start_time.split(':');
                                        const [slotH] = time.split(':');
                                        return taskH === slotH;
                                    });

                                    return (
                                        <DroppableSlot key={time} time={time}>
                                            <AnimatePresence>
                                                {tasksAtTime.map(t => (
                                                    <motion.div
                                                        key={t.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                        layoutId={t.id}
                                                        className="relative hover:z-50"
                                                    >
                                                        <DraggableTask task={t} onDelete={handleDelete} onEdit={handleEditTask} onDone={handleDoneTask} onFocus={setFocusTask} />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </DroppableSlot>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Right: Backlog (Takes 1 column) */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="flex flex-col gap-4 md:col-span-2 h-full min-h-0"
                    >

                        {/* Quick Add Block */}
                        <Card className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl shrink-0 overflow-hidden">
                            <CardHeader className="pb-2 pt-4 px-4 bg-purple-200 border-b-[3px] border-black">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg text-black font-black underline decoration-dashed decoration-2 underline-offset-4">Inbox</CardTitle>
                                    <Button variant="link" size="sm" onClick={() => openAddModal()} className="h-auto p-0 font-bold text-black hover:text-primary">Add New</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4 px-4 pt-4">
                                <Input
                                    readOnly
                                    onClick={() => openAddModal()}
                                    placeholder="+ Quick add..."
                                    className="cursor-pointer border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-10 text-sm font-bold bg-white hover:bg-gray-50 transition-colors focus:translate-x-1 focus:translate-y-1 focus:shadow-none"
                                />
                            </CardContent>
                        </Card>

                        <div className="flex-1 min-h-0 flex flex-col">
                            <BacklogArea tasks={backlog} onDelete={handleDelete} onEdit={handleEditTask} onDone={handleDoneTask} onFocus={setFocusTask} />
                        </div>

                        <motion.div
                            whileHover={{ rotate: 2, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative hover:z-50"
                        >
                            <Card className="bg-yellow-300 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black shrink-0 rounded-xl cursor-default">
                                <CardContent className="p-3">
                                    <h3 className="font-black text-sm mb-0.5 flex items-center gap-2">
                                        🚀 Pro Tip
                                    </h3>
                                    <p className="text-xs font-bold leading-tight">
                                        Drag tasks to time-block your day!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <div className="mt-auto space-y-4 relative z-0">
                            <DailyProgressWidget tasks={[...schedule, ...backlog]} />
                            <CountdownToFreedom />
                        </div>
                    </motion.div>
                </div>

                <ChatWidget schedule={schedule} backlog={backlog} onUpdate={handleChatUpdate} />

                {/* Confirm Dialog */}
                {
                    confirmConfig && (
                        <ConfirmDialog
                            open={confirmOpen}
                            onOpenChange={setConfirmOpen}
                            title={confirmConfig.title}
                            description={confirmConfig.description}
                            onConfirm={handleConfirmAction}
                        />
                    )
                }

                <AnimatePresence>
                    {showSpotify && (
                        <motion.div
                            className="fixed bottom-24 left-6 z-50 w-80 space-y-2"
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        >
                            <Card className="border-0 shadow-2xl bg-black/95 overflow-hidden p-2">
                                <iframe
                                    style={{ borderRadius: '12px' }}
                                    src={`https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="80"
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                ></iframe>

                                <div className="mt-2 flex gap-2">
                                    <Input
                                        placeholder="Paste Spotify Playlist Link..."
                                        className="h-7 text-[10px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                        value={spotifyUrl}
                                        onChange={(e) => {
                                            setSpotifyUrl(e.target.value);
                                            // Extract ID roughly
                                            // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
                                            const val = e.target.value;
                                            if (val.includes('playlist/')) {
                                                const id = val.split('playlist/')[1]?.split('?')[0];
                                                if (id) setSpotifyId(id);
                                            }
                                        }}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="fixed bottom-6 left-6 z-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Button
                        onClick={() => setShowSpotify(!showSpotify)}
                        size="icon"
                        className={`w-14 h-14 rounded-full shadow-2xl border-4 ${showSpotify ? 'bg-[#1DB954] border-[#1ed760]' : 'bg-black border-gray-800'} transition-all`}
                    >
                        <span className="text-2xl">🎵</span>
                    </Button>
                </motion.div>

                <AddTaskModal
                    isOpen={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingTask(null);
                    }}
                    onAdd={handleSaveTask}
                    initialTime={modalTime}
                    initialData={editingTask}
                />

                <ProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    currentName={session.user.user_metadata?.full_name || ""}
                    onSave={handleUpdateProfile}
                />

                <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />

                <AnimatePresence>
                    {focusTask && (
                        <FocusMode
                            task={focusTask}
                            onClose={() => setFocusTask(null)}
                            onComplete={(task) => {
                                handleDoneTask(task);
                            }}
                        />
                    )}
                </AnimatePresence>

                {
                    createPortal(
                        <DragOverlay>
                            {activeTask ? <DraggableTask task={activeTask} /> : null}
                        </DragOverlay>,
                        document.body
                    )
                }
            </motion.div >
        </DndContext >
    );
}
