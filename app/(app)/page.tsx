'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer, getDocs, orderBy, limit } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { FolderKanban, Server, Network, KeyRound, Lock, MousePointer2, Users, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
  
  const [stats, setStats] = useState({ projects: 0, servers: 0, services: 0, credentials: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentServers, setRecentServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

        const [pRec, sRec] = await Promise.all([getDocs(pRecentQ), getDocs(sRecentQ)]);
        
        setRecentProjects(pRec.docs.map(d => ({ id: d.id, ...d.data() })));
        setRecentServers(sRec.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (loading) return <div className="p-4 opacity-50">{t('loading')}</div>;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 md:space-y-8 max-w-7xl mx-auto"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        <motion.div variants={item}>
          <Link href="/projects" prefetch={true} className="neu-panel p-6 flex flex-col justify-between h-full aspect-square md:aspect-auto md:min-h-[192px] group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start">
               <span className="text-xs md:text-sm font-semibold tracking-wider text-[var(--neu-text-muted)] uppercase w-2/3">{t('active_projects')}</span>
               <div className="neu-panel-inset p-2.5 rounded-full text-blue-400 group-hover:bg-blue-400/10 transition-colors">
                 <FolderKanban className="w-5 h-5" />
               </div>
             </div>
             <div>
               <div className="text-5xl font-bold mb-4">{stats.projects}</div>
             </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/servers" prefetch={true} className="neu-panel p-6 flex flex-col justify-between h-full aspect-square md:aspect-auto md:min-h-[192px] group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start">
               <span className="text-xs md:text-sm font-semibold tracking-wider text-[var(--neu-text-muted)] uppercase">{t('servers')}</span>
               <div className="neu-panel-inset p-2.5 rounded-full text-purple-400 group-hover:bg-purple-400/10 transition-colors">
                 <Server className="w-5 h-5" />
               </div>
             </div>
             <div>
               <div className="text-5xl font-bold mb-4">{stats.servers}</div>
             </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/services" prefetch={true} className="neu-panel p-6 flex flex-col justify-between h-full aspect-square md:aspect-auto md:min-h-[192px] group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start">
               <span className="text-xs md:text-sm font-semibold tracking-wider text-[var(--neu-text-muted)] uppercase">{t('services')}</span>
               <div className="neu-panel-inset p-2.5 rounded-full text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                 <Network className="w-5 h-5" />
               </div>
             </div>
             <div>
               <div className="text-5xl font-bold mb-4">{stats.services}</div>
             </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/credentials" prefetch={true} className="neu-panel p-6 flex flex-col justify-between h-full aspect-square md:aspect-auto md:min-h-[192px] group cursor-pointer transition-all hover:scale-[1.02] block">
             <div className="flex justify-between items-start">
               <span className="text-xs md:text-sm font-semibold tracking-wider text-[var(--neu-text-muted)] uppercase">{t('credentials')}</span>
               <div className="neu-panel-inset p-2.5 rounded-full text-rose-500 group-hover:bg-rose-500/10 transition-colors">
                 <KeyRound className="w-5 h-5" />
               </div>
             </div>
             <div>
               <div className="text-5xl font-bold mb-4">{stats.credentials}</div>
             </div>
          </Link>
        </motion.div>
      </div>

      {/* Recents */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div variants={item} className="neu-panel p-4 md:p-5">
           <h3 className="text-lg font-bold mb-4">{t('recent_projects')}</h3>
          <div className="space-y-2">
             {recentProjects.length === 0 ? <p className="text-sm opacity-50">{t('no_data')}</p> : null}
             {recentProjects.map((p) => (
               <Link href="/projects" prefetch={true} key={p.id} className="block group p-3 -mx-3 rounded-xl hover:bg-[var(--neu-accent)]/5 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium group-hover:text-[var(--neu-accent)] transition-colors">{p.name}</span>
                  </div>
                  <p className="text-[var(--neu-text-muted)] text-xs mt-0.5 truncate">{p.description || t('no_description')}</p>
               </Link>
             ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="neu-panel p-4 md:p-5">
           <h3 className="text-lg font-bold mb-4">{t('recent_servers')}</h3>
          <div className="space-y-2">
             {recentServers.length === 0 ? <p className="text-sm opacity-50">{t('no_data')}</p> : null}
             {recentServers.map((s) => (
               <Link href="/servers" prefetch={true} key={s.id} className="block group p-3 -mx-3 rounded-xl hover:bg-[var(--neu-accent)]/5 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium group-hover:text-[var(--neu-accent)] transition-colors">{s.name}</span>
                  </div>
                  <p className="text-[var(--neu-text-muted)] font-mono text-xs mt-0.5">{s.ipAddress}</p>
               </Link>
             ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
