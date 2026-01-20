import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit, Trash, Shield, Check } from 'lucide-react';

export default function Roles() {
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissionIds: [] as number[]
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const { data } = await apiClient.get('/roles');
            setRoles(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPermissions = async () => {
        try {
            const { data } = await apiClient.get('/roles/permissions');
            setPermissions(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await apiClient.patch(`/roles/${editingRole.id}`, formData);
            } else {
                await apiClient.post('/roles', formData);
            }
            setShowModal(false);
            setEditingRole(null);
            setFormData({ name: '', description: '', permissionIds: [] });
            fetchRoles();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to save role');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await apiClient.delete(`/roles/${id}`);
            fetchRoles();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to delete role');
        }
    };

    const togglePermission = (id: number) => {
        const current = formData.permissionIds;
        if (current.includes(id)) {
            setFormData({ ...formData, permissionIds: current.filter(pid => pid !== id) });
        } else {
            setFormData({ ...formData, permissionIds: [...current, id] });
        }
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ marginBottom: '8px' }}>الأدوار والصلاحيات</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>إدارة أدوار المستخدمين وصلاحياتهم في النظام</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setEditingRole(null);
                    setFormData({ name: '', description: '', permissionIds: [] });
                    setShowModal(true);
                }}>
                    <Plus size={18} /> دور جديد
                </button>
            </header>

            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {roles.map(role => (
                    <div key={role.id} className="card" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                }}>
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>{role.name}</h3>
                                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                                        {role.description || 'لا يوجد وصف'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => {
                                    setEditingRole(role);
                                    setFormData({
                                        name: role.name,
                                        description: role.description,
                                        permissionIds: role.permissions.map((p: any) => p.permission.id)
                                    });
                                    setShowModal(true);
                                }} style={{ background: '#eff6ff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#2563eb' }}>
                                    <Edit size={16} />
                                </button>
                                {role.name !== 'Admin' && (
                                    <button onClick={() => handleDelete(role.id)} style={{ background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>
                                        <Trash size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>الصلاحيات ({role.permissions.length})</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {role.permissions.slice(0, 5).map((p: any) => (
                                    <span key={p.permission.id} style={{
                                        fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#475569'
                                    }}>
                                        {p.permission.name.replace(/_/g, ' ')}
                                    </span>
                                ))}
                                {role.permissions.length > 5 && (
                                    <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#94a3b8' }}>
                                        +{role.permissions.length - 5} المزيد
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ marginBottom: '20px' }}>{editingRole ? 'تعديل الدور' : 'دور جديد'}</h2>

                        <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1, minHeight: 0 }}>
                            <form id="roleForm" onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>اسم الدور</label>
                                        <input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>الوصف</label>
                                        <input className="input-field" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '16px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>تحديد الصلاحيات</h3>

                                {/* Group Permissions by Category */}
                                {(() => {
                                    const groups: Record<string, any[]> = {
                                        'المخزون والمنتجات': [],
                                        'المبيعات ونقاط البيع': [],
                                        'المشتريات والموردين': [],
                                        'منصات البيع': [], // NEW: Add this group
                                        'الإدارة والإعدادات': [],
                                        'أخرى': []
                                    };

                                    permissions.forEach(p => {
                                        if (p.name.startsWith('products') || p.name.startsWith('stock')) {
                                            groups['المخزون والمنتجات'].push(p);
                                        } else if (p.name.startsWith('sales')) {
                                            groups['المبيعات ونقاط البيع'].push(p);
                                        } else if (p.name.startsWith('purchasing')) {
                                            groups['المشتريات والموردين'].push(p);
                                        } else if (p.name.startsWith('platform:')) { // NEW: Group platform permissions
                                            groups['منصات البيع'].push(p);
                                        } else if (p.name.startsWith('users') || p.name.startsWith('settings')) {
                                            groups['الإدارة والإعدادات'].push(p);
                                        } else {
                                            groups['أخرى'].push(p);
                                        }
                                    });

                                    return Object.entries(groups).map(([groupName, groupPerms]) => (
                                        groupPerms.length > 0 && (
                                            <div key={groupName} style={{ marginBottom: '20px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    paddingBottom: '8px',
                                                    marginBottom: '12px'
                                                }}>
                                                    <h4 style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                                        {groupName}
                                                    </h4>
                                                    <label style={{ fontSize: '12px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={groupPerms.every(p => formData.permissionIds.includes(p.id))}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                const groupIds = groupPerms.map(p => p.id);
                                                                if (checked) {
                                                                    // Add all missing
                                                                    const toAdd = groupIds.filter(id => !formData.permissionIds.includes(id));
                                                                    setFormData(prev => ({ ...prev, permissionIds: [...prev.permissionIds, ...toAdd] }));
                                                                } else {
                                                                    // Remove all
                                                                    setFormData(prev => ({ ...prev, permissionIds: prev.permissionIds.filter(id => !groupIds.includes(id)) }));
                                                                }
                                                            }}
                                                        />
                                                        تحديد الكل
                                                    </label>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    {groupPerms.map(perm => (
                                                        <div key={perm.id}
                                                            onClick={() => togglePermission(perm.id)}
                                                            style={{
                                                                padding: '10px',
                                                                border: formData.permissionIds.includes(perm.id) ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                                                borderRadius: '8px',
                                                                background: formData.permissionIds.includes(perm.id) ? '#eff6ff' : 'white',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '18px', height: '18px', borderRadius: '4px',
                                                                border: formData.permissionIds.includes(perm.id) ? 'none' : '2px solid #cbd5e1',
                                                                background: formData.permissionIds.includes(perm.id) ? '#3b82f6' : 'transparent',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                {formData.permissionIds.includes(perm.id) && <Check size={12} color="white" />}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                                                    {perm.name.split(':')[1]?.toUpperCase() || perm.name}
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{perm.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ));
                                })()}
                            </form>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                            <button form="roleForm" type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ التغييرات</button>
                            <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9' }}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
