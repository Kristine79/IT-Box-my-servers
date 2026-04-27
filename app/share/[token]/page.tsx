'use client';

import { useEffect, useState } from "react";
import { doc, getDoc, collection, setDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/providers";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShieldAlert, FileJson, Clock, Eye, AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";

function generateLogId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    async function loadShared() {
      try {
        const linkDoc = await getDoc(doc(db, "shareLinks", token));
        
        if (!linkDoc.exists()) {
          setError("Ссылка не найдена, истекла или отозвана.");
          setLoading(false);
          return;
        }

        const linkData = linkDoc.data();
        
        // Check if expired
        if (linkData.expiresAt && linkData.expiresAt.toDate() < new Date()) {
          setError("Срок действия ссылки истек.");
          setLoading(false);
          return;
        }

        // Check if revoked
        if (linkData.revokedAt) {
          setError("Ссылка была отозвана владельцем.");
          setLoading(false);
          return;
        }

        // Check max views
        const currentViews = linkData.viewCount || 0;
        if (linkData.maxViews && currentViews >= linkData.maxViews) {
          setError("Достигнут лимит просмотров.");
          setLoading(false);
          return;
        }

        setData(linkData);
        setViewCount(currentViews + 1);

        // Increment view count
        await updateDoc(doc(db, "shareLinks", token), {
          viewCount: increment(1)
        });

        // Record log asynchronously
        fetch('https://api.ipify.org?format=json')
          .then(r => r.json())
          .then(async ({ ip }) => {
            const logId = generateLogId();
            await setDoc(doc(db, `shareLinks/${token}/logs`, logId), {
              ip,
              userAgent: navigator.userAgent,
              accessedAt: serverTimestamp()
            });
          }).catch(console.error);

      } catch (err) {
        setError("Ссылка не найдена, истекла или отозвана.");
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
       loadShared();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neu-bg)]">
        <div className="neu-panel p-8 text-center">
          <div className="w-8 h-8 border-2 border-[var(--neu-accent)]/30 border-t-[var(--neu-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--neu-text-muted)]">Загрузка защищенного доступа...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--neu-bg)] space-y-4 p-4">
        <div className="neu-panel p-12 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">{error}</h1>
          <p className="text-[var(--neu-text-muted)]">Этот ресурс больше не доступен.</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Никогда';
    return timestamp.toDate().toLocaleString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-[var(--neu-bg)] p-4 sm:p-8 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[var(--neu-text-muted)]">
              <Eye className="w-3.5 h-3.5" />
              <span>Просмотров: {viewCount}{data.maxViews ? ` / ${data.maxViews}` : ''}</span>
            </div>
            {data.expiresAt && (
              <div className="flex items-center gap-1.5 text-[var(--neu-text-muted)]">
                <Clock className="w-3.5 h-3.5" />
                <span>Истекает: {formatDate(data.expiresAt)}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className="uppercase tracking-widest text-[10px]">{data.resourceType}</Badge>
        </div>

        {/* Main Card */}
        <div className="neu-panel p-6 sm:p-8">
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[var(--neu-text-muted)]/10 pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{data.snapshot?.name || 'Shared Resource'}</h1>
                <div className="flex items-center gap-2 text-sm text-[var(--neu-text-muted)]">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Только для чтения. Пароли и секреты скрыты.</span>
                </div>
              </div>
           </div>
           
           <div className="space-y-3">
              {Object.entries(data.snapshot || {}).map(([k, v]: [string, any]) => {
                if (k.includes('Id') || k.includes('At') || k === 'ownerId') return null;
                if (k === 'password' || k === 'passwordEncrypted' || k === 'iv' || k === 'authTag') return null;
                if (!v || v === '••••••••••••') return null;
                
                return (
                  <div key={k} className="neu-panel-inset p-4 rounded-xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--neu-text-muted)] mb-2">
                      {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <div className="text-sm font-medium break-words">
                       {(typeof v === 'string' && v.startsWith('http')) ? (
                         <a href={v} target="_blank" rel="noopener noreferrer" className="text-[var(--neu-accent)] hover:underline inline-flex items-center gap-1">
                           {v} <ExternalLink className="w-3 h-3" />
                         </a>
                       ) : (
                         <span className="text-[var(--neu-text)]">{v}</span>
                       )}
                    </div>
                  </div>
                );
              })}
           </div>
           
           {/* Password Placeholder for Credentials */}
           {data.resourceType === 'credential' && (
             <div className="mt-4 neu-panel-inset p-4 rounded-xl border border-amber-500/20">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">
                 <AlertTriangle className="w-3.5 h-3.5" />
                 Пароль / Секрет
               </div>
               <p className="text-sm text-[var(--neu-text-muted)]">
                 Пароль не отображается в целях безопасности. 
                 Свяжитесь с владельцем через безопасный канал.
               </p>
             </div>
           )}
           
           <div className="mt-8 pt-6 border-t border-[var(--neu-text-muted)]/10 text-center text-xs text-[var(--neu-text-muted)] flex items-center justify-center gap-2">
              <FileJson className="w-4 h-4" />
              StackBox Secure Sharing • Создано {data.createdAt?.toDate().toLocaleString('ru-RU') || 'недавно'}
           </div>
        </div>
      </div>
    </div>
  );
}
