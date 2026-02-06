import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, IndianRupee } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function AddExpense() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { members, addExpense } = useTrip();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        paidBy: 'You', // Default
        category: 'Food'
    });

    const categories = ['Food', 'Transport', 'Entertainment', 'Accommodation', 'Other'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;

        addExpense({
            title: formData.title,
            amount: parseFloat(formData.amount),
            paidBy: formData.paidBy,
            category: formData.category
        });

        navigate(-1); // Go back
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <header style={{ padding: '1.5rem 0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem' }}>Add Expense</h2>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Amount Input */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                    <IndianRupee size={24} color="var(--primary-light)" />
                    <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        autoFocus
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            width: '100%',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Details */}
                <div className="card" style={{ display: 'grid', gap: '1rem' }}>

                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <label className="text-muted" style={{ fontSize: '0.85rem' }}>Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Dinner at Mario's"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <label className="text-muted" style={{ fontSize: '0.85rem' }}>Paid By</label>
                            <select
                                value={formData.paidBy}
                                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                            >
                                {members.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <label className="text-muted" style={{ fontSize: '0.85rem' }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Save Expense <Check size={20} />
                </button>

            </form>
        </div>
    );
}
