"use client";

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (task: Omit<Task, 'id'>) => void;
    initialTime?: string | null;
    initialData?: Task | null;
}

export function AddTaskModal({ isOpen, onClose, onAdd, initialTime, initialData }: Props) {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(30);
    const [isScheduled, setIsScheduled] = useState(!!initialTime);
    const [startTime, setStartTime] = useState(initialTime || '09:00');
    const [color, setColor] = useState('blue');

    const COLORS = ['blue', 'pink', 'green', 'yellow', 'purple'];

    // Reset when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing existing task
                setTitle(initialData.title);
                setDuration(initialData.duration);
                if (initialData.start_time) {
                    setIsScheduled(true);
                    setStartTime(initialData.start_time);
                } else {
                    setIsScheduled(false);
                    // Default time just in case they toggle it on
                    const now = new Date();
                    setStartTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
                }
                setColor(initialData.color || 'blue');
            } else if (initialTime) {
                // Creating new task from specific time slot
                setTitle('');
                setDuration(30);
                setTitle('');
                setDuration(30);
                setStartTime(initialTime);
                setIsScheduled(true);
                setColor('blue');
            } else {
                // Creating new task generically
                setTitle('');
                setDuration(30);
                const now = new Date();
                const currentHHMM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                setStartTime(currentHHMM);
                setIsScheduled(false);
            }
        }
    }, [isOpen, initialTime, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            title,
            duration,
            status: initialData ? initialData.status : 'todo',
            start_time: isScheduled ? startTime : null,
            color
        });
        // Reset & Close
        setTitle('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-primary">
                        {initialData ? '✏️ Edit Task' : (initialTime ? '➕ Add Time Block' : '➕ New Task')}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update your task details.' : 'Create a new task to organize your day.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="title" className="font-bold text-muted-foreground">What to do?</Label>
                        <Input
                            id="title"
                            autoFocus
                            placeholder="e.g. Conquer the world"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className="text-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                        />
                    </div>

                    <div className="grid w-full gap-2">
                        <Label htmlFor="duration" className="font-bold text-muted-foreground">Duration (min)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            step={15}
                            min={15}
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                        />
                    </div>

                    <div className="grid w-full gap-2">
                        <Label className="font-bold text-muted-foreground">Color / Category</Label>
                        <div className="flex gap-3">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`
                                        w-8 h-8 rounded-full border-2 transition-all
                                        ${c === 'blue' ? 'bg-cyan-300' : ''}
                                        ${c === 'pink' ? 'bg-pink-300' : ''}
                                        ${c === 'green' ? 'bg-lime-300' : ''}
                                        ${c === 'yellow' ? 'bg-yellow-300' : ''}
                                        ${c === 'purple' ? 'bg-purple-300' : ''}
                                        ${color === c ? 'scale-125 ring-2 ring-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'hover:scale-110 opacity-70 hover:opacity-100 border-black'}
                                    `}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="scheduleCheck"
                            className="w-5 h-5 accent-black rounded border-2 border-black"
                            checked={isScheduled}
                            onChange={e => setIsScheduled(e.target.checked)}
                        />
                        <Label htmlFor="scheduleCheck" className="cursor-pointer">Schedule this now?</Label>
                    </div>

                    {isScheduled && (
                        <div className="animate-in slide-in-from-top-2 fade-in grid w-full gap-2">
                            <Label htmlFor="startTime" className="font-bold text-muted-foreground">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                            />
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button type="submit" className="w-full btn-neo bg-black text-white hover:bg-black/80 h-10 text-lg">
                            {initialData ? 'Save Changes' : 'Create It!'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
