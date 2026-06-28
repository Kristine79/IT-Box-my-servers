'use client';

import Link from 'next/link';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface UpsellBannerProps {
  show: boolean;
  onDismiss: () => void;
}

export function UpsellBanner({ show, onDismiss }: UpsellBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Unlock Full Power</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Upgrade to Standard for unlimited projects, priority support, and advanced security features.
              </p>
              <div className="flex gap-2">
                <Link href="/pricing">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                    View Plans
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
