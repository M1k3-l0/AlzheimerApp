import React from 'react';

/**
 * Icone da public/new_icon (Flaticon).
 * name = nome file senza .svg (es. home, user, comments).
 * color = 'primary' | 'primaryDark' | 'accent' | 'white' | 'text' | 'textSecondary' | 'currentColor' | css value.
 * Se non passato, usa currentColor (eredita dal parent, es. TabBar active/inactive).
 */
const ICON_NAMES = [
  'add', 'badge-check', 'bell', 'bell-slash', 'calendar-lines', 'camera', 'comments',
  'envelope', 'face-expressionless', 'grin', 'home', 'lock', 'paper-plane', 'phone-call',
  'picture', 'sad', 'settings', 'shield-check', 'shield-exclamation', 'shoe-prints', 'text',
  'thumbs-up', 'trash', 'user', 'users-alt',
];

const COLOR_MAP = {
  primary: 'var(--color-primary)',
  primaryDark: 'var(--color-primary-dark)',
  primarySoft: 'var(--color-primary-soft)',
  accent: 'var(--color-accent)',
  white: '#ffffff',
  text: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  success: 'var(--color-success)',
  error: 'var(--color-error)',
};

function resolveColor(color) {
  if (!color || color === 'currentColor') return 'currentColor';
  if (COLOR_MAP[color]) return COLOR_MAP[color];
  return color;
}

export default function AppIcon({ name, size = 24, color, className, style = {} }) {
  const safeName = ICON_NAMES.includes(name) ? name : 'home';
  const src = `/new_icon/${safeName}.svg`;
  const bg = resolveColor(color);
  const maskStyle = {
    display: 'inline-block',
    width: size,
    height: size,
    flexShrink: 0,
    backgroundColor: bg,
    mask: `url(${src}) no-repeat center / contain`,
    WebkitMask: `url(${src}) no-repeat center / contain`,
    ...style,
  };
  return <span className={className} style={maskStyle} role="img" aria-hidden />;
}

export { ICON_NAMES, COLOR_MAP };
