import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit, Trash, Search } from 'lucide-react';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, [search]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get(`/purchasing/suppliers?search=${search}`);
            setSuppliers(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await apiClient.patch(`/purchasing/suppliers/${editingSupplier.id}`, formData);
            } else {
                await apiClient.post('/purchasing/suppliers', formData);
            }
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contact: '', phone: '', email: '', address: '' });
            fetchSuppliers();
        } catch (e) {
            alert('فشل حفظ المورد');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
        try {
            await apiClient.delete(`/purchasing/suppliers/${id}`);
            fetchSuppliers();
        } catch (e) {
            alert('فشل حذف المورد');
        }
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>الموردين</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', right: '10px', top: '10px', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="input-field"
                            style={{ paddingRight: '35px' }}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingSupplier(null);
                        setFormData({ name: '', contact: '', phone: '', email: '', address: '' });
                        setShowModal(true);
                    }}>
                        <Plus size={18} /> إضافة مورد
                    </button>
                </div>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>رقم الهاتف</th>
                                <th>جهة الاتصال</th>
                                <th>العنوان</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>جاري التحميل...</td></tr>
                            ) : suppliers.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>لا توجد بيانات</td></tr>
                            ) : (
                                suppliers.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 'bold' }}>{s.name}</td>
                                        <td dir="ltr" style={{ textAlign: 'right' }}>{s.phone || '-'}</td>
                                        <td>{s.contact || '-'}</td>
                                        <td>{s.address || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => {
                                                    setEditingSupplier(s);
                                                    setFormData({
                                                        name: s.name,
                                                        contact: s.contact || '',
                                                        phone: s.phone || '',
                                                        email: s.email || '',
                                                        address: s.address || ''
                                                    });
                                                    setShowModal(true);
                                                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '500px' }}>
                        <h2>{editingSupplier ? 'تعديل بيانات مورد' : 'إضافة مورد جديد'}</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم المورد / الشركة</label>
                                <input
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم الشخص المسؤول (اختياري)</label>
                                <input
                                    className="input-field"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رقم الهاتف</label>
                                <input
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    dir="ltr"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>العنوان</label>
                                <input
                                    className="input-field"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
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
