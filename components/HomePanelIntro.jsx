'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalPanelHeader from './GlobalPanelHeader';
import SwipeDownControl from './SwipeDownControl';
import { crossesSectionThreshold, gestureOffset, SECTION_TRANSITION, viewportHeight } from '../utilities/section-transition';

export default function HomePanelIntro() {
  const router = useRouter();
  const startY = useRef(null);
  const dragDistance = useRef(0);
  const wheelOffset = useRef(0);
  const isNavigating = useRef(false);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const syncLanguage = () => setLanguage(document.documentElement.dir === 'rtl' ? 'ar' : 'en');
    syncLanguage();
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  const complete = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setIsDragging(false);
    setIsCompleting(true);
    setOffset(viewportHeight());
    window.setTimeout(() => router.push('/portfolio'), SECTION_TRANSITION.duration);
  }, [router]);

  const settle = useCallback((value) => {
    if (value >= SECTION_TRANSITION.threshold) {
      complete();
      return;
    }
    setIsDragging(false);
    setOffset(0);
  }, [complete]);

  const updateOffset = useCallback((nextOffset) => {
    const clamped = Math.max(-viewportHeight() * SECTION_TRANSITION.edgeResistance, Math.min(nextOffset, viewportHeight()));
    setOffset(clamped);
  }, []);

  const onPointerDown = (event) => {
    if (isNavigating.current || event.target.closest('button,a,input')) return;
    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (startY.current == null || isNavigating.current) return;
    const distance = startY.current - event.clientY;
    dragDistance.current = distance;
    updateOffset(gestureOffset(distance, distance < 0));
  };

  const onPointerEnd = () => {
    if (startY.current == null) return;
    startY.current = null;
    settle(dragDistance.current);
    dragDistance.current = 0;
  };

  useEffect(() => {
    const onWheel = (event) => {
      if (isNavigating.current || event.deltaY <= 0) return;
      event.preventDefault();
      wheelOffset.current += event.deltaY;
      window.clearTimeout(onWheel.timeout);
      onWheel.timeout = window.setTimeout(() => {
        settle(wheelOffset.current);
        wheelOffset.current = 0;
      }, SECTION_TRANSITION.wheelSettleDelay);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [settle]);

  return (
    <main className="home-panel-intro" aria-label="OOXME introduction">
      <section
        className={`home-swipe-panel${isDragging ? ' is-dragging' : ''}${isCompleting ? ' is-completing' : ''}`}
        style={{ '--panel-lift': `${offset}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <GlobalPanelHeader home />
        <button className="home-swipe-continue-control" type="button" onClick={complete} aria-label={language === 'ar' ? 'اسحب للأعلى للمزيد' : 'Swipe up for more'}>
          <SwipeDownControl label={language === 'ar' ? 'اسحب للأعلى للمزيد' : 'Swipe up for more'} />
        </button>
      </section>
    </main>
  );
}
