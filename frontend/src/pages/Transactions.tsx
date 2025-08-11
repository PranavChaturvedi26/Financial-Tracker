import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { Plus, Edit2, Trash2, Filter, Search, X } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import '../styles/Transactions.css';

const Transactions: React.FC = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission(['admin', 'user']);
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const queryFilters = useMemo(() => ({
    page,
    limit: 20,
    ...(filters.type && { type: filters.type as 'income' | 'expense' }),
    ...(filters.category && { category: parseInt(filters.category) }),
    ...(filters.search && { search: filters.search }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  }), [page, filters]);

  const { data, isLoading } = useTransactions(queryFilters);
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleCreate = useCallback(() => {
    if (!canEdit) return;
    setEditingTransaction(null);
    setShowForm(true);
  }, [canEdit]);

  const handleEdit = useCallback((transaction: any) => {
    if (!canEdit) return;
    setEditingTransaction(transaction);
    setShowForm(true);
  }, [canEdit]);

  const handleDelete = useCallback(async (id: number) => {
    if (!canEdit) return;
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteMutation.mutateAsync(id);
    }
  }, [canEdit, deleteMutation]);

  const handleSubmit = useCallback(async (formData: any) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setShowForm(false);
    setEditingTransaction(null);
  }, [editingTransaction, createMutation, updateMutation]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      type: '',
      category: '',
      search: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transactions">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>
          {canEdit && (
            <button className="btn-primary" onClick={handleCreate}>
              <Plus size={20} />
              Add Transaction
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <Search size={18} />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search transactions..."
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <button className="btn-text" onClick={clearFilters}>
              <X size={18} />
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data?.transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                <td>
                  <span className="category-badge" style={{ backgroundColor: transaction.category_color }}>
                    {transaction.category_name}
                  </span>
                </td>
                <td>{transaction.description}</td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>
                <td className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </td>
                {canEdit && (
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(transaction)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDelete(transaction.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {data?.transactions.length === 0 && (
          <div className="empty-state">
            <p>No transactions found</p>
          </div>
        )}
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="pagination">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {data.pagination.pages}</span>
          <button 
            disabled={page === data.pagination.pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
};

export default Transactions;