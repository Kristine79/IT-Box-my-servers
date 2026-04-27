'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, useAuth } from "@/lib/providers";
import { Trash2, Link as LinkIcon, Ban, Clock, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";

export default function ShareLinksPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if(!user) return;
    try {
      const q = query(collection(db, "shareLinks"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      toast.error("Failed to load share links");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRevoke = async (id: string) => {
    if(!confirm("Revoke this public link immediately?")) return;
    try {
      await updateDoc(doc(db, "shareLinks", id), {
        revokedAt: serverTimestamp()
      });
      toast.success("Link revoked");
      loadData();
    } catch (error) {
      toast.error("Failed to revoke link");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this link log permanently?")) return;
    try {
      await deleteDoc(doc(db, "shareLinks", id));
      toast.success("Deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Public link copied to clipboard");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t('share_links')}</h1>
        <p className="text-[var(--neu-text-muted)]">{t('manage_links_desc')}</p>
      </div>

      {loading ? <p className="opacity-50">{t('loading')}</p> : (
        <div className="space-y-4">
           {links.length === 0 && (
              <div className="neu-panel p-12 text-center text-[var(--neu-text-muted)]">
                 <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>{t('no_share_links')}</p>
              </div>
           )}
           {links.map((l) => {
              const now = new Date();
              const isExpired = l.expiresAt && l.expiresAt.toDate() < now;
              const isRevoked = !!l.revokedAt;
              const isActive = !isExpired && !isRevoked;

              return (
              <div key={l.id} className="neu-panel p-6 px-8 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all duration-300">
                 <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className={`neu-panel-inset p-4 rounded-full shrink-0 hidden sm:block ${isActive ? 'text-green-500' : 'text-[var(--neu-text-muted)]'}`}>
                       <LinkIcon className="w-8 h-8" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                         <span className="text-xs uppercase font-bold tracking-widest bg-[var(--neu-bg)] shadow-[var(--neu-shadow-inset)] px-2 py-1 rounded text-[var(--neu-text-muted)]">
                           {l.resourceType}
                         </span>
                         {isActive ? (
                            <span className="text-xs uppercase font-bold tracking-widest text-green-500 flex items-center gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                               Active
                            </span>
                         ) : isRevoked ? (
                            <span className="text-xs uppercase font-bold tracking-widest text-red-500 flex items-center gap-1">
                               <Ban className="w-3 h-3" />
                               Revoked
                            </span>
                         ) : (
                            <span className="text-xs uppercase font-bold tracking-widest text-orange-500 flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               Expired
                            </span>
                         )}
                       </div>
                       
                       <div className="flex flex-col gap-1 mt-2 text-sm text-[var(--neu-text-muted)]">
                          <div className="flex items-center gap-2">
                            <span className="w-20">Target:</span>
                            <span className="font-mono bg-[var(--neu-bg)] px-2 block truncate max-w-[200px] sm:max-w-xs">{l.resourceId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-20">Expires:</span>
                            <span>{l.expiresAt ? l.expiresAt.toDate().toLocaleString() : 'Never'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-20 flex items-center gap-1"><Eye className="w-3 h-3" /> Views:</span>
                            <span>{l.viewCount || 0}{l.maxViews ? ` / ${l.maxViews}` : ''}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0 lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                    <div className="flex gap-2 w-full justify-end">
                       {isActive && (
                         <>
                            <button className="neu-button neu-button-accent px-4 py-2 shrink-0 flex items-center gap-2 text-sm" onClick={() => copyLink(l.id)}>
                              <ExternalLink className="w-4 h-4" /> Copy Link
                            </button>
                            <button className="neu-button px-4 py-2 text-orange-500 shrink-0 flex items-center gap-2 text-sm" onClick={() => handleRevoke(l.id)}>
                              <Ban className="w-4 h-4" /> Revoke
                            </button>
                         </>
                       )}
                       <button className="neu-button h-10 w-10 text-red-500 shrink-0" onClick={() => handleDelete(l.id)} title="Delete Log">
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
