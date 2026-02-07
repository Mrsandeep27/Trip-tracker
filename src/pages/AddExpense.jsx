import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, IndianRupee, Trash2 } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function AddExpense() {
    const { tripId, expenseId } = useParams();
    const navigate = useNavigate();
    const { members, expenses, addExpense, updateExpense, deleteExpense } = useTrip();

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        paidBy: 'You', // Default
        category: 'Food',
        splitWithGroup: true
    });

    const [loading, setLoading] = useState(false);

    const isEditing = !!expenseId;

    useEffect(() => {
        if (isEditing && expenses.length > 0) {
            const expenseToEdit = expenses.find(e => String(e.id) === String(expenseId));
            if (expenseToEdit) {
                setFormData({
                    title: expenseToEdit.title,
                    amount: expenseToEdit.amount,
                    paidBy: expenseToEdit.paidBy,
                    category: expenseToEdit.category || 'Food',
                    splitWithGroup: expenseToEdit.splitWithGroup !== false // Default to true if undefined
                });
            }
        }
    }, [isEditing, expenseId, expenses]);

    const categories = ['Food', 'Transport', 'Entertainment', 'Accommodation', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;

        setLoading(true);
        const expenseData = {
            title: formData.title,
            amount: parseFloat(formData.amount),
            paidBy: formData.paidBy,
            category: formData.category,
            splitWithGroup: formData.splitWithGroup
        };

        let result;
        if (isEditing) {
            result = await updateExpense(expenseId, expenseData);
        } else {
            // Pass tripId explicitly to ensure it's added to the correct trip
            result = await addExpense(expenseData, tripId);
        }

        setLoading(false);

        if (result && result.success) {
            navigate(-1);
        } else {
            console.error(result?.error);
            alert(`Failed to save expense: ${result?.error?.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setLoading(true);
            const result = await deleteExpense(expenseId);
            setLoading(false);

            if (result && result.success) {
                navigate(-1);
            } else {
                alert('Failed to delete expense.');
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
            <header style={{ padding: '1.5rem 0', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: 0 }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '1.5rem' }}>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                </div>
                {isEditing && (
                    <button
                        onClick={handleDelete}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Amount Input */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                    <IndianRupee size={24} color="var(--primary-light)" />
                    <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        autoFocus={!isEditing}
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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                        <div style={{ display: 'grid', gap: '0.25rem' }}>
                            <span style={{ fontSize: '1rem' }}>Split with Everyone</span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Uncheck to exclude from settlement</span>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input
                                type="checkbox"
                                checked={formData.splitWithGroup}
                                onChange={(e) => setFormData({ ...formData, splitWithGroup: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: formData.splitWithGroup ? 'var(--primary)' : '#4b5563',
                                transition: '.4s', borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute', content: '""', height: '20px', width: '20px',
                                    left: formData.splitWithGroup ? '26px' : '4px', bottom: '4px',
                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>

                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    {isEditing ? 'Update Expense' : 'Save Expense'} <Check size={20} />
                </button>

            </form>
        </div>
    );
}

