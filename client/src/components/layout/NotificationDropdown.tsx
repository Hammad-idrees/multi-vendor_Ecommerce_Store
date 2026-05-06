import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Header.module.css';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            const unread = data.filter((n: Notification) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            const deleted = notifications.find(n => n._id === id);
            setNotifications((prev) => prev.filter(n => n._id !== id));
            if (deleted && !deleted.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    padding: '0.4rem'
                }}
                title="Notifications"
            >
                <FiBell size={22} style={{ strokeWidth: 2 }} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '350px',
                    backgroundColor: 'var(--surface, #ffffff)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    border: '1px solid var(--border, #e2e8f0)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border, #e2e8f0)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--surface-alt, #f8fafc)',
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.8rem',
                                    cursor: 'pointer', fontWeight: 600, padding: 0
                                }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                <FiBell size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--border, #f1f5f9)',
                                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                        position: 'relative',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', fontWeight: notif.isRead ? 600 : 700 }}>
                                            {notif.title}
                                            {!notif.isRead && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', marginLeft: '6px' }} />}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    title="Mark as read"
                                                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '2px' }}
                                                >
                                                    <FiCheck size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notif._id)}
                                                title="Delete notification"
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', opacity: 0.7 }}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                                        {notif.message}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiClock size={10} /> {new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {notif.link && (
                                            <Link
                                                to={notif.link}
                                                onClick={() => setIsOpen(false)}
                                                style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}
                                            >
                                                View Details
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
