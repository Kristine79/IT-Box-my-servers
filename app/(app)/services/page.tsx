'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, Share2, Network, Globe, Activity, Shield, ShieldAlert, RefreshCw, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/lib/notifications";
import { UpgradeModal } from "@/components/UpgradeModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { SearchFilter, useFilteredItems, usePagination } from "@/components/SearchFilter";

export default function ServicesPage() {
  const { t } = useTranslation();
  const { user, planLimits } = useAuth();
  const { sendNotification } = useNotifications();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [checkResults, setCheckResults] = useState<Record<string, any>>({});
  const [checking, setChecking] = useState(false);
  const [uptimeHistory, setUptimeHistory] = useState<Record<string, any[]>>({});

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const filteredServices = useFilteredItems(
    services,
    searchQuery,
    (s) => `${s.name} ${s.url || ''} ${s.port || ''}`
  );
  const { paginatedItems, hasMore, loadMore, reset } = usePagination(filteredServices, 12);

  // Form
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [port, setPort] = useState("");
  const [serverId, setServerId] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    if(!user) return;
    try {
      const q = query(collection(db, "services"), where("ownerId", "==", user.uid));
      const sq = query(collection(db, "servers"), where("ownerId", "==", user.uid));
      
      const [sSnap, srvSnap] = await Promise.all([getDocs(q), getDocs(sq)]);
      
      setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setServers(srvSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "services"), {
        name, url, port, serverId, notes,
        ownerId: user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Service created");
      setOpen(false);
      setName(""); setUrl(""); setPort(""); setServerId(""); setNotes("");
      loadData();
    } catch (error) {
      toast.error("Failed to create service");
    }
  };

  const runHealthCheck = async () => {
    if (!planLimits.canMonitoring) {
      setUpgradeOpen(true);
      return;
    }
    if (checking || services.length === 0) return;
    setChecking(true);
    try {
      const res = await fetch('/api/monitoring/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: services.map(s => ({ id: s.id, url: s.url, port: s.port })),
        }),
      });
      const data = await res.json();
      if (data.results) {
        const map: Record<string, any> = {};
        for (const r of data.results) {
          map[r.serviceId] = r;
        }
        setCheckResults(map);
        // Update uptime history in localStorage
        const historyKey = `uptime-${user?.uid}`;
        const saved = localStorage.getItem(historyKey);
        const history: Record<string, any[]> = saved ? JSON.parse(saved) : {};
        const now = new Date().toISOString().split('T')[0];
        for (const r of data.results) {
          if (!history[r.serviceId]) history[r.serviceId] = [];
          history[r.serviceId].push({ date: now, status: r.status, responseTime: r.responseTime });
          // Keep last 30 entries
          if (history[r.serviceId].length > 30) history[r.serviceId] = history[r.serviceId].slice(-30);
        }
        localStorage.setItem(historyKey, JSON.stringify(history));
        setUptimeHistory(history);
        toast.success(t('check_complete', 'Проверка завершена'));
      }
    } catch (e) {
      toast.error('Health check failed');
    } finally {
      setChecking(false);
    }
  };

  // Load uptime history from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`uptime-${user.uid}`);
      if (saved) {
        try { setUptimeHistory(JSON.parse(saved)); } catch {}
      }
    }
  }, [user]);

  const handleDelete = async (id: string, name?: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name || '');
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, "services", deleteTargetId));
      toast.success(t('service_deleted', 'Сервис удалён'));
      loadData();
    } catch (error) {
      toast.error(t('delete_failed', 'Не удалось удалить'));
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight mb-2">{t('services')}</h1>
           <p className="text-[var(--neu-text-muted)]">{t('manage_services_desc')}</p>
        </div>
        <div className="flex gap-3 items-center">
          <SearchFilter
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); reset(); }}
            placeholder={t('search_services', 'Поиск сервисов...')}
            className="w-full sm:w-64"
          />
        {planLimits.canMonitoring && (
          <button
            onClick={runHealthCheck}
            disabled={checking || services.length === 0}
            className="neu-button px-4 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? t('checking', 'Проверка...') : t('check_status', 'Check Status')}
          </button>
        )}
        {!planLimits.canMonitoring && (
          <button
            onClick={() => setUpgradeOpen(true)}
            className="neu-button px-4 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0 opacity-60"
          >
            <Activity className="w-4 h-4" />
            <Lock className="w-3 h-3" />
            {t('monitoring', 'Мониторинг')}
          </button>
        )}
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          title={t('limit_services_title', 'Достигнут лимит сервисов')}
          description={t('limit_services_desc', 'В бесплатном тарифе можно добавить не больше {{max}} сервисов. Переходите на Standard — до 15 сервисов.', { max: planLimits.maxServices })}
          targetPlan="standard"
          buttonText={t('view_plans', 'Смотреть тарифы')}
        />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className="neu-button neu-button-accent px-6 py-3 shrink-0 flex items-center font-semibold text-sm"
            onClick={(e) => {
              if (services.length >= planLimits.maxServices) {
                e.preventDefault();
                setUpgradeOpen(true);
              }
            }}
          >
             <Plus className="w-4 h-4 mr-2"/> {t('add_service')}
          </DialogTrigger>
          <DialogContent className="border-0 sm:rounded-3xl p-6 max-w-2xl" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
            <DialogHeader><DialogTitle className="text-2xl font-bold">{t('add_service')}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4 pb-12 sm:pb-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label htmlFor="svc-name" className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_name')}</label>
                   <input id="svc-name" required value={name} onChange={e=>setName(e.target.value)} className="neu-input w-full" placeholder="API Gateway" />
                 </div>
                 <div className="space-y-1">
                   <label htmlFor="svc-port" className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_port')}</label>
                   <input id="svc-port" value={port} onChange={e=>setPort(e.target.value)} className="neu-input w-full font-mono text-sm" placeholder="443" />
                 </div>
               </div>

               <div className="space-y-1">
                 <label htmlFor="svc-url" className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_url')}</label>
                 <input id="svc-url" value={url} onChange={e=>setUrl(e.target.value)} className="neu-input w-full" placeholder="https://api.example.com" />
               </div>
               
               <div className="space-y-1">
                 <label htmlFor="svc-server" className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_server')}</label>
                 <select 
                    id="svc-server"
                    value={serverId} 
                    onChange={(e) => setServerId(e.target.value)}
                    className="neu-input w-full appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[var(--neu-bg)]">{t('status_no_server')}</option>
                    {servers.map(s => <option key={s.id} value={s.id} className="bg-[var(--neu-bg)]">{s.name} ({s.ipAddress})</option>)}
                 </select>
               </div>
               
               <div className="space-y-1">
                  <label htmlFor="svc-notes" className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_notes')}</label>
                  <textarea id="svc-notes" value={notes} onChange={e=>setNotes(e.target.value)} className="neu-input w-full min-h-[100px] resize-none" placeholder={t('placeholder_notes')} />
               </div>

              <div className="flex justify-end pt-2"><button type="submit" className="neu-button neu-button-accent px-8 py-3">{t('btn_save')}</button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <SkeletonGrid count={6} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {services.length === 0 && (
              <div className="neu-panel p-12 text-center text-[var(--neu-text-muted)] col-span-full">
                 <Network className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>{t('no_services')}</p>
              </div>
           )}
           {paginatedItems.map((s) => {
              const server = servers.find(srv => srv.id === s.serverId);
              return (
              <div key={s.id} className="neu-panel p-6 flex flex-col h-full group relative transition-all duration-300 hover:scale-[1.02]">
                 <div className="flex justify-between items-start mb-6">
                    <div className="neu-panel-inset p-3 rounded-full text-amber-500">
                       <Network className="w-6 h-6" />
                    </div>
                    
                    <div className="flex gap-2">
                       <button className="neu-button h-8 w-8 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title={t('share')}>
                          <Share2 className="w-4 h-4" />
                       </button>
                       <button className="neu-button h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(s.id, s.name)}>
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 
                 <h3 className="text-xl font-bold mb-4 pr-8">{s.name}</h3>

                 {/* Status Badge */}
                 {checkResults[s.id] && (
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                         checkResults[s.id].status === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                         checkResults[s.id].status === 'degraded' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                         'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                       }`} />
                       <span className={`text-xs font-semibold uppercase ${
                         checkResults[s.id].status === 'up' ? 'text-emerald-500' :
                         checkResults[s.id].status === 'degraded' ? 'text-amber-500' :
                         'text-red-500'
                       }`}>
                         {checkResults[s.id].status === 'up' ? 'Online' : checkResults[s.id].status === 'degraded' ? 'Degraded' : 'Offline'}
                       </span>
                       {checkResults[s.id].responseTime && (
                         <span className="text-[11px] text-[var(--neu-text-muted)] ml-auto font-mono">
                           {checkResults[s.id].responseTime}ms
                         </span>
                       )}
                    </div>
                 )}

                 {/* SSL Warning */}
                 {checkResults[s.id]?.sslDaysLeft !== undefined && checkResults[s.id].sslDaysLeft <= 14 && (
                    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3 ${
                      checkResults[s.id].sslDaysLeft <= 3 ? 'bg-red-500/10 text-red-500' :
                      checkResults[s.id].sslDaysLeft <= 7 ? 'bg-amber-500/10 text-amber-500' :
                      'bg-yellow-500/10 text-yellow-600'
                    }`}>
                       <ShieldAlert className="w-4 h-4 shrink-0" />
                       SSL: {checkResults[s.id].sslDaysLeft} {t('days_left', 'дн. осталось')}
                    </div>
                 )}
                 {checkResults[s.id]?.sslDaysLeft !== undefined && checkResults[s.id].sslDaysLeft > 14 && (
                    <div className="flex items-center gap-2 text-xs text-emerald-500/70 mb-3">
                       <Shield className="w-3.5 h-3.5" />
                       SSL OK ({checkResults[s.id].sslDaysLeft}d)
                    </div>
                 )}

                 {/* Uptime Sparkline */}
                 {uptimeHistory[s.id] && uptimeHistory[s.id].length > 1 && (
                    <div className="flex gap-[2px] items-end h-4 mb-3" title={t('uptime_history', 'История доступности (30 дней)')}>
                       {uptimeHistory[s.id].slice(-30).map((entry: any, i: number) => (
                         <div
                           key={i}
                           className={`flex-1 min-w-[3px] max-w-[6px] rounded-sm ${
                             entry.status === 'up' ? 'bg-emerald-500/60' :
                             entry.status === 'degraded' ? 'bg-amber-500/60' :
                             'bg-red-500/60'
                           }`}
                           style={{ height: entry.status === 'up' ? '100%' : entry.status === 'degraded' ? '60%' : '30%' }}
                         />
                       ))}
                    </div>
                 )}
                 
                 {s.url && (
                    <div className="flex items-center gap-2 text-sm text-[var(--neu-accent)] mb-4 bg-[var(--neu-accent)]/10 px-3 py-2 rounded-lg truncate">
                       <Globe className="w-4 h-4 shrink-0" />
                       <a href={s.url.startsWith('http') ? s.url : `http://${s.url}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                          {s.url}
                       </a>
                       <ExternalLink className="ml-auto w-3 h-3 shrink-0 opacity-50" />
                    </div>
                 )}
                 
                 <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
                    {s.port && (
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--neu-text-muted)]">{t('field_port')}:</span>
                          <span className="font-mono bg-[var(--neu-bg)] px-2 py-0.5 rounded shadow-[var(--neu-shadow-inset)]">{s.port}</span>
                       </div>
                    )}
                    {server && (
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--neu-text-muted)]">{t('field_server')}:</span>
                          <span className="opacity-90 max-w-[150px] truncate" title={server.name}>{server.name}</span>
                       </div>
                    )}
                 </div>
              </div>
           )})}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button onClick={loadMore} className="neu-button px-6 py-3 font-semibold">
            {t('load_more', 'Загрузить ещё')}
          </button>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={deleteTargetName}
      />
    </div>
  );
}
