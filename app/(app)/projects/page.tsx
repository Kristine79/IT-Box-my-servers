'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, orderBy, onSnapshot } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, FolderKanban, Globe, Code2, ClipboardList, CheckCircle2, Circle, Clock, ArrowUp, ArrowDown, ArrowDownAZ, ArrowUpAZ, CalendarDays, BarChart2, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications";

function TaskModal({ projectId, projectName, onTaskChange }: { projectId: string; projectName: string; onTaskChange?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [tasks, setTasks] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [filterPriority, setFilterPriority] = useState("all");
  const [loading, setLoading] = useState(true);

  const filteredTasks = useMemo(() => {
    if (filterPriority === "all") return tasks;
    return tasks.filter(t => t.priority === filterPriority);
  }, [tasks, filterPriority]);

  useEffect(() => {
    if (!user || !projectId) return;
    const q = query(
      collection(db, "projects", projectId, "tasks"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user, projectId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await addDoc(collection(db, "projects", projectId, "tasks"), {
        content,
        priority,
        status: "todo",
        ownerId: user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setContent("");
      setPriority("normal");
      toast.success(t('task_add'));
      onTaskChange?.();
    } catch (err) {
      toast.error("Failed to add task");
    }
  };

  const toggleTask = async (task: any) => {
    try {
      const newStatus = task.status === "done" ? "todo" : "done";
      await updateDoc(doc(db, "projects", projectId, "tasks", task.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        completedAt: newStatus === "done" ? serverTimestamp() : null
      });
      if (newStatus === "done") {
        sendNotification({
          title: t('notif_task_completed'),
          message: `${task.content} (${projectName})`,
          type: 'success',
          link: `/projects`
        });
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", projectId, "tasks", id));
      onTaskChange?.();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <DialogContent className="border-0 sm:rounded-3xl p-8 max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
      <div tabIndex={0} className="opacity-0 w-0 h-0 absolute overflow-hidden pointer-events-none" autoFocus />
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-[var(--neu-accent)]" />
          {projectName}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={addTask} className="mt-6 flex flex-col sm:flex-row gap-3">
        <input 
          required 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="neu-input flex-1" 
          placeholder={t('task_content')} 
        />
        <div className="flex gap-3">
          <select 
            value={priority} 
            onChange={e => setPriority(e.target.value)}
            className="neu-input flex-1 sm:w-32 appearance-none cursor-pointer"
          >
            <option value="low" className="bg-[var(--neu-bg)]">{t('priority_low')}</option>
            <option value="normal" className="bg-[var(--neu-bg)]">{t('priority_normal')}</option>
            <option value="urgent" className="bg-[var(--neu-bg)]">{t('priority_urgent')}</option>
            <option value="critical" className="bg-[var(--neu-bg)]">{t('priority_critical')}</option>
          </select>
          <button type="submit" className="neu-button neu-button-accent p-3 shrink-0">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2 mb-4 bg-[var(--neu-bg)] px-3 py-2 rounded-lg shell shadow-[var(--neu-shadow-inset)] w-full">
          <Filter className="w-4 h-4 text-[var(--neu-text-muted)]" />
          <select 
            value={filterPriority} 
            onChange={e => setFilterPriority(e.target.value)}
            className="neu-input flex-1 appearance-none cursor-pointer py-1.5 text-sm"
          >
            <option value="all" className="bg-[var(--neu-bg)]">{t('all_priorities')}</option>
            <option value="low" className="bg-[var(--neu-bg)]">{t('priority_low')}</option>
            <option value="normal" className="bg-[var(--neu-bg)]">{t('priority_normal')}</option>
            <option value="urgent" className="bg-[var(--neu-bg)]">{t('priority_urgent')}</option>
            <option value="critical" className="bg-[var(--neu-bg)]">{t('priority_critical')}</option>
          </select>
        </div>

        {loading ? <p className="opacity-50 text-center">{t('loading')}</p> : null}
        {!loading && filteredTasks.length === 0 ? <p className="opacity-50 text-center py-8">{t('task_no_tasks')}</p> : null}
        
        {filteredTasks.map(task => (
          <div key={task.id} className="neu-panel p-4 flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => toggleTask(task)} className={cn("shrink-0 transition-colors", task.status === "done" ? "text-green-500" : "text-[var(--neu-text-muted)]")}>
                {task.status === "done" ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                <p className={cn("font-medium transition-all", task.status === "done" && "line-through opacity-50")}>{task.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    task.priority === 'critical' ? "bg-red-500/10 text-red-500" :
                    task.priority === 'urgent' ? "bg-orange-500/10 text-orange-500" :
                    task.priority === 'low' ? "bg-blue-500/10 text-blue-500" : "bg-gray-500/10 text-gray-500"
                  )}>
                    {t(`priority_${task.priority}`)}
                  </span>
                  {task.status === "done" && task.completedAt && (
                    <span className="text-[10px] text-[var(--neu-text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(task.completedAt.toDate()).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="neu-button h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={t('delete_task')}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}

const POPULAR_STACKS = ["React", "Next.js", "Vue", "Angular", "Node.js", "Express", "Firebase", "Supabase", "TailwindCSS", "PostgreSQL", "MongoDB", "TypeScript", "Python", "Go"];

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStack, setFilterStack] = useState<string>('all');
  const [filterTasks, setFilterTasks] = useState<'all' | 'with-tasks' | 'no-tasks'>('all');

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [stack, setStack] = useState("");
  const [status, setStatus] = useState("active");

  const handleToggleStack = (tech: string) => {
    const currentStacks = stack.split(',').map(s => s.trim()).filter(Boolean);
    if (currentStacks.includes(tech)) {
      setStack(currentStacks.filter(s => s !== tech).join(', '));
    } else {
      currentStacks.push(tech);
      setStack(currentStacks.join(', '));
    }
  };

  const sortedProjects = useMemo(() => {
    let filtered = [...projects];
    
    // Apply Filters
    if (filterStack !== 'all') {
      filtered = filtered.filter(p => {
        const projStacks = p.techStack ? p.techStack.split(',').map((s: string) => s.trim().toLowerCase()) : [];
        return projStacks.includes(filterStack.toLowerCase());
      });
    }

    if (filterTasks === 'with-tasks') {
      filtered = filtered.filter(p => p.tasksCount > 0);
    } else if (filterTasks === 'no-tasks') {
      filtered = filtered.filter(p => !p.tasksCount || p.tasksCount === 0);
    }

    // Apply Sorting
    return filtered.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name?.toLowerCase() || '';
        valB = b.name?.toLowerCase() || '';
      } else if (sortBy === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else { // date
        valA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        valB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortBy, sortOrder, filterStack, filterTasks]);

  const loadProjects = useCallback(async () => {
    if(!user) return;
    try {
      const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      const projData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const fullData = await Promise.all(projData.map(async (p) => {
        try {
          const tq = query(collection(db, "projects", p.id, "tasks"));
          const tsnap = await getDocs(tq);
          return { ...p, tasksCount: tsnap.size };
        } catch {
          return { ...p, tasksCount: 0 };
        }
      }));
      setProjects(fullData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "projects"), {
        name,
        description: desc,
        url,
        techStack: stack,
        status,
        ownerId: user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Project created");
      setOpen(false);
      setName(""); setDesc(""); setUrl(""); setStack(""); setStatus("active");
      loadProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    }
  };

  const openEdit = (p: any) => {
    setName(p.name || "");
    setDesc(p.description || "");
    setUrl(p.url || "");
    setStack(p.techStack || "");
    setStatus(p.status || "active");
    setEditId(p.id);
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await updateDoc(doc(db, "projects", editId), {
        name,
        description: desc,
        url,
        techStack: stack,
        status,
        updatedAt: serverTimestamp()
      });
      toast.success("Project updated");
      setEditOpen(false);
      setName(""); setDesc(""); setUrl(""); setStack(""); setStatus("active"); setEditId(null);
      loadProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update project");
    }
  };

  const handleDelete = async () => {
    if(!deleteId) return;
    try {
      await deleteDoc(doc(db, "projects", deleteId));
      toast.success("Project deleted");
      setDeleteId(null);
      loadProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('projects')}</h1>
          <p className="text-[var(--neu-text-muted)]">{t('manage_projects_desc')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="neu-button neu-button-accent px-6 py-3 shrink-0 flex items-center justify-center font-semibold text-sm">
             <Plus className="w-4 h-4 mr-2"/> {t('create_project')}
          </DialogTrigger>
          <DialogContent className="border-0 sm:rounded-3xl p-8" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
            <div tabIndex={0} className="opacity-0 w-0 h-0 absolute overflow-hidden pointer-events-none" autoFocus />
            <DialogHeader><DialogTitle className="text-xl font-bold">{t('create_project')}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_name')}</label>
                <input required value={name} onChange={e=>setName(e.target.value)} className="neu-input w-full p-2" placeholder={t('placeholder_name')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_description')}</label>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="neu-input w-full min-h-[70px] p-2 resize-none" placeholder={t('placeholder_desc')} />
              </div>
              
              <div className="space-y-1">
                 <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_url')}</label>
                 <input value={url} onChange={e=>setUrl(e.target.value)} className="neu-input w-full p-2" placeholder="https://" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_stack')}</label>
                <input value={stack} onChange={e=>setStack(e.target.value)} className="neu-input w-full p-2" placeholder={t('placeholder_stack')} />
                <div className="flex flex-wrap gap-2 mt-3 px-1">
                  {POPULAR_STACKS.map(tech => {
                    const isSelected = stack.split(',').map(s=>s.trim()).includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleToggleStack(tech)}
                        className={cn(
                          "text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium",
                          isSelected ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "neu-panel-inset text-[var(--neu-text-muted)] hover:text-[var(--neu-text)]"
                        )}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end pt-2"><button type="submit" className="neu-button neu-button-accent px-6 py-2">{t('btn_save')}</button></div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="border-0 sm:rounded-3xl p-8" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
            <div tabIndex={0} className="opacity-0 w-0 h-0 absolute overflow-hidden pointer-events-none" autoFocus />
            <DialogHeader><DialogTitle className="text-xl font-bold">{t('edit_project')}</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_name')}</label>
                <input required value={name} onChange={e=>setName(e.target.value)} className="neu-input w-full p-2" placeholder={t('placeholder_name')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_description')}</label>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="neu-input w-full min-h-[70px] p-2 resize-none" placeholder={t('placeholder_desc')} />
              </div>
              
              <div className="space-y-1">
                 <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_url')}</label>
                 <input value={url} onChange={e=>setUrl(e.target.value)} className="neu-input w-full p-2" placeholder="https://" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('field_stack')}</label>
                <input value={stack} onChange={e=>setStack(e.target.value)} className="neu-input w-full p-2" placeholder={t('placeholder_stack')} />
                <div className="flex flex-wrap gap-2 mt-3 px-1">
                  {POPULAR_STACKS.map(tech => {
                    const isSelected = stack.split(',').map(s=>s.trim()).includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleToggleStack(tech)}
                        className={cn(
                          "text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium",
                          isSelected ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "neu-panel-inset text-[var(--neu-text-muted)] hover:text-[var(--neu-text)]"
                        )}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-1">
                 <label className="text-xs font-semibold tracking-wide ml-2 uppercase text-[var(--neu-text-muted)]">{t('status_label')}</label>
                 <select value={status} onChange={e=>setStatus(e.target.value)} className="neu-input w-full p-2 appearance-none cursor-pointer">
                   <option value="active" className="bg-[var(--neu-bg)] text-[var(--neu-text)]">{t('status_active')}</option>
                   <option value="archived" className="bg-[var(--neu-bg)] text-[var(--neu-text)]">{t('status_archive')}</option>
                 </select>
              </div>
              <div className="flex justify-end pt-2"><button type="submit" className="neu-button neu-button-accent px-6 py-2">{t('btn_save')}</button></div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteId} onOpenChange={(val) => !val && setDeleteId(null)}>
          <DialogContent className="border-0 sm:rounded-3xl p-8 max-w-sm text-center" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
            <DialogHeader><DialogTitle className="text-xl font-bold flex flex-col items-center gap-4"><Trash2 className="w-12 h-12 text-red-500"/> {t('delete_project_title')}</DialogTitle></DialogHeader>
            <p className="opacity-80 py-4">{t('delete_project_confirm')}</p>
            <div className="flex w-full gap-3 mt-4">
               <button onClick={() => setDeleteId(null)} className="neu-button flex-1 py-2 font-medium">{t('cancel')}</button>
               <button onClick={handleDelete} className="neu-button flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold">{t('delete')}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length >= 2 && (
        <div className="flex flex-col xl:flex-row gap-2 bg-[var(--neu-bg)] px-3 py-2.5 rounded-xl w-full items-start xl:items-center" style={{ boxShadow: 'var(--neu-shadow-inset)' }}>
          <div className="flex flex-wrap items-center gap-1 md:gap-1.5 flex-1 w-full xl:w-auto shrink min-w-0">
            <span className="text-[10px] md:text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider pl-1.5 md:pr-1.5 hidden sm:inline">{t('sorting')}</span>
            <button onClick={() => setSortBy('date')} className={cn("neu-button py-1.5 px-1.5 flex items-center justify-center min-w-[32px] md:min-w-[36px]", sortBy === 'date' && 'neu-button-accent')} title="Дата">
              <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button onClick={() => setSortBy('name')} className={cn("neu-button py-1.5 px-1.5 flex items-center justify-center min-w-[32px] md:min-w-[36px]", sortBy === 'name' && 'neu-button-accent')} title="Название">
              <ArrowDownAZ className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button onClick={() => setSortBy('status')} className={cn("neu-button py-1.5 px-1.5 flex items-center justify-center min-w-[32px] md:min-w-[36px]", sortBy === 'status' && 'neu-button-accent')} title="Статус">
              <BarChart2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="neu-button p-1.5 text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] ml-auto xl:ml-1 shrink-0">
              {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </button>
          </div>

          <div className="hidden xl:block w-px h-6 bg-[var(--neu-text-muted)] opacity-20"></div>

          <div className="flex items-center gap-1.5 md:gap-2 w-full xl:w-auto border-t xl:border-0 border-[var(--neu-text-muted)]/10 pt-2 xl:pt-0 shrink min-w-0">
             <span className="text-[10px] md:text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider pl-1.5">{t('filter')}</span>
             <select 
               value={filterStack} 
               onChange={(e) => setFilterStack(e.target.value)} 
               className="neu-input py-1 px-1.5 md:py-1.5 md:px-2 text-xs md:text-sm min-w-[90px] max-w-[140px] flex-1 xl:flex-none cursor-pointer"
             >
               <option value="all">{t('any_stack')}</option>
               {POPULAR_STACKS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>

             <select 
               value={filterTasks} 
               onChange={(e) => setFilterTasks(e.target.value as any)} 
               className="neu-input py-1 px-1.5 md:py-1.5 md:px-2 text-xs md:text-sm min-w-[100px] flex-1 xl:flex-none cursor-pointer"
             >
               <option value="all">{t('all_tasks')}</option>
               <option value="with-tasks">{t('with_tasks')}</option>
               <option value="no-tasks">{t('without_tasks')}</option>
             </select>
          </div>
        </div>
      )}

      {loading ? <p className="opacity-50">{t('loading')}</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map(p => (
            <div key={p.id} className="neu-panel p-6 flex flex-col h-full group relative transition-all duration-300 hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="neu-panel-inset p-3 rounded-full text-blue-400 shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end sm:flex-row sm:items-center justify-end gap-2 flex-1">
                  <div className={cn(
                    "text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shrink-0",
                    p.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {p.status === 'active' ? t('status_active') : t('status_archive')}
                  </div>
                  <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(p); }} className="neu-button h-8 w-8 text-blue-500 flex items-center justify-center shrink-0" aria-label={t('edit')}><Edit className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(p.id); }} className="neu-button h-8 w-8 text-red-500 flex items-center justify-center shrink-0" aria-label={t('delete_project')}><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
              
            <h3 className="text-xl font-bold mb-2 pr-16 line-clamp-1">{p.name}</h3>
            <p className="text-[var(--neu-text-muted)] text-sm mb-4 line-clamp-2">
              {p.description || t('no_description')}
            </p>
            
            {p.url && (
              <div className="flex items-center gap-2 text-sm text-blue-400 mb-4 opacity-80 hover:opacity-100 min-w-0">
                <Globe className="w-4 h-4 shrink-0" />
                <a href={p.url.startsWith('http') ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" className="truncate block">{p.url}</a>
              </div>
            )}
            
            {p.techStack && (
              <div className="mb-6 pt-4 border-t border-[var(--neu-text-muted)]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-4 h-4 text-[var(--neu-text-muted)]" />
                  <span className="text-xs font-semibold text-[var(--neu-text-muted)] uppercase tracking-wider">{t('field_stack')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.techStack.split(',').map((t: string) => t.trim()).filter(Boolean).map((tech: string, i: number) => (
                    <span key={i} className="text-xs px-2.5 py-1 neu-panel-inset rounded-full opacity-80 break-all">{tech}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto">
              <Dialog>
                <DialogTrigger className="neu-button w-full flex items-center justify-center gap-2 py-3 text-sm font-bold neu-button-accent">
                  <ClipboardList className="w-4 h-4" /> {t('tasks')} {p.tasksCount !== undefined && `(${p.tasksCount})`}
                </DialogTrigger>
                <TaskModal projectId={p.id} projectName={p.name} onTaskChange={loadProjects} />
              </Dialog>
            </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
