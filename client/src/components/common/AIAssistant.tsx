import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCpu } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';
import axios from 'axios';

interface ChatMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    createdAt: string;
}

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: `m-${Date.now()}`,
            role: 'assistant',
            content: "Hi! I'm Martify AI. How can I help you shop today?",
            createdAt: new Date().toISOString(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<null | HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const newUserMessage: ChatMessage = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setInput('');
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            const chatHistory = [...messages, newUserMessage]
                .slice(-8)
                .map((m) => ({ role: m.role, content: m.content }));
            const pageContext = `Current route: ${window.location.pathname}`;

            const { data } = await axios.post('/api/chatbot/message', {
                message: userMessage,
                context: pageContext,
                chatHistory,
            });
            setMessages(prev => [
                ...prev,
                {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content: data.response,
                    createdAt: new Date().toISOString(),
                }
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    id: `e-${Date.now()}`,
                    role: 'assistant',
                    content: "Oops, I'm having a little trouble right now. Try again?",
                    createdAt: new Date().toISOString(),
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="card"
                        style={{ 
                            width: 'min(350px, calc(100vw - 2rem))', 
                            height: '500px', 
                            marginBottom: '1rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: 0,
                            overflow: 'hidden',
                            boxShadow: '0 18px 48px rgba(2, 6, 23, 0.3)',
                            borderRadius: '1.25rem',
                            border: '1px solid #1f2937',
                            background: '#0f172a',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1rem 1.1rem', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
                                    <FiCpu />
                                </div>
                                <span style={{ fontWeight: 700 }}>Martify AI</span>
                            </div>
                            <FiX style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#0b1220' }}>
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    style={{ 
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '88%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: msg.role === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#1f2937',
                                        color: '#f8fafc',
                                        fontSize: '0.875rem',
                                        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
                                        border: msg.role === 'assistant' ? '1px solid #334155' : 'none',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {msg.content}
                                    <div style={{ marginTop: '0.35rem', fontSize: '0.68rem', opacity: 0.75, textAlign: msg.role === 'user' ? 'right' : 'left', color: '#cbd5e1' }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{ alignSelf: 'flex-start', background: '#1f2937', border: '1px solid #334155', padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0', display: 'flex', gap: '4px' }}>
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '0.85rem', borderTop: '1px solid #1f2937', display: 'flex', gap: '0.5rem', background: '#0f172a' }}>
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask about products..."
                                style={{ 
                                    flex: 1, 
                                    border: '1px solid #334155', 
                                    background: '#111827', 
                                    padding: '0.5rem 1rem', 
                                    borderRadius: '999px',
                                    fontSize: '0.875rem',
                                    color: '#f8fafc',
                                }}
                            />
                            <button 
                                onClick={handleSend}
                                className="btn btn-primary" 
                                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
                                disabled={isLoading || !input.trim()}
                            >
                                <FiSend />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-primary"
                style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    fontSize: '1.5rem',
                    boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    border: 'none',
                }}
            >
                {isOpen ? <FiX /> : <BsRobot />}
            </motion.button>
        </div>
    );
};

export default AIAssistant;
