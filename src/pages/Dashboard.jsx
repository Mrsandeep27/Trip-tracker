import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Plus, Wallet, ArrowLeft, ArrowRight, Edit3 } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function Dashboard() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { expenses, totals, totalBudget, setTotalBudget, tripInfo, setTripInfo } = useTrip();

    // Sync URL tripId to Context if different
    useEffect(() => {
        if (tripId && tripInfo.id !== tripId) {
            setTripInfo({ ...tripInfo, id: tripId });
        }
    }, [tripId, tripInfo, setTripInfo]);

    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(totalBudget || '');

    const handleSaveBudget = () => {
        setTotalBudget(parseFloat(budgetInput) || 0);
        setIsEditingBudget(false);
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Join my TripSplit',
                    text: `Check out our trip budget! Trip ID: ${tripId}`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Trip link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="dashboard-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem 0',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>Trip #{tripId.substring(0, 6)}</span>
                </div>
                <button
                    onClick={handleShare}
                    className="btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: 'auto', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}
                >
                    <Share2 size={16} /> Share
                </button>
            </header>

            {/* Budget & Spend Overview */}
            <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Spent</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                            ₹{totals.totalSpend.toFixed(0)}
                            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                {totalBudget > 0 && ` / ₹${totalBudget}`}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditingBudget(!isEditingBudget)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'white' }}
                        title="Set Trip Budget"
                    >
                        <Edit3 size={16} />
                    </button>
                </div>

                {isEditingBudget && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                        <input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="Enter Amount"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white', padding: '0.5rem', borderRadius: '8px', flex: 1 }}
                        />
                        <button
                            onClick={handleSaveBudget}
                            style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', color: 'white', fontWeight: '600' }}
                        >
                            Save
                        </button>
                    </div>
                )}

                {totalBudget > 0 && (
                    <>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '99px',
                            overflow: 'hidden',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{
                                width: `${Math.min(100, (totals.totalSpend / totalBudget) * 100)}%`,
                                height: '100%',
                                background: totals.totalSpend > totalBudget ? 'var(--danger)' : 'var(--grad-main)',
                                transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            <span className="text-muted">Remaining</span>
                            <span style={{ fontWeight: '600', color: (totalBudget - totals.totalSpend) < 0 ? 'var(--danger)' : 'var(--success)' }}>
                                ₹{Math.max(0, totalBudget - totals.totalSpend).toFixed(2)}
                                {(totalBudget - totals.totalSpend) < 0 && ` (+₹${Math.abs(totalBudget - totals.totalSpend).toFixed(2)} over)`}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Actions / Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div
                    className="card glass-panel"
                    onClick={() => navigate(`/trip/${tripId}/settle`)}
                    style={{ padding: '1.25rem', marginBottom: 0, cursor: 'pointer', borderColor: 'var(--primary)', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--primary)', opacity: 0.1 }}></div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Settlement</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        Who Owes Who? <ArrowRight size={16} />
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            <h3 style={{ marginBottom: '1rem' }}>Recent Expenses</h3>
            {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <p>No expenses yet.</p>
                    <p style={{ fontSize: '0.9rem' }}>Tap the <strong>+ Add Expense</strong> button below!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {expenses.map((expense) => (
                        <div key={expense.id} className="card" style={{
                            marginTop: 0,
                            marginBottom: 0,
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Wallet size={18} color="#a1a1aa" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{expense.title}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{expense.paidBy} • {expense.date}</div>
                                </div>
                            </div>
                            <div style={{ fontWeight: '600', color: expense.paidBy === 'You' ? 'var(--success)' : 'white' }}>
                                ₹{parseFloat(expense.amount).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => navigate(`/trip/${tripId}/add`)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '50%',
                    transform: 'translateX(50%)',
                    borderRadius: '999px', // Pill shape if adding text, or keep circle
                    background: 'var(--grad-main)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 50,
                    padding: '1rem 1.5rem',
                    gap: '0.5rem',
                    minWidth: '160px' // Make it wide to include text
                }}>
                <Plus size={24} color="white" />
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>Add Expense</span>
            </button>
        </div>
    );
}
