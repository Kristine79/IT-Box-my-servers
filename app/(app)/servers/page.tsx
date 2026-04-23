'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Share2, Server as ServerIcon, Network, Cpu, MemoryStick } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/lib/notifications";

export default function ServersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [servers, setServers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [ipAddress, setIp] = useState("");
  const [provider, setProvider] = useState("");
  const [os, setOs] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    if(!user) return;
    try {
      const q = query(collection(db, "servers"), where("ownerId", "==", user.uid));
      const pQ = query(collection(db, "projects"), where("ownerId", "==", user.uid));
      
      const [sSnap, pSnap] = await Promise.all([getDocs(q), getDocs(pQ)]);
      
      setServers(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setProjects(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error("Failed to load servers");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "servers"), {
        name, ipAddress, provider, os, projectId, notes,
        ownerId: user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Server created");
      sendNotification({
        title: t('notif_server_added'),
        message: `${name} (${ipAddress})`,
        type: 'info',
        link: '/servers'
      });
      setOpen(false);
      setName(""); setIp(""); setProvider(""); setOs(""); setProjectId(""); setNotes("");
      loadData();
    } catch (error) {
      toast.error("Failed to create server");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Вы уверены?")) return;
    try {
      await deleteDoc(doc(db, "servers", id));
      toast.success("Сервер удален");
      loadData();
    } catch (error) {
      toast.error("Не удалось удалить сервер");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight mb-2">{t('servers')}</h1>
           <p className="text-[var(--neu-text-muted)]">{t('manage_servers_desc')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="neu-button neu-button-accent px-6 py-3 shrink-0 flex items-center justify-center font-semibold text-sm">
             <Plus className="w-4 h-4 mr-2"/> {t('create_server')}
          </DialogTrigger>
          <DialogContent className="border-0 sm:rounded-3xl p-8 max-w-2xl" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
            <DialogHeader><DialogTitle className="text-2xl font-bold">{t('create_server')}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 pt-4 pb-12 sm:pb-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_name')}</label>
                   <input required value={name} onChange={e=>setName(e.target.value)} className="neu-input w-full" placeholder="Frontend Node 1" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_host')}</label>
                   <input required value={ipAddress} onChange={e=>setIp(e.target.value)} className="neu-input w-full font-mono text-sm" placeholder="192.168.1.1" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_provider')}</label>
                   <input value={provider} onChange={e=>setProvider(e.target.value)} className="neu-input w-full" placeholder="AWS / DigitalOcean..." />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_os')}</label>
                   <input value={os} onChange={e=>setOs(e.target.value)} className="neu-input w-full" placeholder="Ubuntu 22.04 LTS" />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_project')}</label>
                 <select 
                    value={projectId} 
                    onChange={(e) => setProjectId(e.target.value)}
                    className="neu-input w-full appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[var(--neu-bg)]">{t('status_no_project')}</option>
                    {projects.map(p => <option key={p.id} value={p.id} className="bg-[var(--neu-bg)]">{p.name}</option>)}
                 </select>
               </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_notes')}</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="neu-input w-full min-h-[100px] resize-none" placeholder={t('placeholder_notes')} />
               </div>

              <div className="flex justify-end pt-4"><button type="submit" className="neu-button neu-button-accent px-8 py-3">{t('btn_save')}</button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="opacity-50">{t('loading')}</p> : (
        <div className="space-y-4">
           {servers.length === 0 && (
              <div className="neu-panel p-12 text-center text-[var(--neu-text-muted)]">
                 <ServerIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>{t('no_servers')}</p>
              </div>
           )}
           {servers.map((s) => {
              const project = projects.find(p => p.id === s.projectId);
              return (
              <div key={s.id} className="neu-panel p-6 px-8 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.01] group">
                 <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="neu-panel-inset p-4 rounded-full text-purple-400 shrink-0 hidden sm:block">
                       <ServerIcon className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                          {s.name}
                       </h3>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                          <div className="flex items-center gap-1.5 text-[var(--neu-text-muted)] text-sm">
                             <Network className="w-4 h-4" />
                             <span className="font-mono bg-[var(--neu-bg)] px-2 py-0.5 rounded-md shadow-[var(--neu-shadow-inset)] text-[13px]">{s.ipAddress}</span>
                          </div>
                          {s.provider && (
                             <div className="flex items-center gap-1.5 text-[var(--neu-text-muted)] text-sm">
                                <span className="opacity-70">{s.provider}</span>
                             </div>
                          )}
                          {s.os && (
                             <div className="flex items-center gap-1.5 text-[var(--neu-text-muted)] text-sm">
                                <span className="neu-panel-inset px-2.5 py-0.5 rounded text-xs">{s.os}</span>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto mt-4 lg:mt-0 justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                    {project && (
                       <div className="hidden md:flex flex-col text-right">
                          <span className="text-[10px] uppercase font-bold text-[var(--neu-text-muted)] tracking-wider">{t('field_project')}</span>
                          <span className="text-sm font-medium opacity-90">{project.name}</span>
                       </div>
                    )}
                    
                    <div className="flex gap-2">
                       <button className="neu-button h-10 w-10 text-blue-400" title={t('copy_ip')} onClick={() => {
                          navigator.clipboard.writeText(s.ipAddress);
                          toast.success(t('toast_ip_copied'));
                       }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                       </button>
                       <button className="neu-button h-10 w-10 text-blue-500" title={t('share')}>
                          <Share2 className="w-4 h-4" />
                       </button>
                       <button className="neu-button h-10 w-10 text-red-500" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
           )})}
        </div>
      )}
    </div>
  );
}
