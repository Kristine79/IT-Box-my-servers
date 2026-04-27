'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link2, Clock, Eye, Copy, CheckCircle2, Shield, AlertTriangle } from "lucide-react";
import { db, useAuth } from "@/lib/providers";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

const EXPIRY_OPTIONS = [
  { label: '1 час', value: 1, unit: 'hour' },
  { label: '24 часа', value: 24, unit: 'hour' },
  { label: '7 дней', value: 7, unit: 'day' },
  { label: '30 дней', value: 30, unit: 'day' },
];

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'server' | 'credential' | 'project' | 'service';
  resourceData: any;
  resourceId: string;
}

export function ShareModal({ isOpen, onClose, resourceType, resourceData, resourceId }: ShareModalProps) {
  const { user } = useAuth();
  const [selectedExpiry, setSelectedExpiry] = useState(EXPIRY_OPTIONS[1]);
  const [maxViews, setMaxViews] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    if (!user) {
      toast.error("Необходима авторизация");
      return;
    }

    setIsCreating(true);
    try {
      // Calculate expiration time
      const now = new Date();
      let expiresAt: Date | null = null;
      
      if (selectedExpiry.value > 0) {
        expiresAt = new Date(now);
        if (selectedExpiry.unit === 'hour') {
          expiresAt.setHours(expiresAt.getHours() + selectedExpiry.value);
        } else {
          expiresAt.setDate(expiresAt.getDate() + selectedExpiry.value);
        }
      }

      // Create clean snapshot without sensitive data
      const snapshot: any = {};
      
      if (resourceType === 'server') {
        snapshot.name = resourceData.name;
        snapshot.ipAddress = resourceData.ipAddress;
        snapshot.provider = resourceData.provider;
        snapshot.os = resourceData.os;
        snapshot.notes = resourceData.notes;
        snapshot.projectName = resourceData.projectName;
      } else if (resourceType === 'credential') {
        snapshot.name = resourceData.name;
        snapshot.type = resourceData.type;
        snapshot.username = resourceData.username;
        snapshot.resourceType = resourceData.resourceType;
        snapshot.resourceName = resourceData.resourceName;
        // PASSWORD IS NEVER INCLUDED!
        snapshot.password = '••••••••••••';
        snapshot.notes = resourceData.notes;
      } else if (resourceType === 'project') {
        snapshot.name = resourceData.name;
        snapshot.description = resourceData.description;
        snapshot.url = resourceData.url;
        snapshot.techStack = resourceData.techStack;
        snapshot.status = resourceData.status;
      } else if (resourceType === 'service') {
        snapshot.name = resourceData.name;
        snapshot.url = resourceData.url;
        snapshot.port = resourceData.port;
        snapshot.serverName = resourceData.serverName;
        snapshot.notes = resourceData.notes;
      }

      // Create share link document
      const shareDoc = await addDoc(collection(db, "shareLinks"), {
        resourceType,
        resourceId,
        ownerId: user.uid,
        snapshot,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        maxViews: maxViews > 0 ? maxViews : null,
        viewCount: 0,
        revokedAt: null,
      });

      const link = `${window.location.origin}/share/${shareDoc.id}`;
      setShareLink(link);
      toast.success("Ссылка создана успешно!");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось создать ссылку");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    setMaxViews(0);
    setSelectedExpiry(EXPIRY_OPTIONS[1]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="border-0 sm:rounded-3xl p-0 max-w-md overflow-hidden" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="neu-panel-inset p-2 rounded-lg">
                <Link2 className="w-5 h-5 text-[var(--neu-accent)]" />
              </div>
              Поделиться доступом
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!shareLink ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Resource Info */}
                <div className="neu-panel-inset p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--neu-accent)]/10 flex items-center justify-center text-[var(--neu-accent)]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{resourceData?.name}</p>
                      <p className="text-xs text-[var(--neu-text-muted)] capitalize">{resourceType}</p>
                    </div>
                  </div>
                </div>

                {/* Expiry Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wide uppercase text-[var(--neu-text-muted)] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Срок действия
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {EXPIRY_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setSelectedExpiry(option)}
                        className={`neu-button py-2 px-1 text-xs font-medium transition-all ${
                          selectedExpiry.label === option.label
                            ? 'neu-button-accent'
                            : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Views */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wide uppercase text-[var(--neu-text-muted)] flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Лимит просмотров (0 = безлимит)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={maxViews}
                      onChange={(e) => setMaxViews(Math.max(0, parseInt(e.target.value) || 0))}
                      className="neu-input w-20 py-2.5 text-center"
                    />
                    <span className="text-sm text-[var(--neu-text-muted)]">просмотров</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Пароли и секреты не включаются в ссылку. Получатель увидит только метаданные.
                  </p>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateLink}
                  disabled={isCreating}
                  className="neu-button neu-button-accent w-full py-3 font-semibold flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Создать защищенную ссылку
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Success State */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Ссылка готова!</h3>
                  <p className="text-sm text-[var(--neu-text-muted)]">
                    Действует: {selectedExpiry.label}
                    {maxViews > 0 && ` • Макс. ${maxViews} просмотров`}
                  </p>
                </div>

                {/* Link Display */}
                <div className="neu-panel-inset p-4 rounded-xl">
                  <p className="text-xs text-[var(--neu-text-muted)] mb-2 uppercase tracking-wide">Ссылка для доступа</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs break-all font-mono bg-[var(--neu-bg)] p-2 rounded">
                      {shareLink}
                    </code>
                    <button
                      onClick={handleCopy}
                      className={`neu-button p-3 shrink-0 transition-all ${copied ? 'text-green-500' : ''}`}
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="neu-panel-inset p-3 rounded-lg text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-[var(--neu-accent)]" />
                    <p className="text-[var(--neu-text-muted)]">Истекает через</p>
                    <p className="font-semibold">{selectedExpiry.label}</p>
                  </div>
                  <div className="neu-panel-inset p-3 rounded-lg text-center">
                    <Eye className="w-4 h-4 mx-auto mb-1 text-[var(--neu-accent)]" />
                    <p className="text-[var(--neu-text-muted)]">Лимит просмотров</p>
                    <p className="font-semibold">{maxViews > 0 ? maxViews : '∞'}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="neu-button w-full py-3 font-semibold"
                >
                  Готово
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
