'use client';

import { useState, useEffect } from 'react';
import { useAuth, db } from '@/lib/providers';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, FileText, HelpCircle, CreditCard, Save, Loader2, Globe, Plus, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { defaultAbout, defaultFAQ, defaultPricing } from '@/lib/contentDefaults';
import Link from 'next/link';

type Tab = 'about' | 'faq' | 'pricing';

type Lang = 'en' | 'ru';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [lang, setLang] = useState<Lang>('ru');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [about, setAbout] = useState(defaultAbout);
  const [faq, setFaq] = useState(defaultFAQ);
  const [pricing, setPricing] = useState(defaultPricing);

  useEffect(() => {
    async function load() {
      try {
        const [aboutSnap, faqSnap, pricingSnap] = await Promise.all([
          getDoc(doc(db, 'siteContent', 'about')),
          getDoc(doc(db, 'siteContent', 'faq')),
          getDoc(doc(db, 'siteContent', 'pricing'))
        ]);
        if (aboutSnap.exists()) setAbout(aboutSnap.data() as typeof defaultAbout);
        if (faqSnap.exists()) setFaq(faqSnap.data() as typeof defaultFAQ);
        if (pricingSnap.exists()) setPricing(pricingSnap.data() as typeof defaultPricing);
      } catch (e) {
        console.error('Failed to load content:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const save = async (key: Tab, data: any) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteContent', key), { ...data, updatedAt: serverTimestamp(), updatedBy: user?.uid || 'unknown' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: Tab, langKey: Lang, path: string[], value: any) => {
    if (section === 'about') {
      setAbout(prev => {
        const next = { ...prev };
        let target: any = next[langKey];
        for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
        target[path[path.length - 1]] = value;
        return next;
      });
    } else if (section === 'faq') {
      setFaq(prev => {
        const next = { ...prev };
        next[langKey] = value;
        return next;
      });
    } else if (section === 'pricing') {
      setPricing(prev => {
        const next = { ...prev };
        let target: any = next[langKey];
        for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
        target[path[path.length - 1]] = value;
        return next;
      });
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'about', label: 'About', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'pricing', label: 'Pricing', icon: CreditCard }
  ];

  if (!user || user.isAnonymous) {
    return (
      <div className="max-w-2xl mx-auto mt-20 neu-panel p-10 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-[var(--neu-accent)] opacity-60" />
        <h2 className="text-xl font-bold mb-2">Доступ ограничен</h2>
        <p className="text-[var(--neu-text-muted)] mb-6">Админ-панель доступна только авторизованным пользователям.</p>
        <Link href="/" className="neu-button-accent px-6 py-3 font-bold inline-block">
          На главную
        </Link>
      </div>
    );
  }

  if (loading) return <div className="p-8 opacity-50"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-[var(--neu-accent)]" />
        <h1 className="text-2xl font-bold">Админ-панель контента</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {(['ru', 'en'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "neu-button px-4 py-2 text-sm font-bold",
              lang === l ? "neu-button-accent" : ""
            )}
          >
            <Globe className="w-4 h-4 mr-1.5 inline" />
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 border-b border-[var(--neu-border)]/20 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "neu-button px-4 py-2.5 text-sm font-bold flex items-center gap-2",
              activeTab === tab.id ? "neu-button-accent" : ""
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'about' && (
          <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Section title="Вступление" icon={FileText}>
              <label className="text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider block mb-2">Краткое описание</label>
              <textarea
                value={about[lang].intro}
                onChange={e => updateField('about', lang, ['intro'], e.target.value)}
                className="neu-input w-full h-20 text-sm resize-none"
              />
              <label className="text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider block mb-2 mt-4">Что такое StackBox?</label>
              <textarea
                value={about[lang].whatIs}
                onChange={e => updateField('about', lang, ['whatIs'], e.target.value)}
                className="neu-input w-full h-24 text-sm resize-none"
              />
            </Section>

            <Section title="Модули" icon={FileText}>
              {about[lang].modules.map((m, i) => (
                <div key={i} className="neu-panel p-4 mb-3 space-y-2">
                  <input
                    value={m.title}
                    onChange={e => {
                      const next = { ...about };
                      next[lang].modules[i].title = e.target.value;
                      setAbout(next);
                    }}
                    className="neu-input w-full text-sm font-bold"
                    placeholder="Название"
                  />
                  <textarea
                    value={m.desc}
                    onChange={e => {
                      const next = { ...about };
                      next[lang].modules[i].desc = e.target.value;
                      setAbout(next);
                    }}
                    className="neu-input w-full h-16 text-sm resize-none"
                    placeholder="Описание"
                  />
                </div>
              ))}
            </Section>

            <Section title="Возможности" icon={FileText}>
              {about[lang].features.map((f, i) => (
                <div key={i} className="neu-panel p-4 mb-3 space-y-2">
                  <input
                    value={f.title}
                    onChange={e => {
                      const next = { ...about };
                      next[lang].features[i].title = e.target.value;
                      setAbout(next);
                    }}
                    className="neu-input w-full text-sm font-bold"
                    placeholder="Название"
                  />
                  <textarea
                    value={f.desc}
                    onChange={e => {
                      const next = { ...about };
                      next[lang].features[i].desc = e.target.value;
                      setAbout(next);
                    }}
                    className="neu-input w-full h-12 text-sm resize-none"
                    placeholder="Описание"
                  />
                </div>
              ))}
            </Section>

            <Section title="Целевая аудитория" icon={FileText}>
              {about[lang].audience.map((a, i) => (
                <div key={i} className="neu-panel p-4 mb-3 space-y-2">
                  <input
                    value={a.title}
                    onChange={e => {
                      const next = { ...about };
                      next[lang].audience[i].title = e.target.value;
                      setAbout(next);
                    }}
                    className="neu-input w-full text-sm font-bold"
                    placeholder="Название"
                  />
                  <textarea
                    value={a.desc}
                    onChange={e => {
                      const next = { ...about };
                      next[lang].audience[i].desc = e.target.value;
                      setAbout(next);
                    }}
                    className="neu-input w-full h-20 text-sm resize-none"
                    placeholder="Описание"
                  />
                </div>
              ))}
            </Section>

            <SaveButton saving={saving} onClick={() => save('about', about)} />
          </motion.div>
        )}

        {activeTab === 'faq' && (
          <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {faq[lang].map((item, i) => (
              <div key={i} className="neu-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider">Вопрос #{i + 1}</span>
                  <button
                    onClick={() => {
                      const next = { ...faq };
                      next[lang] = next[lang].filter((_, idx) => idx !== i);
                      setFaq(next);
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  value={item.q}
                  onChange={e => {
                    const next = { ...faq };
                    next[lang][i].q = e.target.value;
                    setFaq(next);
                  }}
                  className="neu-input w-full text-sm font-bold"
                  placeholder="Вопрос"
                />
                <textarea
                  value={item.a}
                  onChange={e => {
                    const next = { ...faq };
                    next[lang][i].a = e.target.value;
                    setFaq(next);
                  }}
                  className="neu-input w-full h-24 text-sm resize-none"
                  placeholder="Ответ"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const next = { ...faq };
                next[lang] = [...next[lang], { q: '', a: '' }];
                setFaq(next);
              }}
              className="neu-button px-4 py-2 text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить вопрос
            </button>
            <SaveButton saving={saving} onClick={() => save('faq', faq)} />
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {pricing[lang].plans.map((plan, i) => (
              <div key={plan.id} className="neu-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--neu-text-muted)] uppercase tracking-wider">Тариф #{i + 1}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    value={plan.name}
                    onChange={e => {
                      const next = { ...pricing };
                      next[lang].plans[i].name = e.target.value;
                      setPricing(next);
                    }}
                    className="neu-input w-full text-sm font-bold"
                    placeholder="Название"
                  />
                  <input
                    value={plan.price}
                    onChange={e => {
                      const next = { ...pricing };
                      next[lang].plans[i].price = e.target.value;
                      setPricing(next);
                    }}
                    className="neu-input w-full text-sm"
                    placeholder="Цена"
                  />
                  <input
                    value={plan.duration}
                    onChange={e => {
                      const next = { ...pricing };
                      next[lang].plans[i].duration = e.target.value;
                      setPricing(next);
                    }}
                    className="neu-input w-full text-sm"
                    placeholder="Период"
                  />
                </div>
                <div className="space-y-2">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex gap-2">
                      <input
                        value={f}
                        onChange={e => {
                          const next = { ...pricing };
                          next[lang].plans[i].features[fi] = e.target.value;
                          setPricing(next);
                        }}
                        className="neu-input flex-1 text-sm"
                        placeholder="Фича"
                      />
                      <button
                        onClick={() => {
                          const next = { ...pricing };
                          next[lang].plans[i].features = next[lang].plans[i].features.filter((_, idx) => idx !== fi);
                          setPricing(next);
                        }}
                        className="text-red-500 hover:text-red-600 transition-colors px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const next = { ...pricing };
                      next[lang].plans[i].features = [...next[lang].plans[i].features, ''];
                      setPricing(next);
                    }}
                    className="neu-button px-3 py-1 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" /> Фича
                  </button>
                </div>
              </div>
            ))}

            <Section title="Enterprise" icon={CreditCard}>
              <input
                value={pricing[lang].enterpriseTitle}
                onChange={e => updateField('pricing', lang, ['enterpriseTitle'], e.target.value)}
                className="neu-input w-full text-sm font-bold mb-2"
                placeholder="Заголовок"
              />
              <textarea
                value={pricing[lang].enterpriseDesc}
                onChange={e => updateField('pricing', lang, ['enterpriseDesc'], e.target.value)}
                className="neu-input w-full h-16 text-sm resize-none mb-2"
                placeholder="Описание"
              />
              <input
                value={pricing[lang].contactSales}
                onChange={e => updateField('pricing', lang, ['contactSales'], e.target.value)}
                className="neu-input w-full text-sm"
                placeholder="Текст кнопки"
              />
            </Section>

            <SaveButton saving={saving} onClick={() => save('pricing', pricing)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="neu-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[var(--neu-accent)]" />
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="neu-button-accent px-6 py-3 font-bold flex items-center gap-2 w-full justify-center"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? 'Сохранение...' : 'Сохранить'}
    </button>
  );
}
