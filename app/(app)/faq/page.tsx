'use client';

import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/providers';
import { defaultFAQ } from '@/lib/contentDefaults';

export default function FAQPage() {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState(i18n.language === 'en' ? defaultFAQ.en : defaultFAQ.ru);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'faq')).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as typeof defaultFAQ;
        const langFaqs = i18n.language === 'en' ? data.en : data.ru;
        if (langFaqs && langFaqs.length > 0) setFaqs(langFaqs);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [i18n.language]);

  if (loading) return <div className="p-8 opacity-50">{t('loading')}</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-panel p-8 md:p-10 rounded-3xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="neu-panel-inset p-3 rounded-full text-blue-400 shrink-0">
             <HelpCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-[var(--neu-text)]">{t('faq')}</h1>
            <p className="text-[var(--neu-text-muted)] text-sm uppercase tracking-widest mt-1">
              {i18n.language === 'en' ? "Questions & Answers" : "Ответы на вопросы"}
            </p>
          </div>
        </div>
        <p className="text-[var(--neu-text-muted)] leading-relaxed text-base md:text-lg">
          {i18n.language === 'en' 
            ? "Here are answers to the most common questions about the features, security, and architecture of the StackBox platform." 
            : "Здесь собраны ответы на самые частые вопросы о возможностях, безопасности и устройстве платформы StackBox."}
        </p>
      </motion.div>

      {/* FAQ Items */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--neu-text)] px-2">
          {i18n.language === 'en' ? "Q&A" : "Вопросы и ответы"}
        </h2>
        <div className="grid gap-6">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="neu-panel p-6 md:p-8 rounded-3xl flex flex-col items-start"
            >
              <h3 className="text-lg font-bold text-[var(--neu-text)] mb-3">{faq.q}</h3>
              <p className="text-[var(--neu-text-muted)] leading-relaxed text-sm md:text-base">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
