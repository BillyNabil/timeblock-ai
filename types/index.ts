export interface Task {
    id: string;
    title: string;
    duration: number; // minutes
    start_time?: string | null; // ISO string if scheduled
    status: 'todo' | 'in-progress' | 'done';
    finished_at?: string | null;
    color?: string; // e.g., 'blue', 'pink', 'green', 'yellow', 'purple'
}

export interface DaySchedule {
    date: string;
    tasks: Task[];
}
