import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Package, Filter } from 'lucide-react';
import apiClient from '../api/client';

interface Transaction {
    id: number;
    movementType: string;
    qtyChange: number;
    createdAt: string;
    notes?: string;
    stockLocation: {
        name: string;
        branch: {
            name: string;
        };
    };
    user: {
        fullName: string;
    };
}

interface Summary {
    productId: number;
    productName: string;
    totalSales: number;
    totalReturns: number;
    currentStock: number;
    totalValue: number;
}

interface Props {
    product: any;
    onClose: () => void;
}

export default function ProductTransactions({ product, onClose }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        if (product?.id) {
            fetchData();
        }
    }, [product?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transactionsRes, summaryRes] = await Promise.all([
                apiClient.get(`/products/${product.id}/transactions`),
                apiClient.get(`/products/${product.id}/transactions/summary`),
            ]);
            setTransactions(transactionsRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMovementColor = (type: string) => {
        const colors: any = {
            SALE: '#ef4444',
            RETURN: '#10b981',
            ADJUSTMENT: '#f59e0b',
            GRN: '#3b82f6',
            TRANSFER_IN: '#8b5cf6',
            TRANSFER_OUT: '#ec4899',
        };
        return colors[type] || '#64748b';
    };

    const getMovementLabel = (type: string) => {
        const labels: any = {
            SALE: 'بيع',
            RETURN: 'مرتجع',
            ADJUSTMENT: 'تسوية',
            GRN: 'استلام بضاعة',
            TRANSFER_IN: 'تحويل وارد',
            TRANSFER_OUT: 'تحويل صادر',
        };
        return labels[type] || type;
    };

    const filteredTransactions = filterType
        ? transactions.filter(t => t.movementType === filterType)
        : transactions;

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
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                            سجل حركات المخزون
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                            {product.nameAr || product.nameEn}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            color: '#6b7280',
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        جاري التحميل...
                    </div>
                ) : (
                    <div style={{ padding: '24px' }}>
                        {/* Summary Cards */}
                        {summary && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px',
                            }}>
                                <div style={{
                                    background: '#f0f9ff',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #bfdbfe',
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: '#3b82f6', marginBottom: '8px' }}>
                                        المخزون الحالي
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                                        {summary.currentStock}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                        القيمة: {summary.totalValue.toFixed(2)} ر.س
                                    </div>
                                </div>

                                <div style={{
                                    background: '#fef2f2',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #fecaca',
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: '#ef4444', marginBottom: '8px' }}>
                                        إجمالي المبيعات
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                                        {summary.totalSales}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                        وحدة
                                    </div>
                                </div>

                                <div style={{
                                    background: '#f0fdf4',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #bbf7d0',
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '8px' }}>
                                        المرتجعات
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                                        {summary.totalReturns}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                        وحدة
                                    </div>
                                </div>

                                <div style={{
                                    background: '#faf5ff',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e9d5ff',
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: '#8b5cf6', marginBottom: '8px' }}>
                                        صافي الحركة
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                                        {summary.totalSales - summary.totalReturns}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                        وحدة
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filter */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            marginBottom: '24px',
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                        }}>
                            <Filter size={18} color="#6b7280" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    flex: 1,
                                }}
                            >
                                <option value="">جميع الحركات</option>
                                <option value="SALE">بيع</option>
                                <option value="RETURN">مرتجع</option>
                                <option value="ADJUSTMENT">تسوية</option>
                                <option value="GRN">استلام بضاعة</option>
                                <option value="TRANSFER_IN">تحويل وارد</option>
                                <option value="TRANSFER_OUT">تحويل صادر</option>
                            </select>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {filteredTransactions.length} حركة
                            </div>
                        </div>

                        {/* Transactions Timeline */}
                        {filteredTransactions.length === 0 ? (
                            <div style={{
                                padding: '60px 20px',
                                textAlign: 'center',
                                color: '#9ca3af',
                            }}>
                                <Package size={48} style={{ margin: '0 auto 16px' }} />
                                <div>لا توجد حركات</div>
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                {filteredTransactions.map((transaction, index) => (
                                    <div key={transaction.id} style={{
                                        display: 'flex',
                                        gap: '16px',
                                        marginBottom: index < filteredTransactions.length - 1 ? '24px' : 0,
                                    }}>
                                        {/* Timeline */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '40px',
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: getMovementColor(transaction.movementType),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                            }}>
                                                {transaction.qtyChange > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            {index < filteredTransactions.length - 1 && (
                                                <div style={{
                                                    width: '2px',
                                                    flex: 1,
                                                    background: '#e5e7eb',
                                                    minHeight: '20px',
                                                }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{
                                            flex: 1,
                                            background: '#f9fafb',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'start',
                                                marginBottom: '8px',
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                }}>
                                                    {getMovementLabel(transaction.movementType)}
                                                </div>
                                                <div style={{
                                                    fontSize: '1.25rem',
                                                    fontWeight: 'bold',
                                                    color: transaction.qtyChange > 0 ? '#10b981' : '#ef4444',
                                                }}>
                                                    {transaction.qtyChange > 0 ? '+' : ''}{transaction.qtyChange}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                                                {new Date(transaction.createdAt).toLocaleString('ar-EG')}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                                                {transaction.stockLocation.name} - {transaction.stockLocation.branch.name}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                بواسطة: {transaction.user.fullName}
                                            </div>
                                            {transaction.notes && (
                                                <div style={{
                                                    marginTop: '12px',
                                                    padding: '8px 12px',
                                                    background: '#fef3c7',
                                                    borderRadius: '4px',
                                                    fontSize: '0.875rem',
                                                    color: '#92400e',
                                                }}>
                                                    {transaction.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
