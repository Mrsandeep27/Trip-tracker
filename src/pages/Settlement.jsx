import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function Settlement() {
    const navigate = useNavigate();
    const { getSettlements, members } = useTrip();

    const settlements = getSettlements();

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <header style={{ padding: '1.5rem 0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem' }}>Settlements</h2>
            </header>

            {settlements.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                    <h3>All Settled Up!</h3>
                    <p className="text-muted">No one owes anything.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {settlements.map((s, idx) => (
                        <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--danger)'
                                }}>
                                    {s.from.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500' }}><span style={{ color: 'var(--danger)' }}>{s.from}</span> owes <span style={{ color: 'var(--success)' }}>{s.to}</span></div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                ₹{s.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Active Members</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {members.map(m => (
                                <span key={m} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', fontSize: '0.85rem' }}>{m}</span>
                            ))}
                        </div>
                        {/* Future: Add Invite Member Button here */}
                    </div>
                </div>
            )}
        </div>
    );
}
