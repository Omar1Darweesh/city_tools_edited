import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit, Trash, UserCircle } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
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

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>المستخدمين</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> إضافة مستخدم
                </button>
            </header>

            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم بالكامل</th>
                                <th>اسم المستخدم</th>
                                <th>الدور/الصلاحية</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '50%' }}>
                                            <UserCircle size={20} color="#64748b" />
                                        </div>
                                        {u.fullName}
                                    </td>
                                    <td>{u.username}</td>
                                    <td>
                                        <span style={{ fontSize: '13px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>
                                            {u.roles?.[0]?.role?.name || 'مستخدم'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: u.active ? '#16a34a' : '#dc2626' }}>
                                            {u.active ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => {
                                                setEditingUser(u);
                                                // Find role ID from user roles
                                                const userRoleId = u.roles?.[0]?.roleId || '';
                                                setFormData({
                                                    username: u.username,
                                                    fullName: u.fullName,
                                                    password: '',
                                                    roleId: userRoleId
                                                });
                                                setShowModal(true);
                                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '450px' }}>
                        <h2>{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>الاسم الكامل</label>
                                <input className="input-field" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>اسم المستخدم (للدخول)</label>
                                <input className="input-field" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>الصلاحية / الدور</label>
                                <select
                                    className="input-field"
                                    value={formData.roleId}
                                    onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                    required
                                >
                                    <option value="">اختر الدور</option>
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>{editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}</label>
                                <input className="input-field" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ</button>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#eee' }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
