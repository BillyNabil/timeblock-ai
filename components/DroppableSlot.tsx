"use client";

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface Props {
    time: string; // "09:00"
    children?: ReactNode;
    isActive?: boolean;
}

export function DroppableSlot({ time, children, isActive }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${time}`,
        data: { time },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
        p-2 sm:p-4 border-b border-border min-h-[80px] sm:min-h-[100px] transition-all duration-200 relative has-[:hover]:z-20
        ${isOver ? 'bg-primary/10 shadow-inner' : 'bg-transparent'}
        ${isActive ? 'bg-muted/30' : ''}
      `}
        >
            <div className="absolute left-0 top-0 -translate-y-1/2 bg-card border border-border text-muted-foreground text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-r-md shadow-sm z-0">
                {time}
            </div>
            <div className="pl-10 sm:pl-12 pt-1 sm:pt-2 h-full z-10 relative">
                {children}
            </div>
        </div>
    );
}
