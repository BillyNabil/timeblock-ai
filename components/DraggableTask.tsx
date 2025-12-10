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
                    mb-4 cursor-grab active:cursor-grabbing relative touch-none group
                    border-[3px] border-black rounded-xl
                    p-4 transition-all
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                    active:shadow-none active:translate-x-1 active:translate-y-1
                    ${activeColorClass}
                    ${isDragging ? 'rotate-3 scale-110 z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : ''}
                `}
            >
                <div className="flex justify-between items-start gap-3">
                    <h3 className="font-black text-lg leading-tight break-words flex-1 pr-4 text-black">{task.title}</h3>

                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-white text-black border-2 border-black px-2 py-0.5 rounded-full shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Timer size={12} strokeWidth={3} />
                            {task.duration}m
                        </span>
                        {task.start_time && (
                            <span className="text-[10px] font-black text-black flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Clock size={12} strokeWidth={3} />
                                {task.start_time}
                            </span>
                        )}
                    </div>
                </div>

                <div className="absolute -top-3 -right-3 flex gap-1 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-20">
                    {onFocus && (
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            onMouseDown={(e) => { e.stopPropagation(); }}
                            onTouchStart={(e) => { e.stopPropagation(); }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFocus(task);
                            }}
                            className="w-8 h-8 bg-white hover:bg-indigo-100 text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Deep Focus Mode"
                        >
                            <Play size={16} strokeWidth={3} fill="currentColor" />
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
                            className="w-8 h-8 bg-white hover:bg-blue-100 text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Edit Task"
                        >
                            <Pencil size={14} strokeWidth={3} />
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
                            className="w-8 h-8 bg-white hover:bg-green-100 text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Complete Task"
                        >
                            <Check size={16} strokeWidth={3} />
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
                            className="w-8 h-8 bg-white hover:bg-red-100 text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                            title="Delete Task"
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}
