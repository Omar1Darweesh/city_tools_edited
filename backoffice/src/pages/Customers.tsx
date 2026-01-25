import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Edit2 } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone?: string;
    type: 'RETAIL' | 'WHOLESALE';
    taxNumber?: string;
    active: boolean;
}

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: '',
        phone: '',
        type: 'RETAIL',
        taxNumber: '',
        active: true
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchCustomers = async () => {
        try {
            const res = await apiClient.get('/customers');
            setCustomers(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiClient.patch(`/customers/${editingId}`, formData);
            } else {
                await apiClient.post('/customers', formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', phone: '', type: 'RETAIL', taxNumber: '', active: true });
            fetchCustomers();
        } catch (error) {
            alert('Error saving customer');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingId(customer.id);
        setFormData(customer);
        setShowModal(true);
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>العملاء</h1>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', phone: '', type: 'RETAIL', taxNumber: '', active: true });
                        setShowModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                    <Plus size={20} />
                    <span>إضافة عميل</span>
                </button>
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>نوع العميل</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td style={{ color: '#64748b' }}>#{customer.id}</td>
                                    <td style={{ fontWeight: '600' }}>{customer.name}</td>
                                    <td dir="ltr" style={{ textAlign: 'right' }}>{customer.phone || '-'}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            background: customer.type === 'WHOLESALE' ? '#f3e8ff' : '#dbeafe',
                                            color: customer.type === 'WHOLESALE' ? '#7e22ce' : '#1e40af'
                                        }}>
                                            {customer.type === 'WHOLESALE' ? 'جملة (شركات)' : 'قطاعي (أفراد)'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            background: customer.active ? '#dcfce7' : '#fee2e2',
                                            color: customer.active ? '#166534' : '#991b1b'
                                        }}>
                                            {customer.active ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleEdit(customer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>لا يوجد عملاء مضافين</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '450px' }}>
                        <h2 style={{ marginBottom: '20px' }}>{editingId ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم العميل</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رقم الهاتف</label>
                                <input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    dir="ltr"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>نوع العميل</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="input-field"
                                >
                                    <option value="RETAIL">قطاعي (Retail)</option>
                                    <option value="WHOLESALE">جملة (Wholesale)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    حفظ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn"
                                    style={{ flex: 1, background: '#eee' }}
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
