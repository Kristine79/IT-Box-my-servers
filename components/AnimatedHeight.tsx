'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedHeightProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
  duration?: number;
}

export function AnimatedHeight({ 
  children, 
  isOpen, 
  className,
  duration = 300 
}: AnimatedHeightProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <div
      className={cn("overflow-hidden transition-[height] ease-in-out", className)}
      style={{ 
        height: isOpen ? height : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

// Accordion item with animated height
interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function AccordionItem({ 
  title, 
  children, 
  isOpen, 
  onToggle,
  className 
}: AccordionItemProps) {
  return (
    <div className={cn("neu-panel overflow-hidden", className)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:opacity-80 transition-opacity"
      >
        {title}
        <svg
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatedHeight isOpen={isOpen}>
        <div className="px-4 pb-4">
          {children}
        </div>
      </AnimatedHeight>
    </div>
  );
}
