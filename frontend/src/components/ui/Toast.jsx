import React, { useEffect } from 'react';

const Toast = ({ message, type, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    const bgColor = type === 'success' ? '#2ecc71' : type === 'danger' ? '#e74c3c' : '#3498db';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-times-circle' : 'fa-info-circle';

    return (
        <div style={{
            minWidth: '250px',
            backgroundColor: bgColor,
            color: '#fff',
            textAlign: 'center',
            borderRadius: '8px',
            padding: '16px',
            position: 'fixed',
            zIndex: 1000,
            left: '50%',
            bottom: '50px',
            fontWeight: '600',
            transform: 'translateX(-50%)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            animation: 'fadeInUp 0.5s ease'
        }}>
            <i className={`fas ${icon}`}></i> {message}
        </div>
    );
};

export default Toast;