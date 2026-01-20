import { useState, useEffect } from 'react';
import { Clock, X, User, Calendar, Edit, Plus, Trash, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

interface AuditEntry {
    id: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    changes: Array<{
        field: string;
        oldValue: any;
        newValue: any;
    }>;
    user: {
        id: number;
        username: string;
        fullName: string;
    };
    timestamp: string;
    product: {
        id: number;
        code: string;
        nameEn: string;
        nameAr: string;
    };
}

interface ProductAuditHistoryProps {
    productId: number;
    productName: string;
    onClose: () => void;
}

export default function ProductAuditHistory({ productId, productName, onClose }: ProductAuditHistoryProps) {
    const [audits, setAudits] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditHistory();
    }, [productId]);

    const fetchAuditHistory = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/products/${productId}/audit-history`);
            setAudits(response.data);
        } catch (error) {
            console.error('Failed to fetch audit history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE':
                return <Plus size={16} style={{ color: '#10b981' }} />;
            case 'UPDATE':
                return <Edit size={16} style={{ color: '#f59e0b' }} />;
            case 'DELETE':
                return <Trash size={16} style={{ color: '#ef4444' }} />;
            default:
                return <AlertCircle size={16} style={{ color: '#6b7280' }} />;
        }
    };

    const getActionLabel = (action: string) => {
        const labels: any = {
            CREATE: 'إنشاء',
            UPDATE: 'تعديل',
            DELETE: 'حذف',
        };
        return labels[action] || action;
    };

    const getActionColor = (action: string) => {
        const colors: any = {
            CREATE: '#10b981',
            UPDATE: '#f59e0b',
            DELETE: '#ef4444',
        };
        return colors[action] || '#6b7280';
    };

    const getFieldLabel = (field: string) => {
        const labels: any = {
            nameEn: 'الاسم بالإنجليزية',
            nameAr: 'الاسم بالعربية',
            barcode: 'الباركود',
            code: 'الكود',
            priceRetail: 'سعر التجزئة',
            priceWholesale: 'سعر الجملة',
            cost: 'التكلفة',
            brand: 'الماركة',
            unit: 'الوحدة',
            active: 'الحالة',
            minQty: 'الحد الأدنى',
            maxQty: 'الحد الأقصى',
        };
        return labels[field] || field;
    };

    const formatValue = (value: any, field: string) => {
        if (value === null || value === undefined) return 'غير محدد';
        if (field === 'active') return value ? 'نشط' : 'غير نشط';
        if (field === 'priceRetail' || field === 'priceWholesale' || field === 'cost') {
            return `${Number(value).toFixed(2)} ر.س`;
        }
        return String(value);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f9fafb',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock size={24} style={{ color: '#6366f1' }} />
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                                سجل التعديلات
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                                {productName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            جاري التحميل...
                        </div>
                    ) : audits.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Clock size={48} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
                            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>لا يوجد سجل تعديلات</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                                لم يتم إجراء أي تعديلات على هذا المنتج بعد
                            </p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            {audits.map((audit, index) => (
                                <div
                                    key={audit.id}
                                    style={{
                                        position: 'relative',
                                        paddingRight: '3rem',
                                        paddingBottom: index < audits.length - 1 ? '2rem' : '0',
                                    }}
                                >
                                    {/* Timeline Line */}
                                    {index < audits.length - 1 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                right: '1.4rem',
                                                top: '2.5rem',
                                                bottom: 0,
                                                width: '2px',
                                                background: '#e5e7eb',
                                            }}
                                        />
                                    )}

                                    {/* Timeline Dot */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: '0.875rem',
                                            top: '0.5rem',
                                            width: '2rem',
                                            height: '2rem',
                                            borderRadius: '50%',
                                            background: getActionColor(audit.action),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '3px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {getActionIcon(audit.action)}
                                    </div>

                                    {/* Content Card */}
                                    <div
                                        style={{
                                            background: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.75rem',
                                            padding: '1rem',
                                        }}
                                    >
                                        {/* Header */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '0.75rem',
                                            }}
                                        >
                                            <div>
                                                <span
                                                    style={{
                                                        fontSize: '1rem',
                                                        fontWeight: '600',
                                                        color: getActionColor(audit.action),
                                                    }}
                                                >
                                                    {getActionLabel(audit.action)}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={12} />
                                                    {new Date(audit.timestamp).toLocaleString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.75rem',
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                            }}
                                        >
                                            <User size={14} />
                                            <span>{audit.user.fullName}</span>
                                        </div>

                                        {/* Changes */}
                                        {audit.changes.length > 0 && (
                                            <div style={{ marginTop: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: '#6b7280',
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    التغييرات:
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {audit.changes.map((change, idx) => (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                background: 'white',
                                                                padding: '0.75rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.875rem',
                                                                border: '1px solid #e5e7eb',
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                                                                {getFieldLabel(change.field)}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                                                                    {formatValue(change.oldValue, change.field)}
                                                                </span>
                                                                <span style={{ color: '#6b7280' }}>←</span>
                                                                <span style={{ color: '#10b981', fontWeight: '600' }}>
                                                                    {formatValue(change.newValue, change.field)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
