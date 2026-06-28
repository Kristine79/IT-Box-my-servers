'use client';

import Link from 'next/link';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import i18n from '@/lib/i18n';

interface Task {
  id: string;
  projectId?: string | null;
  projectName?: string;
  content?: string;
  priority?: string;
  status?: string;
  createdAt?: any;
}

interface UrgentTasksProps {
  tasks: Task[];
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
}

export function UrgentTasks({ tasks, selectedDate, onDateSelect }: UrgentTasksProps) {
  const locale = i18n.language === 'ru' ? ru : enUS;
  
  return (
    <div className="neu-panel p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" /> Urgent Tasks
      </h3>
      
      {tasks.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">No urgent tasks</p>
      ) : (
        <ul className="space-y-2">
          {tasks.slice(0, 5).map((t) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{t.content || 'Untitled task'}</p>
                {t.projectName && (
                  <p className="text-[10px] text-[var(--muted-foreground)]">in {t.projectName}</p>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                {t.priority}
              </Badge>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
