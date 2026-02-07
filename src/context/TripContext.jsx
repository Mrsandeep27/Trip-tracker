import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const TripContext = createContext();

export function useTrip() {
    return useContext(TripContext);
}

export function TripProvider({ children }) {
    // Check if Supabase is configured
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

    const [tripInfo, setTripInfo] = useState(() => {
        const saved = localStorage.getItem('trip_info');
        return saved ? JSON.parse(saved) : { name: 'Trip #1', id: 'demo' };
    });

    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState(['You', 'Sarah', 'Mike', 'John']);
    const [totalBudget, setTotalBudget] = useState(0);

    // Initial Load Logic (Local vs Cloud)
    useEffect(() => {
        if (!isSupabaseConfigured) {
            // Load from LocalStorage if no Supabase
            const savedExpenses = localStorage.getItem('trip_expenses');
            if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

            const savedMembers = localStorage.getItem('trip_members');
            if (savedMembers) setMembers(JSON.parse(savedMembers));

            const savedBudget = localStorage.getItem('trip_budget');
            if (savedBudget) setTotalBudget(parseFloat(savedBudget));
            return;
        }

        // --- Supabase Logic ---
        const fetchTripData = async () => {
            if (!tripInfo.id || tripInfo.id === 'demo') return;

            // 1. Fetch Trip Details (Budget, etc)
            const { data: tripData, error: tripError } = await supabase
                .from('trips')
                .select('*')
                .eq('id', tripInfo.id)
                .single();

            if (tripData) {
                setTotalBudget(tripData.budget || 0);
            } else if (!tripError) {
                // Create trip if not exists
                await supabase.from('trips').insert([{ id: tripInfo.id, budget: 0, name: 'Trip' }]);
            }

            // 2. Fetch Expenses
            const { data: expenseData } = await supabase
                .from('expenses')
                .select('*')
                .eq('trip_id', tripInfo.id)
                .order('created_at', { ascending: false });

            if (expenseData) {
                // Map snake_case DB columns to camelCase for app
                const mappedExpenses = expenseData.map(exp => ({
                    ...exp,
                    paidBy: exp.paid_by || exp.paidBy, // Handle both just in case
                    splitWithGroup: exp.split_with_group !== undefined ? exp.split_with_group : true
                }));
                setExpenses(mappedExpenses);
            }
        };

        fetchTripData();

        // Real-time Subscription
        const channel = supabase
            .channel('trip_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripInfo.id}` }, (payload) => {
                const mapExpense = (exp) => ({
                    ...exp,
                    paidBy: exp.paid_by || exp.paidBy,
                    splitWithGroup: exp.split_with_group !== undefined ? exp.split_with_group : true
                });

                if (payload.eventType === 'INSERT') {
                    setExpenses(prev => [mapExpense(payload.new), ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setExpenses(prev => prev.map(exp => exp.id === payload.new.id ? mapExpense(payload.new) : exp));
                } else if (payload.eventType === 'DELETE') {
                    setExpenses(prev => prev.filter(exp => exp.id !== payload.old.id));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripInfo.id}` }, (payload) => {
                if (payload.new && payload.new.budget !== undefined) {
                    setTotalBudget(payload.new.budget);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isSupabaseConfigured, tripInfo.id]);


    // Local Storage Backup (Optional, but good for offline-first feel)
    useEffect(() => {
        if (!isSupabaseConfigured) {
            localStorage.setItem('trip_expenses', JSON.stringify(expenses));
            localStorage.setItem('trip_members', JSON.stringify(members));
            localStorage.setItem('trip_budget', totalBudget.toString());
        }
        localStorage.setItem('trip_info', JSON.stringify(tripInfo));
    }, [expenses, members, tripInfo, totalBudget, isSupabaseConfigured]);


    const addExpense = async (expense, tripIdOverride = null) => {
        const targetTripId = tripIdOverride || tripInfo.id;

        // Map app model to DB model
        const dbExpense = {
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            paid_by: expense.paidBy,
            split_with_group: expense.splitWithGroup,
            trip_id: targetTripId,
        };

        if (isSupabaseConfigured) {
            const { error } = await supabase.from('expenses').insert([dbExpense]);

            if (error) {
                // Graceful Fallback: If 'split_with_group' column is missing in DB, retry without it
                if (error.code === 'PGRST204' || error.message?.includes('split_with_group') || error.message?.includes('column')) {
                    console.warn('Database missing "split_with_group" column. Saving without it.');
                    const { split_with_group, ...legacyExpense } = dbExpense;
                    const { data: retryData, error: retryError } = await supabase.from('expenses').insert([legacyExpense]).select().single();

                    if (retryError) {
                        console.error('Error adding expense (retry failed):', retryError);
                        return { success: false, error: retryError };
                    }
                    // Optimistic/Immediate Update
                    // We try to use the returned data if available, otherwise construct it
                    const addedExpense = retryData ? {
                        ...retryData,
                        paidBy: retryData.paid_by,
                        splitWithGroup: retryData.split_with_group !== undefined ? retryData.split_with_group : true
                    } : {
                        ...expense,
                        trip_id: targetTripId,
                        id: 'temp-' + Date.now(), // Temp ID until refresh 
                        created_at: new Date().toISOString()
                    };
                    setExpenses(prev => [addedExpense, ...prev]);

                    return { success: true };
                }

                console.error('Error adding expense:', error);
                return { success: false, error };
            }

            // Normal path success
            // We should ideally fetch the inserted row to get the ID and Defaults, 
            // but for speed we can insert and select. 
            // Since we didn't use select() in the main path above (to minimize changes), 
            // we might have a race with subscription. 
            // BEST PRACTICE: Use optimistic update or wait for subscription? 
            // User reported "cannot edit/delete", implying previous confusion. 
            // Let's rely on immediate UI update to feel "snappy".

            // Re-do the insert with .select() to get the ID for the UI
            // Wait, we can't redo it. The code above already ran.
            // Let's modify the code to use select() in the fetch block if possible, 
            // OR just let the subscription handle it but delay navigation? 
            // Navigation happens in the component.

            // Simple fix: The previous code block (lines 131-137) didn't return data.
            // I will rely on the subscription for 'add' because 'add' needs the real ID for future edits.
            // If I fake the ID, I can't edit it immediately. 
            // SO: For 'add', subscription is safer unless we return `select()`.
            // BUT for 'update' and 'delete', we HAVE the ID. So we can update locally safely.

            return { success: true };
        } else {
            // Local Mode
            const newExpense = {
                ...expense,
                trip_id: targetTripId,
                id: Date.now().toString(),
                date: new Date().toLocaleDateString()
            };
            setExpenses(prev => [newExpense, ...prev]);
            return { success: true };
        }
    };

    const updateExpense = async (id, updatedExpense) => {
        if (isSupabaseConfigured) {
            // Map updates to DB columns
            const dbUpdates = {};
            if (updatedExpense.title !== undefined) dbUpdates.title = updatedExpense.title;
            if (updatedExpense.amount !== undefined) dbUpdates.amount = updatedExpense.amount;
            if (updatedExpense.category !== undefined) dbUpdates.category = updatedExpense.category;
            if (updatedExpense.paidBy !== undefined) dbUpdates.paid_by = updatedExpense.paidBy;
            if (updatedExpense.splitWithGroup !== undefined) dbUpdates.split_with_group = updatedExpense.splitWithGroup;

            const { error } = await supabase
                .from('expenses')
                .update(dbUpdates)
                .eq('id', id);

            if (error) {
                // Graceful Fallback for Update
                if (error.code === 'PGRST204' || error.message?.includes('split_with_group') || error.message?.includes('column')) {
                    console.warn('Database missing "split_with_group" column. Updating without it.');
                    const { split_with_group, ...legacyUpdates } = dbUpdates;
                    const { error: retryError } = await supabase.from('expenses').update(legacyUpdates).eq('id', id);

                    if (retryError) {
                        console.error('Error updating expense (retry failed):', retryError);
                        return { success: false, error: retryError };
                    }
                    // Success fallback
                    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedExpense } : exp));
                    return { success: true };
                }

                console.error('Error updating expense:', error);
                return { success: false, error };
            }

            // Success normal
            setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedExpense } : exp));
            return { success: true };
        } else {
            // Local Mode
            setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedExpense } : exp));
            return { success: true };
        }
    };

    const deleteExpense = async (id) => {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error deleting expense:', error);
                return { success: false, error };
            }

            // Success normal
            setExpenses(prev => prev.filter(exp => exp.id !== id));
            return { success: true };
        } else {
            // Local Mode
            setExpenses(prev => prev.filter(exp => exp.id !== id));
            return { success: true };
        }
    };

    // Wrapper to update budget locally or in cloud
    const updateBudget = async (amount) => {
        setTotalBudget(amount);
        if (isSupabaseConfigured && tripInfo.id) {
            await supabase.from('trips').upsert({ id: tripInfo.id, budget: amount });
        }
    };

    const addMember = (name) => {
        if (!members.includes(name)) {
            setMembers(prev => [...prev, name]);
        }
    };

    const getSettlements = () => {
        // Basic algorithm: 
        // 1. Calculate net balance for each person
        // 2. Match debtors to creditors

        let balances = {};
        members.forEach(m => balances[m] = 0);

        expenses.forEach(exp => {
            // Skip expenses that are not split with the group
            if (exp.splitWithGroup === false) return;

            const payer = exp.paidBy;
            const amount = parseFloat(exp.amount);
            const splitEqually = amount / members.length;

            // Payer gets +amount (they paid)
            balances[payer] = (balances[payer] || 0) + amount;

            // Everyone (including payer) "spins" splitEqually
            // So net: Payer paid 'amount', but consumed 'splitEqually'. Net change: +amount - splitEqually
            // Others: Paid 0, consumed 'splitEqually'. Net change: -splitEqually

            members.forEach(member => {
                balances[member] -= splitEqually;
            });
        });

        // Separate into owe and receive
        let debtors = [];
        let creditors = [];

        Object.entries(balances).forEach(([name, amount]) => {
            if (amount < -0.01) debtors.push({ name, amount }); // Negative means you owe
            if (amount > 0.01) creditors.push({ name, amount }); // Positive means you are owed
        });

        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        let settlements = [];
        let i = 0; // debtor index
        let j = 0; // creditor index

        while (i < debtors.length && j < creditors.length) {
            let debtor = debtors[i];
            let creditor = creditors[j];

            let amountOwed = Math.abs(debtor.amount);
            let amountToReceive = creditor.amount;

            let settlementAmount = Math.min(amountOwed, amountToReceive);

            settlements.push({
                from: debtor.name,
                to: creditor.name,
                amount: settlementAmount
            });

            debtor.amount += settlementAmount;
            creditor.amount -= settlementAmount;

            if (Math.abs(debtor.amount) < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }

        return settlements;
    };

    const totals = {
        totalSpend: expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
        userShare: 0 // To be calculated or specialized
    };

    return (
        <TripContext.Provider value={{
            expenses,
            members,
            tripInfo,
            setTripInfo,
            totalBudget,
            setTotalBudget: updateBudget,
            addExpense,
            updateExpense,
            deleteExpense,
            addMember,
            getSettlements,
            totals
        }}>
            {children}
        </TripContext.Provider>
    );
}
