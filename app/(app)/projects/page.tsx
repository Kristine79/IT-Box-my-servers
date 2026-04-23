'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, orderBy, onSnapshot } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, FolderKanban, Globe, Code2, ClipboardList, CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications";

function TaskModal({ projectId, projectName }: { projectId: string; projectName: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [tasks, setTasks] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <DialogContent className="border-0 sm:rounded-3xl p-8 max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-[var(--neu-accent)]" />
          {t('tasks')}: {projectName}
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
        {loading ? <p className="opacity-50 text-center">{t('loading')}</p> : null}
        {!loading && tasks.length === 0 ? <p className="opacity-50 text-center py-8">{t('task_no_tasks')}</p> : null}
        
        {tasks.map(task => (
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

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [stack, setStack] = useState("");
  const [status, setStatus] = useState("active");

  const loadProjects = useCallback(async () => {
    if(!user) return;
    try {
      const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      sendNotification({
        title: t('notif_project_created'),
        message: name,
        type: 'info',
        link: '/projects'
      });
      setOpen(false);
      setName(""); setDesc(""); setUrl(""); setStack(""); setStatus("active");
      loadProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("Project deleted");
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
              </div>
              <div className="flex justify-end pt-2"><button type="submit" className="neu-button neu-button-accent px-6 py-2">{t('btn_save')}</button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="opacity-50">{t('loading')}</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="neu-panel p-6 flex flex-col h-full group relative transition-all duration-300 hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="neu-panel-inset p-3 rounded-full text-blue-400 shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div className="relative h-8 flex items-center justify-end flex-1">
                  <div className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full shrink-0 transition-all duration-300 absolute right-0",
                    p.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500",
                    "group-hover:opacity-0 group-hover:scale-95"
                  )}>
                    {p.status === 'active' ? t('status_active') : t('status_archive')}
                  </div>
                  <div className="flex gap-1 absolute right-0 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <button className="neu-button h-8 w-8 text-blue-500" aria-label="Редактировать"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(p.id)} className="neu-button h-8 w-8 text-red-500" aria-label={t('delete_project')}><Trash2 className="w-4 h-4"/></button>
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
                  <ClipboardList className="w-4 h-4" /> {t('tasks')}
                </DialogTrigger>
                <TaskModal projectId={p.id} projectName={p.name} />
              </Dialog>
            </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
