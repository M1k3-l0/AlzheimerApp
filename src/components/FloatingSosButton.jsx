import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppIcon from './AppIcon';
import { isDev } from '../utils/dev';
import { dialPhoneNumber } from '../utils/phone';

const STORAGE_KEY = 'sos_fab_position';
const SIZE = 58;
const DRAG_THRESHOLD = 10;

function getEffectiveRole() {
  const simulated = isDev ? localStorage.getItem('simulated_role') : null;
  const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');
  return simulated || user.role;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function defaultPosition() {
  return {
    x: Math.max(8, window.innerWidth - SIZE - 16),
    y: Math.max(8, window.innerHeight - SIZE - 110),
  };
}

export default function FloatingSosButton() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pointerId: null,
  });

  const applyPosition = useCallback((x, y, persist = true) => {
    const next = {
      x: clamp(x, 8, window.innerWidth - SIZE - 8),
      y: clamp(y, 8, window.innerHeight - SIZE - 8),
    };
    setPos(next);
    if (persist) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      const role = getEffectiveRole();
      setVisible(role === 'caregiver' || role === 'patient');
    };
    updateVisibility();
    window.addEventListener('user_updated', updateVisibility);
    window.addEventListener('storage', updateVisibility);
    return () => {
      window.removeEventListener('user_updated', updateVisibility);
      window.removeEventListener('storage', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const loadPosition = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { x, y } = JSON.parse(saved);
          applyPosition(x, y, false);
          return;
        } catch (e) {
          /* ignore */
        }
      }
      applyPosition(defaultPosition().x, defaultPosition().y, false);
    };

    loadPosition();

    const onResize = () => {
      setPos((current) => {
        if (!current) return current;
        const next = {
          x: clamp(current.x, 8, window.innerWidth - SIZE - 8),
          y: clamp(current.y, 8, window.innerHeight - SIZE - 8),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [visible, applyPosition]);

  const triggerSos = () => {
    const sosNumber = localStorage.getItem('setting_sosNumber')?.trim();
    if (!sosNumber || !dialPhoneNumber(sosNumber)) {
      window.location.hash = '#/impostazioni';
    }
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const d = dragRef.current;
    d.active = true;
    d.moved = false;
    d.pointerId = e.pointerId;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.originX = pos.x;
    d.originY = pos.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      d.moved = true;
    }
    applyPosition(d.originX + dx, d.originY + dy);
  };

  const endDrag = (e) => {
    const d = dragRef.current;
    if (!d.active || d.pointerId !== e.pointerId) return;
    d.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.moved) triggerSos();
  };

  if (!visible || !pos) return null;

  return (
    <button
      type="button"
      aria-label="SOS emergenza"
      title="Trascina per spostare · Tocca per chiamare"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #EF4444, #DC2626)',
        border: '3px solid #FFFFFF',
        boxShadow: '0 6px 22px rgba(220, 38, 38, 0.45)',
        zIndex: 9998,
        cursor: dragRef.current.active ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        touchAction: 'none',
        padding: 0,
        userSelect: 'none',
      }}
    >
      <AppIcon name="shield-exclamation" size={22} color="white" />
      <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.625rem', lineHeight: 1 }}>SOS</span>
    </button>
  );
}
