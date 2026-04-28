'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, EyeOff, Copy, KeyRound, ShieldCheck, Database, TerminalSquare, Key, Globe, Search, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/lib/notifications";
import { ShareModal } from "@/components/ShareModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useUndoableDelete } from "@/components/UndoToast";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { SearchFilter, useFilteredItems, usePagination } from "@/components/SearchFilter";

export default function CredentialsPage() {
  const { t } = useTranslation();
  const { user, planLimits } = useAuth();
  const { sendNotification } = useNotifications();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeTitle, setUpgradeTitle] = useState('');
  const [upgradeDesc, setUpgradeDesc] = useState('');
  const [upgradeTarget, setUpgradeTarget] = useState<'standard' | 'premium'>('standard');
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Decryption state tracking
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
  const [loadingDecryption, setLoadingDecryption] = useState<Record<string, boolean>>({});

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resourceType, setResourceType] = useState("none");
  const [resourceId, setResourceId] = useState("");

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCredential, setShareCredential] = useState<any>(null);
  const [notes, setNotes] = useState("");

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCredentials = useFilteredItems(
    credentials,
    searchQuery,
    (c) => `${c.name} ${c.username || ''} ${c.type || ''}`
  );
  const { paginatedItems, hasMore, loadMore, reset } = usePagination(filteredCredentials, 12);

  const loadData = useCallback(async () => {
    if(!user) return;
    try {
      const q = query(collection(db, "credentials"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      setCredentials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!password) {
      toast.error("Password is required");
      return;
    }
    try {
      // 1. Encrypt via API
      const res = await fetch('/api/crypto/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: password })
      });
      const encData = await res.json();
      if(encData.error) throw new Error(encData.error);

      // 2. Save to Firestore
      await addDoc(collection(db, "credentials"), {
        name,
        type,
        username,
        passwordEncrypted: encData.encrypted,
        iv: encData.iv,
        authTag: encData.authTag,
        resourceType,
        resourceId,
        notes,
        ownerId: user!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Credential created and securely encrypted");
      setOpen(false);
      setName(""); setType("OTHER"); setUsername(""); setPassword(""); setResourceType("none"); setResourceId(""); setNotes("");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create credential");
    }
  };

  const handleDecrypt = async (cred: any) => {
    if (decryptedPasswords[cred.id]) {
      // Already decrypted, hide it
      const newDps = {...decryptedPasswords};
      delete newDps[cred.id];
      setDecryptedPasswords(newDps);
      return;
    }

    setLoadingDecryption(prev => ({...prev, [cred.id]: true}));
    try {
      const res = await fetch('/api/crypto/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          encrypted: cred.passwordEncrypted,
          iv: cred.iv,
          authTag: cred.authTag
        })
      });
      const decData = await res.json();
      if(decData.error) throw new Error(decData.error);
      
      setDecryptedPasswords(prev => ({...prev, [cred.id]: decData.decrypted}));
    } catch(err: any) {
      toast.error("Decryption failed. Check server setup.");
    } finally {
      setLoadingDecryption(prev => ({...prev, [cred.id]: false}));
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name || '');
    setDeleteDialogOpen(true);
  };

  const { showUndoToast } = useUndoableDelete();

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const idToDelete = deleteTargetId;
    const nameToDelete = deleteTargetName;
    const itemToRestore = credentials.find(c => c.id === idToDelete);
    
    // Close dialog and remove from UI immediately
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setCredentials(prev => prev.filter(c => c.id !== idToDelete));
    
    // Show undo toast
    showUndoToast({
      itemName: nameToDelete,
      onDelete: async () => {
        // Actually delete from Firestore after delay
        await deleteDoc(doc(db, "credentials", idToDelete));
        toast.success(t('credential_deleted', 'Доступ удалён'));
      },
      onUndo: async () => {
        // Restore to UI (no Firestore action needed since we didn't delete yet)
        if (itemToRestore) {
          setCredentials(prev => [...prev, itemToRestore].sort((a, b) => 
            new Date(b.createdAt?.seconds || 0).getTime() - new Date(a.createdAt?.seconds || 0).getTime()
          ));
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('toast_copied'));
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'SSH': return <TerminalSquare className="w-5 h-5 text-gray-400" />;
      case 'DB': return <Database className="w-5 h-5 text-purple-400" />;
      case 'WEB_PANEL': return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'API_KEY': return <Key className="w-5 h-5 text-amber-500" />;
      default: return <KeyRound className="w-5 h-5 text-[var(--neu-text-muted)]" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              {t('credentials')}
           </h1>
           <p className="text-[var(--neu-text-muted)] flex items-center gap-2 text-sm">
             <ShieldCheck className="w-4 h-4 text-green-500" />
             {t('secure_storage')}
           </p>
        </div>
        <div className="flex gap-3 items-center">
          <SearchFilter
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); reset(); }}
            placeholder={t('search_credentials', 'Поиск доступов...')}
            className="w-full sm:w-64"
          />
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          title={upgradeTitle}
          description={upgradeDesc}
          targetPlan={upgradeTarget}
        />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className="neu-button neu-button-accent px-6 py-3 shrink-0 shadow-rose-500/30 flex items-center font-semibold"
            onClick={(e) => {
              if (credentials.length >= planLimits.maxCredentials) {
                e.preventDefault();
                setUpgradeTitle(t('limit_credentials_title', 'Достигнут лимит доступов'));
                setUpgradeDesc(t('limit_credentials_desc', 'В бесплатном тарифе можно хранить не больше {{max}} доступов. Переходите на Standard — до 50 доступов.', { max: planLimits.maxCredentials }));
                setUpgradeTarget('standard');
                setUpgradeOpen(true);
              }
            }}
          >
             <Plus className="w-4 h-4 mr-2"/> {t('add_credential')}
          </DialogTrigger>
          <DialogContent className="border-0 sm:rounded-3xl p-6 max-w-2xl" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
            <DialogHeader><DialogTitle className="text-2xl font-bold flex items-center gap-2"><Lock className="w-5 h-5"/> {t('add_credential')}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4 pb-12 sm:pb-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label htmlFor="cred-name" className="text-sm font-semibold tracking-wide uppercase text-[var(--neu-text-muted)]">{t('field_name')}</label>
                   <input id="cred-name" required value={name} onChange={e=>setName(e.target.value)} className="neu-input w-full py-2.5" placeholder="e.g. Prod DB Root" />
                 </div>
                 <div className="space-y-1.5">
                   <label htmlFor="cred-type" className="text-sm font-semibold tracking-wide uppercase text-[var(--neu-text-muted)]">{t('field_type')}</label>
                   <select 
                      id="cred-type"
                      value={type} 
                      onChange={e=>setType(e.target.value)}
                      className="neu-input w-full py-2.5 appearance-none cursor-pointer"
                    >
                      <option value="SSH" className="bg-[var(--neu-bg)]">SSH</option>
                      <option value="FTP" className="bg-[var(--neu-bg)]">FTP</option>
                      <option value="DB" className="bg-[var(--neu-bg)]">Database</option>
                      <option value="WEB_PANEL" className="bg-[var(--neu-bg)]">Web Panel</option>
                      <option value="API_KEY" className="bg-[var(--neu-bg)]">API Key</option>
                      <option value="OTHER" className="bg-[var(--neu-bg)]">Other</option>
                   </select>
                 </div>
                 <div className="space-y-1.5">
                   <label htmlFor="cred-username" className="text-sm font-semibold tracking-wide uppercase text-[var(--neu-text-muted)]">{t('field_username')}</label>
                   <input id="cred-username" value={username} onChange={e=>setUsername(e.target.value)} className="neu-input w-full py-2.5" placeholder="root" />
                 </div>
                 <div className="space-y-1.5">
                   <label htmlFor="cred-password" className="text-sm font-semibold tracking-wide uppercase text-[var(--neu-text-muted)] flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0"/> {t('field_password')}</label>
                   <input id="cred-password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="neu-input w-full py-2.5" placeholder="••••••••••••" />
                 </div>
               </div>

              <div className="flex justify-end pt-2"><button type="submit" className="neu-button bg-rose-500 text-white shadow-rose-500/20 px-8 py-3 font-bold hover:shadow-rose-500/40">{t('btn_encrypt_save')}</button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareCredential(null);
        }}
        resourceType="credential"
        resourceData={shareCredential || {}}
        resourceId={shareCredential?.id || ''}
      />

      {loading ? <SkeletonGrid count={6} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {credentials.length === 0 && (
              <div className="neu-panel p-12 text-center text-[var(--neu-text-muted)] col-span-full">
                 <KeyRound className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>{t('no_credentials')}</p>
              </div>
           )}
           {paginatedItems.map((c) => (
              <div key={c.id} className="neu-panel p-6 flex flex-col h-full group relative transition-all duration-300">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="neu-panel-inset p-2.5 rounded-full">
                          {getTypeIcon(c.type)}
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--neu-text-muted)] bg-[var(--neu-bg)] px-2 py-1 rounded shadow-[var(--neu-shadow-inset)]">{c.type}</span>
                    </div>
                    
                    <div className="flex gap-2">
                       <button 
                          className="neu-button h-8 w-8 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                          onClick={() => {
                            if (!planLimits.canShare) {
                              setUpgradeTitle(t('sharing_locked_title', 'Шаринг недоступен'));
                              setUpgradeDesc(t('sharing_locked_desc', 'Делиться настройками с коллегами можно в тарифах Standard (только чтение) и Premium (гибкие права).'));
                              setUpgradeTarget('standard');
                              setUpgradeOpen(true);
                              return;
                            }
                            setShareCredential(c);
                            setShareModalOpen(true);
                          }}
                          aria-label="Поделиться доступом"
                        >
                          <Share2 className="w-4 h-4" />
                       </button>
                       <button className="neu-button h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(c.id, c.name)} aria-label={t('delete_credential')}>
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 
                 <h3 className="text-lg font-bold mb-1 truncate">{c.name}</h3>
                 {c.username && <p className="text-[var(--neu-text-muted)] text-sm mb-4 font-mono truncate">{c.username}</p>}
                 
                 <div className="mt-auto pt-4">
                    <div className="neu-panel-inset p-3 pl-4 rounded-xl flex flex-row items-center justify-between">
                       <div className="flex-1 truncate pr-2">
                          {decryptedPasswords[c.id] ? (
                             <span className="font-mono text-sm tracking-wide">{decryptedPasswords[c.id]}</span>
                          ) : (
                             <span className="text-[var(--neu-text-muted)] tracking-[0.2em] text-lg leading-none opacity-50 relative top-[3px]">••••••••</span>
                          )}
                       </div>
                       <div className="flex gap-2 shrink-0">
                          {decryptedPasswords[c.id] && (
                             <button className="neu-button h-8 w-8 text-blue-400" onClick={() => copyToClipboard(decryptedPasswords[c.id])} aria-label={t('copy_password')}>
                                <Copy className="w-4 h-4" />
                             </button>
                          )}
                          <button className="neu-button h-8 w-8 text-[var(--neu-accent)]" onClick={() => handleDecrypt(c)} disabled={loadingDecryption[c.id]} aria-label={t('toggle_visibility')}>
                             {loadingDecryption[c.id] ? <span className="animate-spin text-xs">...</span> : decryptedPasswords[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           ))}
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
