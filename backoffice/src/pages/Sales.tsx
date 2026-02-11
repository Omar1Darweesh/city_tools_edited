import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { ShoppingCart, Eye, Filter, X } from 'lucide-react';

interface Sale {
    id: number;
    invoiceNo: string;
    createdAt: string;
    total: number;
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    platformCommission: number;
    shippingFee: number;
    paymentMethod: string;
    paymentStatus: string;
    paidAmount: number;
    remainingAmount: number;
    channel?: string;
    channelName?: string;
    customer?: { name: string };
    user?: { fullName: string; id: number };
    branch?: { name: string };
    costOfGoods?: number;
    grossProfit?: number;
    netProfit?: number;
    profitMargin?: number;
    totalRefunded?: number;
    netRevenue?: number;
}

// ✅ NEW: Add interfaces for users and customers
interface User {
    id: number;
    fullName: string;
}

interface Customer {
    id: number;
    name: string;
}

export default function Sales() {
    const navigate = useNavigate();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [channels, setChannels] = useState<string[]>([]); // ✅ NEW

    // ✅ UPDATED: Add new filter fields
    const [filters, setFilters] = useState({
        dateFilter: 'all',
        paymentMethod: 'ALL',
        userId: 'ALL',        // ✅ NEW
        customerId: 'ALL',    // ✅ NEW
        channel: 'ALL',       // ✅ NEW
        startDate: '',
        endDate: '',
        search: '',
    });

    const [showFilters, setShowFilters] = useState(false);

    // ✅ NEW: Fetch users and customers for dropdowns
    useEffect(() => {
        fetchUsersAndCustomers();
    }, []);

    const fetchUsersAndCustomers = async () => {
        try {
            // Fetch users
            const usersRes = await apiClient.get('/users');
            setUsers(usersRes.data.data || usersRes.data || []);

            // ✅ FIXED: Correct endpoint
            const customersRes = await apiClient.get('/pos/customers');
            setCustomers(customersRes.data || []);

            // ✅ NEW: Fetch channels from database
            const channelsRes = await apiClient.get('/pos/channels');
            setChannels(channelsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch users/customers:', error);
        }
    };


    useEffect(() => {
        fetchSales();

        const handleFocus = () => fetchSales();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [filters]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params: any = {};

            if (filters.dateFilter !== 'all') {
                params.dateFilter = filters.dateFilter;
            }

            if (filters.dateFilter === 'custom' && filters.startDate && filters.endDate) {
                params.startDate = filters.startDate;
                params.endDate = filters.endDate;
            }

            if (filters.paymentMethod !== 'ALL') {
                params.paymentMethod = filters.paymentMethod;
            }

            // ✅ NEW: Add new filter params
            if (filters.userId !== 'ALL') {
                params.userId = filters.userId;
            }

            if (filters.customerId !== 'ALL') {
                params.customerId = filters.customerId;
            }

            if (filters.channel !== 'ALL') {
                params.channel = filters.channel;
            }

            if (filters.search) {
                params.search = filters.search;
            }

            const res = await apiClient.get('/pos/sales', { params });
            setSales(res.data.data);
        } catch (error) {
            console.error('Failed to fetch sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (saleId: number) => {
        navigate(`/sales/${saleId}`);
    };

    const resetFilters = () => {
        setFilters({
            dateFilter: 'all',
            paymentMethod: 'ALL',
            userId: 'ALL',
            customerId: 'ALL',
            channel: 'ALL',
            startDate: '',
            endDate: '',
            search: '',
        });
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShoppingCart size={32} color="#2563eb" />
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>المبيعات</h1>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        padding: '10px 16px',
                        background: showFilters ? '#2563eb' : 'white',
                        color: showFilters ? 'white' : '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                    }}
                >
                    <Filter size={18} />
                    {showFilters ? 'إخفاء الفلتر' : 'إظهار الفلتر'}
                </button>
            </div>

            {/* ✅ UPDATED: Filters Panel with 7 filters */}
            {showFilters && (
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                        {/* Search */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                بحث (رقم الفاتورة أو العميل)
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="ابحث..."
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            />
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                فترة زمنية
                            </label>
                            <select
                                value={filters.dateFilter}
                                onChange={(e) => setFilters({ ...filters, dateFilter: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            >
                                <option value="all">الكل</option>
                                <option value="today">اليوم</option>
                                <option value="yesterday">أمس</option>
                                <option value="thisWeek">هذا الأسبوع</option>
                                <option value="thisMonth">هذا الشهر</option>
                                <option value="custom">تخصيص</option>
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                طريقة الدفع
                            </label>
                            <select
                                value={filters.paymentMethod}
                                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            >
                                <option value="ALL">الكل</option>
                                <option value="CASH">نقدي</option>
                                <option value="CARD">بطاقة</option>
                                <option value="TRANSFER">تحويل</option>
                                <option value="INSTAPAY">إنستاباي</option>
                                <option value="FAWRY">فوري</option>
                                <option value="WALLET">محفظة</option>
                            </select>
                        </div>

                        {/* ✅ NEW: User Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                بواسطة (المستخدم)
                            </label>
                            <select
                                value={filters.userId}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            >
                                <option value="ALL">جميع المستخدمين</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.fullName}</option>
                                ))}
                            </select>
                        </div>

                        {/* ✅ NEW: Customer Filter */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                العميل
                            </label>
                            <select
                                value={filters.customerId}
                                onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            >
                                <option value="ALL">جميع العملاء</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* ✅ UPDATED: Channel Filter - Dynamic from DB */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                القناة
                            </label>
                            <select
                                value={filters.channel}
                                onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                            >
                                <option value="ALL">جميع القنوات</option>
                                {channels.map(channel => (
                                    <option key={channel} value={channel}>{channel}</option>
                                ))}
                            </select>
                        </div>


                        {/* Reset Button */}
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button
                                onClick={resetFilters}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                <X size={16} />
                                إعادة تعيين
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {filters.dateFilter === 'custom' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                    من تاريخ
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                                    إلى تاريخ
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sales Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        {/* ✅ UPDATED TABLE HEADERS */}
                        <thead style={{ background: '#f9fafb', position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>رقم الفاتورة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>التاريخ والوقت</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>العميل</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الصافي</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الخصم</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الضريبة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>عمولة المنصة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>
                                    رسوم الشحن
                                </th>

                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الإجمالي</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>المرتجع</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الصافي</th>

                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>حالة الدفع</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>المتبقي</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>التكلفة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الربح الصافي</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>الهامش %</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>القناة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>المدفوع</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>بواسطة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>إجراءات</th>
                            </tr>
                        </thead>

                        {/* ✅ UPDATED TABLE BODY */}
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={19} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan={19} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                        لا توجد مبيعات
                                    </td>
                                </tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#2563eb' }}>
                                            {sale.invoiceNo}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {new Date(sale.createdAt).toLocaleString('ar-EG', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.customer?.name || 'عميل نقدي (Retail)'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {Number(sale.subtotal || 0).toFixed(2)} ر.س
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.totalDiscount > 0 ? `-${Number(sale.totalDiscount).toFixed(2)} ر.س` : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            +{Number(sale.totalTax || 0).toFixed(2)} ر.س
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.platformCommission > 0 ? `+${Number(sale.platformCommission).toFixed(2)} ر.س` : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.shippingFee && sale.shippingFee > 0 ? `${Number(sale.shippingFee).toFixed(2)} ر.س` : '-'}
                                        </td>

                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: '700', fontSize: '15px' }}>
                                            {Number(sale.total).toFixed(2)} ر.س
                                        </td>

                                        {/* After Total cell */}
                                        <td style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            color: sale.totalRefunded && sale.totalRefunded > 0 ? '#dc2626' : '#6b7280',
                                            fontWeight: sale.totalRefunded && sale.totalRefunded > 0 ? 'bold' : 'normal'
                                        }}>
                                            {sale.totalRefunded && sale.totalRefunded > 0
                                                ? `-${Number(sale.totalRefunded).toFixed(2)} ج.م`
                                                : '-'}
                                        </td>

                                        <td style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            fontWeight: '600',
                                            fontSize: '15px'
                                        }}>
                                            {sale.netRevenue !== undefined
                                                ? `${Number(sale.netRevenue).toFixed(2)} ج.م`
                                                : `${Number(sale.total).toFixed(2)} ج.م`}
                                        </td>


                                        {/* ✅ NEW: Payment Status Cell */}
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.paymentStatus === 'PAID' ? (
                                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                                                    مدفوع
                                                </span>
                                            ) : sale.paymentStatus === 'PARTIAL' ? (
                                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#fed7aa', color: '#ea580c' }}>
                                                    مدفوع جزئياً
                                                </span>
                                            ) : (
                                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                                    غير مدفوع
                                                </span>
                                            )}
                                        </td>

                                        {/* ✅ NEW: Remaining Amount Cell */}
                                        <td style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            fontWeight: '600',
                                            color: sale.remainingAmount > 0 ? '#dc2626' : '#16a34a'
                                        }}>
                                            {sale.remainingAmount > 0 ? `${Number(sale.remainingAmount).toFixed(2)} ر.س` : '-'}
                                        </td>

                                        {/* Profit Cells */}
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.costOfGoods !== undefined ? `${sale.costOfGoods.toFixed(2)} ر.س` : '-'}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            color: (sale.netProfit || 0) >= 0 ? '#16a34a' : '#dc2626',
                                            fontWeight: 'bold'
                                        }}>
                                            {sale.netProfit !== undefined ? `${sale.netProfit.toFixed(2)} ر.س` : '-'}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            color: (sale.profitMargin || 0) >= 0 ? '#16a34a' : '#dc2626',
                                            fontWeight: '600'
                                        }}>
                                            {sale.profitMargin !== undefined ? `${sale.profitMargin.toFixed(1)}%` : '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.channelName || sale.channel || '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.paymentMethod}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            {sale.user?.fullName || '-'}
                                        </td>
                                        <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                                            <button
                                                onClick={() => handleViewDetails(sale.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#2563eb',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                <Eye size={14} />
                                                عرض
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            {/* ✅ UPDATED: Summary - Now shows Net Revenue (after returns) */}
            {!loading && sales.length > 0 && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        إجمالي المبيعات: <span style={{ fontWeight: 'bold', color: '#374151' }}>{sales.length}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>
                        {/* ✅ CHANGED: From sale.total to sale.netRevenue */}
                        صافي الإيرادات: {sales.reduce((sum, sale) => sum + Number((sale.netRevenue !== null && sale.netRevenue !== undefined) ? sale.netRevenue : sale.total), 0).toFixed(2)} ر.س
                    </div>
                </div>
            )}
        </div>
    );
}
