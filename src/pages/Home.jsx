import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Play, Sparkles } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { motion } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const { tripInfo, totals, totalBudget } = useTrip();

    const hasActiveTrip = tripInfo && tripInfo.id && tripInfo.id !== 'demo';

    const handleCreateTrip = () => {
        const newId = Math.random().toString(36).substring(7);
        navigate(`/trip/${newId}?new=true`);
    };

    const handleJoinTrip = (e) => {
        e.preventDefault();
        if (joinCode.trim()) {
            navigate(`/trip/${joinCode}`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 12 }
        }
    };

    return (
        <motion.div
            className="home-page"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '4rem' }}
        >
            {/* Animated Background Elements */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', top: '-10%', right: '-10%',
                        width: '500px', height: '500px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(0,0,0,0) 70%)',
                        filter: 'blur(40px)'
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1],
                        x: [0, -50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', bottom: '-10%', left: '-10%',
                        width: '400px', height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(0,0,0,0) 70%)',
                        filter: 'blur(40px)'
                    }}
                />
            </div>

            <motion.header variants={itemVariants} style={{ marginTop: '3rem', marginBottom: '3.5rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, type: "spring" }}
                    style={{ display: 'inline-block', marginBottom: '0.5rem' }}
                >
                    <h1 className="text-gradient" style={{
                        fontSize: '4rem',
                        marginBottom: '0',
                        letterSpacing: '-0.05em',
                        backgroundSize: '200% auto',
                        animation: 'gradientMove 5s linear infinite'
                    }}>
                        TripSplit
                    </h1>
                </motion.div>
                <motion.p
                    className="text-muted"
                    variants={itemVariants}
                    style={{ fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}
                >
                    Effortless expense sharing for your next <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>adventure</span>.
                </motion.p>
            </motion.header>

            <motion.div className="cards-container" variants={containerVariants} style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Resume Active Trip Card */}
                {hasActiveTrip && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="card glass-panel"
                        style={{
                            borderColor: 'var(--primary)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.3)'
                        }}
                    >
                        <motion.div
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--grad-main)', opacity: 0.15 }}
                        />
                        <div style={{ position: 'relative', zIndex: 1, padding: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        background: 'var(--grad-main)',
                                        padding: '0.75rem',
                                        borderRadius: '14px',
                                        boxShadow: '0 8px 16px rgba(124, 58, 237, 0.4)'
                                    }}>
                                        <Play size={24} color="white" fill="white" />
                                    </div>
                                    <div>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--primary-light)', marginBottom: '0.2rem' }}>Ongoing</div>
                                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Current Trip</h2>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>₹{totals?.totalSpend?.toFixed(0) || '0'}</div>
                                    {totalBudget > 0 && <div className="text-muted" style={{ fontSize: '0.85rem' }}>of ₹{totalBudget}</div>}
                                </div>
                            </div>

                            <motion.button
                                className="btn btn-primary"
                                onClick={() => navigate(`/trip/${tripInfo.id}`)}
                                whileHover={{ gap: '1rem' }}
                                style={{ width: '100%', justifyContent: 'space-between', padding: '1rem 1.5rem', fontSize: '1.1rem' }}
                            >
                                Resume Trip <ArrowRight size={20} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Create Trip Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    className="card glass-panel"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                            <Plus size={28} color="#a78bfa" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.3rem' }}>Start a New Trip</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>Create a room and invite friends.</p>
                        </div>
                    </div>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={handleCreateTrip}
                        whileHover={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        style={{ width: '100%', justifyContent: 'space-between' }}
                    >
                        Create Trip <Sparkles size={18} style={{ opacity: 0.7 }} />
                    </motion.button>
                </motion.div>

                {/* Join Trip Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                    className="card glass-panel"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(236, 72, 153, 0.15)',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: '1px solid rgba(236, 72, 153, 0.3)'
                        }}>
                            <Users size={28} color="#f472b6" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.3rem' }}>Join Existing Trip</h2>
                            <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>Enter the unique code to join.</p>
                        </div>
                    </div>

                    <form onSubmit={handleJoinTrip} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            placeholder="Enter code..."
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '1rem 1.25rem',
                                borderRadius: '14px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                outline: 'none',
                                fontWeight: '500',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-light)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                        <motion.button
                            type="submit"
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.05, background: 'var(--primary)', borderColor: 'var(--primary)', color: 'white' }}
                            whileTap={{ scale: 0.95 }}
                            style={{ width: 'auto', padding: '0 1.25rem', borderRadius: '14px' }}
                        >
                            <ArrowRight size={24} />
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
