import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import toast from 'react-hot-toast';
import { FiBell, FiPackage, FiAlertTriangle } from 'react-icons/fi';

const NotificationListener = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!userInfo) return;

        const socket = io(window.location.origin.replace('5173', '5000'), {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            socket.emit('register', userInfo._id);
        });

        socket.on('notification', (data) => {
            toast.custom((t) => (
                <div className={`card glass animate-fade ${t.visible ? 'visible' : 'hidden'}`} style={{ 
                    padding: '1rem', 
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'center',
                    borderLeft: '4px solid hsl(var(--accent-h), var(--accent-s), var(--accent-l))',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{ background: 'hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))' }}>
                        {data.type === 'order' ? <FiPackage /> : <FiBell />}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{data.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.message}</div>
                    </div>
                </div>
            ), { duration: 5000 });
        });

        return () => {
            socket.disconnect();
        };
    }, [userInfo]);

    return null;
};

export default NotificationListener;
