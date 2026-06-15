import React, { useState } from 'react';
import { getSearchAvatarUrl, getProfileInitials, formatFullName } from '../utils/avatarUtils';

export default function SearchUserAvatar({ user, size = 48, style = {} }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getProfileInitials(user);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        color: 'var(--color-primary-dark)',
        fontWeight: 700,
        fontSize: size * 0.32,
        ...style,
      }}
    >
      {!imageFailed && user ? (
        <img
          src={getSearchAvatarUrl(user)}
          alt={formatFullName(user) || 'Avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
