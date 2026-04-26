'use client';

import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer, getDocs, orderBy, limit, collectionGroup, doc, getDoc } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { FolderKanban, Server, Network, KeyRound, Lock, MousePointer2, Users, Info, AlertTriangle, CalendarDays, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
interface Project { id: string; name?: string; description?: string; status?: string; }
interface ServerItem { id: string; name?: string; ipAddress?: string; }
interface Task { id: string; projectId?: string | null; projectName?: string; content?: string; priority?: string; status?: string; createdAt?: any; }

  const [stats, setStats] = useState({ projects: 0, servers: 0, services: 0, credentials: 0 });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentServers, setRecentServers] = useState<ServerItem[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      try {
        const pQuery = query(collection(db, "projects"), where("ownerId", "==", user!.uid), where("status", "==", "active"));
        const srvQuery = query(collection(db, "servers"), where("ownerId", "==", user!.uid));
        const svcQuery = query(collection(db, "services"), where("ownerId", "==", user!.uid));
        const cQuery = query(collection(db, "credentials"), where("ownerId", "==", user!.uid));

        const [pSnap, srvSnap, svcSnap, cSnap] = await Promise.all([
          getCountFromServer(pQuery),
          getCountFromServer(srvQuery),
          getCountFromServer(svcQuery),
          getCountFromServer(cQuery)
        ]);

        setStats({
          projects: pSnap.data().count,
          servers: srvSnap.data().count,
          services: svcSnap.data().count,
          credentials: cSnap.data().count
        });

        const pRecentQ = query(collection(db, "projects"), where("ownerId", "==", user!.uid), orderBy("createdAt", "desc"), limit(5));
        const sRecentQ = query(collection(db, "servers"), where("ownerId", "==", user!.uid), orderBy("createdAt", "desc"), limit(5));

        // Fetch urgent tasks without composite index
        const tQuery = query(collectionGroup(db, "tasks"), where("ownerId", "==", user!.uid));

        const [pRec, sRec, tRec] = await Promise.all([getDocs(pRecentQ), getDocs(sRecentQ), getDocs(tQuery)]);
        
        setRecentProjects(pRec.docs.map(d => ({ id: d.id, ...d.data() })));
        setRecentServers(sRec.docs.map(d => ({ id: d.id, ...d.data() })));

        // Filter and sort urgent tasks
        const tasks = tRec.docs
           .map(d => {
             const pathParts = d.ref.path.split('/');
             const projectId = pathParts.length > 2 ? pathParts[1] : null;
             return { id: d.id, projectId, ...d.data() } as any;
           })
           .filter(t => t.status === "todo" && (t.priority === "urgent" || t.priority === "critical"));
        
        // Enhance tasks with project names
        const enrichedTasks = await Promise.all(tasks.map(async (t) => {
           if (!t.projectId) return t;
           try {
             // Cache check theoretically, we can just getDoc
             const pDoc = await getDoc(doc(db, "projects", t.projectId));
             if (pDoc.exists()) {
               return { ...t, projectName: pDoc.data().name };
             }
           } catch (e) {
             console.log(e);
           }
           return t;
        }));

        enrichedTasks.sort((a,b) => {
           const timeA = a.createdAt?.toMillis?.() || 0;
           const timeB = b.createdAt?.toMillis?.() || 0;
           return timeB - timeA; // desc
        });

        setUrgentTasks(enrichedTasks);

      } catch(err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const displayedTasks = selectedDate ? urgentTasks.filter((t: Task) => {
    if (!t.createdAt) return true; // if no date, maybe keep it or exclude it. Let's keep it.
    const d = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
    return d.toDateString() === selectedDate.toDateString();
  }) : urgentTasks;

  if (loading) return (
    <div className="flex flex-col gap-8 md:gap-10 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-[var(--neu-bg)] rounded-xl neu-panel-inset" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="neu-panel p-4 md:p-5 h-28 rounded-2xl">
            <div className="h-4 w-24 bg-[var(--neu-bg)] rounded neu-panel-inset mb-4" />
            <div className="h-8 w-12 bg-[var(--neu-bg)] rounded neu-panel-inset" />
          </div>
        ))}
      </div>
      <div className="neu-panel p-5 rounded-2xl h-48">
        <div className="h-4 w-32 bg-[var(--neu-bg)] rounded neu-panel-inset mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-[var(--neu-bg)] rounded-lg neu-panel-inset" />
          <div className="h-10 bg-[var(--neu-bg)] rounded-lg neu-panel-inset" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 md:gap-10 max-w-7xl mx-auto"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">{t('dashboard')}</h1>
        <HoverCard>
          <HoverCardTrigger className="text-sm md:text-base text-[var(--neu-text-muted)] inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--neu-accent)] transition-colors group" tabIndex={0}>
              {t('system_overview')}
              <Info className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </HoverCardTrigger>
          <HoverCardContent align="start" sideOffset={8} className="w-[340px] px-5 py-4 neu-panel border border-[var(--neu-border)]/20 shadow-2xl">
            <h3 className="font-bold text-sm md:text-base text-[var(--neu-accent)] leading-tight mb-3">
              {t('hero_title')}
            </h3>
            <div className="grid gap-2.5 text-xs md:text-sm text-[var(--neu-text-muted)]">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <span className="leading-snug">{t('hero_sub1')}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MousePointer2 className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
                <span className="leading-snug">{t('hero_sub2')}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                <span className="leading-snug">{t('hero_sub3')}</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div variants={item}>
          <Link href="/projects" prefetch={true} className="neu-panel p-4 md:p-5 flex flex-col justify-between h-full group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start gap-2 mb-4">
               <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-[var(--neu-text-muted)] uppercase line-clamp-2">{t('active_projects')}</h3>
               <div className="neu-panel-inset p-2 shrink-0 rounded-md text-blue-400 group-hover:bg-blue-400/10 transition-colors">
                 <FolderKanban className="w-4 h-4 md:w-5 md:h-5" />
               </div>
             </div>
             <div>
               <div className="text-3xl md:text-4xl font-bold mt-auto">{stats.projects}</div>
             </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/servers" prefetch={true} className="neu-panel p-4 md:p-5 flex flex-col justify-between h-full group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start gap-2 mb-4">
               <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-[var(--neu-text-muted)] uppercase line-clamp-2">{t('servers')}</h3>
               <div className="neu-panel-inset p-2 shrink-0 rounded-md text-purple-400 group-hover:bg-purple-400/10 transition-colors">
                 <Server className="w-4 h-4 md:w-5 md:h-5" />
               </div>
             </div>
             <div>
               <div className="text-3xl md:text-4xl font-bold mt-auto">{stats.servers}</div>
             </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/services" prefetch={true} className="neu-panel p-4 md:p-5 flex flex-col justify-between h-full group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start gap-2 mb-4">
               <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-[var(--neu-text-muted)] uppercase line-clamp-2">{t('services')}</h3>
               <div className="neu-panel-inset p-2 shrink-0 rounded-md text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                 <Network className="w-4 h-4 md:w-5 md:h-5" />
               </div>
             </div>
             <div>
               <div className="text-3xl md:text-4xl font-bold mt-auto">{stats.services}</div>
             </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/credentials" prefetch={true} className="neu-panel p-4 md:p-5 flex flex-col justify-between h-full group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start gap-2 mb-4">
               <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-[var(--neu-text-muted)] uppercase line-clamp-2">{t('credentials')}</h3>
               <div className="neu-panel-inset p-2 shrink-0 rounded-md text-rose-500 group-hover:bg-rose-500/10 transition-colors">
                 <KeyRound className="w-4 h-4 md:w-5 md:h-5" />
               </div>
             </div>
             <div>
               <div className="text-3xl md:text-4xl font-bold mt-auto">{stats.credentials}</div>
             </div>
          </Link>
        </motion.div>
      </div>

      {/* Urgent Tasks & Calendar Block */}
      <motion.div variants={item} className="neu-panel overflow-hidden !rounded-xl">
         <div className="p-5 lg:p-6 bg-[var(--neu-bg)]/50">
            <div className="flex items-center justify-between gap-2 md:gap-3 mb-5">
              <div className="flex items-center gap-2 md:gap-3 shrink min-w-0">
                 <div className="p-1.5 md:p-2 rounded-md bg-orange-500/10 text-orange-500 shrink-0">
                   <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                 </div>
                 <h3 className="text-[13px] sm:text-base md:text-lg font-bold truncate tracking-tight">{t('urgent_tasks')}</h3>
                 {displayedTasks.length > 0 && (
                   <span className="bg-orange-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 rounded-full shrink-0">
                     {displayedTasks.length}
                   </span>
                 )}
              </div>
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)} 
                className="neu-button p-2 md:px-3 md:py-2 text-xs font-bold uppercase tracking-widest text-[var(--neu-text-muted)] flex items-center justify-center gap-2 shrink-0"
                title={isCalendarOpen ? t('collapse') : t('select_date')}
                aria-label={isCalendarOpen ? t('collapse') : t('select_date')}
              >
                 {isCalendarOpen ? <X className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                 <span className="hidden md:inline">{isCalendarOpen ? t('collapse') : t('select_date')}</span>
              </button>
            </div>

            {isCalendarOpen && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }} 
                 animate={{ opacity: 1, height: 'auto' }} 
                 className="mb-6 flex justify-center border-b border-[var(--neu-border)]/20 pb-6"
               >
                  <div ref={(node) => {
                    if (node) {
                      node.style.setProperty('--rdp-accent-color', 'var(--neu-accent)');
                      node.style.setProperty('--rdp-background-color', 'transparent');
                    }
                  }}>
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(newDate) => { setSelectedDate(newDate); setIsCalendarOpen(false); }}
                      locale={i18n.language === 'ru' ? ru : enUS}
                      className="p-3 bg-[var(--neu-bg)] rounded-md"
                      style={{ boxShadow: 'var(--neu-shadow-inset)' }}
                      classNames={{
                        today: 'text-[var(--neu-accent)] font-bold',
                        selected: 'bg-[var(--neu-accent)] text-white hover:bg-[var(--neu-accent)] hover:text-white',
                      }}
                    />
                  </div>
               </motion.div>
            )}

            <div className="space-y-3">
               {displayedTasks.length === 0 ? (
                 <div className="text-center py-10 opacity-50 px-4 flex flex-col items-center">
                   <FolderKanban className="w-8 h-8 mb-2 opacity-50" />
                   <p className="text-sm font-medium tracking-wide">
                     {selectedDate ? `${t('no_tasks_for_date')} ${selectedDate.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}.` : t('no_urgent_tasks')}
                   </p>
                   {selectedDate && (
                     <button onClick={() => setSelectedDate(undefined)} className="mt-4 text-xs font-bold uppercase text-[var(--neu-accent)] hover:underline">
                       {t('show_all')}
                     </button>
                   )}
                 </div>
               ) : (
                 displayedTasks.map((task: Task) => (
                   <Link 
                     key={task.id} 
                     href={`/projects?project=${task.projectId}`} 
                     className="block p-4 rounded-md border border-[var(--neu-border)]/10 hover:border-orange-500/30 bg-[var(--neu-bg)] hover:bg-orange-500/5 transition-all group"
                   >
                     <div className="flex justify-between items-start gap-4 overflow-hidden">
                       <div className="flex-1 min-w-0">
                          <p className="font-medium text-[15px] group-hover:text-orange-500 transition-colors leading-snug truncate">{task.content}</p>
                          {task.projectName && (
                            <p className="text-xs text-[var(--neu-text-muted)] mt-1.5 font-medium truncate">{task.projectName}</p>
                          )}
                       </div>
                       <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-orange-500/10 text-orange-500 whitespace-nowrap">
                         {task.priority === 'critical' ? t('critical') : t('urgent')}
                       </span>
                     </div>
                   </Link>
                 ))
               )}
            </div>
         </div>
      </motion.div>

      {/* Recents */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6 min-w-0">
        <motion.div variants={item} className="neu-panel p-3 sm:p-4 min-w-0">
           <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 px-1">{t('recent_projects')}</h3>
          <div className="space-y-1">
             {recentProjects.length === 0 ? <p className="text-sm opacity-50 px-1">{t('no_data')}</p> : null}
             {recentProjects.map((p) => (
               <Link href="/projects" prefetch={true} key={p.id} className="block group p-2 mx-0 rounded-lg hover:bg-[var(--neu-accent)]/5 transition-all overflow-hidden min-w-0">
                  <div className="w-full overflow-hidden">
                    <h4 className="text-[15px] font-bold group-hover:text-[var(--neu-accent)] transition-colors truncate">{p.name}</h4>
                  </div>
                  <p className="text-[var(--neu-text-muted)] text-xs mt-0.5 truncate">{p.description || t('no_description')}</p>
               </Link>
             ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="neu-panel p-3 sm:p-4 min-w-0">
           <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 px-1">{t('recent_servers')}</h3>
          <div className="space-y-1">
             {recentServers.length === 0 ? <p className="text-sm opacity-50 px-1">{t('no_data')}</p> : null}
             {recentServers.map((s) => (
               <Link href="/servers" prefetch={true} key={s.id} className="block group p-2 mx-0 rounded-lg hover:bg-[var(--neu-accent)]/5 transition-all overflow-hidden min-w-0">
                  <div className="w-full overflow-hidden">
                    <h4 className="text-[15px] font-bold group-hover:text-[var(--neu-accent)] transition-colors truncate">{s.name}</h4>
                  </div>
                  <p className="text-[var(--neu-text-muted)] font-mono text-xs mt-0.5 truncate">{s.ipAddress}</p>
               </Link>
             ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
