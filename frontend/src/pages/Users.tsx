import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { User } from '../types';
import { Edit2, Trash2, Shield, UserCheck, Eye } from 'lucide-react';
import '../styles/Users.css';

const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<User[]>('/users');
      return response.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const response = await api.patch(`/users/${id}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleRoleUpdate = async (userId: number, newRole: string) => {
    await updateRoleMutation.mutateAsync({ id: userId, role: newRole });
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="role-icon admin" />;
      case 'user':
        return <UserCheck className="role-icon user" />;
      case 'read-only':
        return <Eye className="role-icon readonly" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users">
      <div className="users-header">
        <h1>User Management</h1>
        <div className="users-stats">
          <span>Total Users: {users?.length || 0}</span>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                      onBlur={() => {
                        handleRoleUpdate(editingUser.id, editingUser.role);
                      }}
                      autoFocus
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="read-only">Read-Only</option>
                    </select>
                  ) : (
                    <div className="role-display">
                      {getRoleIcon(user.role)}
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </div>
                  )}
                </td>
                <td>{new Date(user.created_at!).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => setEditingUser(user)}
                      title="Edit Role"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(user.id)}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users?.length === 0 && (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;