'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlobalPanelHeader from './GlobalPanelHeader';
import SwipeDownControl from './SwipeDownControl';
import { SECTION_TRANSITION, viewportHeight } from '../utilities/section-transition';

export default function HomePanelIntro() {
  const router = useRouter();
  const startY = useRef(null);
  const currentOffset = useRef(0);
  const wheelOffset = useRef(0);
  const isNavigating = useRef(false);
  const didDrag = useRef(false);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
    const clamped = Math.max(0, Math.min(nextOffset, viewportHeight()));
    currentOffset.current = clamped;
    setOffset(clamped);
  }, []);

  const onPointerDown = (event) => {
    if (isNavigating.current) return;
    startY.current = event.clientY;
    didDrag.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (startY.current == null || isNavigating.current) return;
    const dragDistance = startY.current - event.clientY;
    if (Math.abs(dragDistance) > 6) didDrag.current = true;
    updateOffset(dragDistance * SECTION_TRANSITION.dragMultiplier);
  };

  const onPointerEnd = () => {
    if (startY.current == null) return;
    startY.current = null;
    settle(currentOffset.current);
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

  const progress = Math.min(1, offset / Math.max(viewportHeight(), 1));

  return (
    <main className="home-panel-intro" aria-label="OOXME introduction">
      <GlobalPanelHeader home />
      <section
        className={`home-swipe-panel${isDragging ? ' is-dragging' : ''}${isCompleting ? ' is-completing' : ''}`}
        style={{ '--panel-lift': `${offset}px`, '--panel-progress': progress }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={() => {
          if (!didDrag.current) complete();
        }}
        role="button"
        tabIndex={0}
        aria-label="Swipe up for more"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') complete();
        }}
      >
        <SwipeDownControl label="Swipe up for more" />
      </section>
    </main>
  );
}
