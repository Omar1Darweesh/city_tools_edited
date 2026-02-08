import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit, Trash, UserCircle } from 'lucide-react';

// ✅ TypeScript Interfaces
interface Role {
    id: number;
    name: string;
    description?: string;
}

interface User {
    id: number;
    username: string;
    fullName: string;
    active: boolean;
    roles?: Array<{
        roleId: number;
        role: {
            name: string;
        };
    }>;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        password: '',
        roleId: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await apiClient.get('/users');
            setUsers(data.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await apiClient.get('/roles');
            setRoles(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await apiClient.patch(`/users/${editingUser.id}`, formData);
            } else {
                await apiClient.post('/users', formData);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ username: '', fullName: '', password: '', roleId: '' });
            fetchUsers();
        } catch (e: any) {
            alert(e.response?.data?.message || 'فشل حفظ المستخدم');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            await apiClient.delete(`/users/${id}`);
            fetchUsers();
        } catch (e) {
            alert('فشل حذف المستخدم');
        }
    };

    // ✅ Toggle active status
    const handleToggleActive = async (userId: number, currentStatus: boolean) => {
        try {
            await apiClient.patch(`/users/${userId}`, {
                active: !currentStatus
            });
            fetchUsers();
        } catch (e: any) {
            alert(e.response?.data?.message || 'فشل تحديث حالة المستخدم');
        }
    };

    return (
        <div style={{ padding: '24px', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserCircle size={32} color="#2563eb" />
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>المستخدمين</h1>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ username: '', fullName: '', password: '', roleId: '' });
                        setShowModal(true);
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#2563eb',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                >
                    <Plus size={20} />
                    إضافة مستخدم
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>الاسم بالكامل</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>اسم المستخدم</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>الدور/الصلاحية</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>الحالة</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '16px' }}>{u.fullName}</td>
                                <td style={{ padding: '16px' }}>{u.username}</td>
                                <td style={{ padding: '16px' }}>{u.roles?.[0]?.role?.name || 'مستخدم'}</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    {/* ✅ Toggle Switch */}
                                    <label style={{
                                        position: 'relative',
                                        display: 'inline-block',
                                        width: '52px',
                                        height: '28px',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={u.active}
                                            onChange={() => handleToggleActive(u.id, u.active)}
                                            style={{ opacity: 0, width: 0, height: 0 }}
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            cursor: 'pointer',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: u.active ? '#22c55e' : '#94a3b8',
                                            transition: '0.3s',
                                            borderRadius: '28px',
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                content: '""',
                                                height: '20px',
                                                width: '20px',
                                                left: u.active ? '28px' : '4px',
                                                bottom: '4px',
                                                background: 'white',
                                                transition: '0.3s',
                                                borderRadius: '50%',
                                            }} />
                                        </span>
                                    </label>
                                    <div style={{
                                        marginTop: '4px',
                                        fontSize: '12px',
                                        color: u.active ? '#22c55e' : '#94a3b8',
                                        fontWeight: '600'
                                    }}>
                                        {u.active ? 'نشط' : 'غير نشط'}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => {
                                                setEditingUser(u);
                                                const userRoleId = u.roles?.[0]?.roleId || '';
                                                setFormData({
                                                    username: u.username,
                                                    fullName: u.fullName,
                                                    password: '',
                                                    roleId: String(userRoleId)
                                                });
                                                setShowModal(true);
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '32px',
                        width: '500px',
                        maxWidth: '90%'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px' }}>
                            {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>اسم المستخدم (للدخول)</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>الصلاحية / الدور</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '16px'
                                    }}
                                    required
                                >
                                    <option value="">اختر الدور</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                    {editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '16px'
                                    }}
                                    required={!editingUser}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    حفظ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#eee',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
