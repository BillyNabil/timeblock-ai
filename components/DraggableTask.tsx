"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Card } from "@/components/ui/card";
import { X, Clock, Timer, Pencil, Check, Play } from "lucide-react";

interface Props {
    task: Task;
    onDelete?: (id: string) => void;
    onEdit?: (task: Task) => void;
    onDone?: (task: Task) => void;
    onFocus?: (task: Task) => void;
}

export function DraggableTask({ task, onDelete, onEdit, onDone, onFocus }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : undefined,
    } : undefined;

    const colorStyles = {
        blue: "bg-cyan-300",
        pink: "bg-pink-300",
        green: "bg-lime-300",
        purple: "bg-purple-300",
        yellow: "bg-yellow-300",
    };

    const activeColorClass = colorStyles[task.color as keyof typeof colorStyles] || colorStyles.blue;

    return (
        <div ref={setNodeRef} style={style} className={`transition-transform ${isDragging ? "z-50" : ""}`}>
            <Card
                {...listeners}
                {...attributes}
                className={`
                    mb-2 sm:mb-4 cursor-grab active:cursor-grabbing relative touch-none group
                    border-[2px] sm:border-[3px] border-black rounded-lg sm:rounded-xl
                    p-2 sm:p-4 transition-all
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    active:shadow-none active:translate-x-1 active:translate-y-1
                    ${activeColorClass}
                    ${isDragging ? 'rotate-3 scale-105 z-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}
                `}
            >
                <div className="flex justify-between items-start gap-2 sm:gap-3">
                    <h3 className="font-black text-sm sm:text-lg leading-tight break-words flex-1 pr-2 sm:pr-4 text-black">{task.title}</h3>

                    <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 bg-white text-black border sm:border-2 border-black px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Timer size={10} strokeWidth={3} className="hidden sm:inline" />
                            <Timer size={8} strokeWidth={3} className="sm:hidden" />
                            {task.duration}m
                        </span>
                        {task.start_time && (
                            <span className="text-[8px] sm:text-[10px] font-black text-black flex items-center gap-0.5 sm:gap-1 bg-white px-1 sm:px-1.5 py-0.5 rounded border sm:border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Clock size={10} strokeWidth={3} className="hidden sm:inline" />
                                <Clock size={8} strokeWidth={3} className="sm:hidden" />
                                {task.start_time}
                            </span>
                        )}
                    </div>
                </div>

                <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 flex gap-0.5 sm:gap-1 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20">
                    {onFocus && (
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onTouchStart={(e) => { e.stopPropagation(); }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFocus(task);
                            }}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-white hover:bg-indigo-100 text-black rounded-md sm:rounded-lg border sm:border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Deep Focus Mode"
                        >
                            <Play size={12} strokeWidth={3} fill="currentColor" className="sm:hidden" />
                            <Play size={16} strokeWidth={3} fill="currentColor" className="hidden sm:block" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onTouchStart={(e) => { e.stopPropagation(); }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-white hover:bg-blue-100 text-black rounded-md sm:rounded-lg border sm:border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Edit Task"
                        >
                            <Pencil size={10} strokeWidth={3} className="sm:hidden" />
                            <Pencil size={14} strokeWidth={3} className="hidden sm:block" />
                        </button>
                    )}
                    {onDone && (
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onTouchStart={(e) => { e.stopPropagation(); }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDone(task);
                            }}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-white hover:bg-green-100 text-black rounded-md sm:rounded-lg border sm:border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Complete Task"
                        >
                            <Check size={12} strokeWidth={3} className="sm:hidden" />
                            <Check size={16} strokeWidth={3} className="hidden sm:block" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onTouchStart={(e) => { e.stopPropagation(); }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-white hover:bg-red-100 text-black rounded-md sm:rounded-lg border sm:border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Delete Task"
                        >
                            <X size={12} strokeWidth={3} className="sm:hidden" />
                            <X size={16} strokeWidth={3} className="hidden sm:block" />
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}
