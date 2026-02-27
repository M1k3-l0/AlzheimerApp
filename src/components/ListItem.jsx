import React from 'react';
import AppIcon from './AppIcon';

const ListItem = ({ text, isCompleted, onToggle }) => {
    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: 'var(--color-bg-secondary)',
            marginBottom: '1px',
            cursor: 'pointer',
        },
        checkbox: {
            width: '44px', /* Large touch target */
            height: '44px',
            borderRadius: '50%',
            border: `2px solid ${isCompleted ? 'var(--color-success)' : 'var(--color-border)'}`,
            backgroundColor: isCompleted ? 'var(--color-success)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            flexShrink: 0,
        },
        text: {
            fontSize: '18px',
            color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-primary-dark)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            fontWeight: isCompleted ? '400' : '600'
        }
    };

    return (
        <div style={styles.container} onClick={onToggle}>
            <div style={styles.checkbox}>
                {isCompleted && <AppIcon name="badge-check" size={28} color="white" />}
            </div>
            <span style={styles.text}>{text}</span>
        </div>
    );
};

export default ListItem;
