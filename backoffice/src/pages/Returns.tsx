import { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Filter, X } from 'lucide-react'; // ✅ Add Filter, X
import apiClient from '../api/client';

const styles = {
    container: { padding: '20px', fontFamily: 'inherit' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
    card: { background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '20px' },
    tableContainer: { overflowX: 'auto' as const },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px', textAlign: 'right' as const, background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '600', color: '#475569' },
    td: { padding: '12px', textAlign: 'right' as const, borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' },
    badgeSuccess: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', display: 'inline-block', background: '#dcfce7', color: '#166534' },
    badgeNeutral: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', display: 'inline-block', background: '#f1f5f9', color: '#64748b' },
    btnReturn: { padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: '#3b82f6', color: 'white', transition: 'all 0.2s' },
    modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '12px', width: '90%', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' as const, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    modalHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e293b' },
    modalBody: { padding: '20px', overflowY: 'auto' as const, flex: 1 },
    modalFooter: { padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    closeBtn: { background: 'none', border: 'none', fontSize: '28px', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 },
    btnConfirm: { padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: '#10b981', color: 'white' },
    btnCancel: { padding: '10px 24px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: '#f1f5f9', color: '#475569' },
    errorBanner: { background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    successBanner: { background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }
};

interface ReturnItem {
    lineId: string;
    productId: number;
    productName: string;
    barcode: string;
    availableToReturn: number;
    returnQty: number;
    unitPrice: number;
    refundAmount: number;
    returnType: 'STOCK' | 'DEFECTIVE';
    taxRate?: number; // ✅ Add this

}

interface DefectedProductPricing {
    lineId: string;
    priceRetail: string;
    priceWholesale: string;
}

interface User {
    id: number;
    fullName: string;
}

interface Customer {
    id: number;
    name: string;
}

export default function Returns() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [defectedPricing, setDefectedPricing] = useState<DefectedProductPricing[]>([]);
    const [defectiveStatus, setDefectiveStatus] = useState<Record<string, any>>({});
    const [defectiveProducts, setDefectiveProducts] = useState<Record<number, boolean>>({});
    const [invoiceReturns, setInvoiceReturns] = useState<Record<number, number>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateFilter: 'all',
        userId: 'ALL',
        customerId: 'ALL',
        channel: 'ALL',
        search: '',
        startDate: '',
        endDate: '',
    });

    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [channels, setChannels] = useState<string[]>([]);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);


    // ✅ NEW: Fetch filter data
    useEffect(() => {
        fetchFilterData();
    }, []);

    const fetchFilterData = async () => {
        try {
            const [usersRes, customersRes, channelsRes] = await Promise.all([
                apiClient.get('users'),
                apiClient.get('pos/customers'),
                apiClient.get('pos/channels'),
            ]);

            setUsers(usersRes.data.data || usersRes.data || []);
            setCustomers(customersRes.data || []);
            setChannels(channelsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch filter data:', error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    const fetchInvoices = async () => {
        try {
            const branchId = JSON.parse(localStorage.getItem('user')!).branch?.id;
            if (!branchId) {
                setError('لم يتم العثور على معلومات الفرع');
                setLoading(false);
                return;
            }

            const params: any = { branchId };

            if (filters.dateFilter !== 'all') {
                params.dateFilter = filters.dateFilter;
            }

            if (filters.dateFilter === 'custom' && filters.startDate && filters.endDate) {
                params.startDate = filters.startDate;
                params.endDate = filters.endDate;
            }

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
            const response: any = await apiClient.get('pos/sales', { params });
            const invoicesData = response.data?.data || response.data;

            if (!Array.isArray(invoicesData)) {
                console.error('Invalid invoices data:', invoicesData);
                setInvoices([]);
                setLoading(false);
                return;
            }

            setInvoices(invoicesData);

            // ✅ Fetch ALL returns once
            if (invoicesData.length > 0) {
                try {
                    const allReturnsResponse: any = await apiClient.get(`pos/returns?branchId=${branchId}`);
                    const allReturnsData = allReturnsResponse.data?.data || allReturnsResponse.data;

                    // ✅ Calculate total refunds per invoice
                    const returnsMap: Record<number, number> = {};

                    if (Array.isArray(allReturnsData)) {
                        allReturnsData.forEach((returnRecord: any) => {
                            const invoiceId = returnRecord.salesInvoiceId;
                            const refundAmount = Number(returnRecord.totalRefund) || 0;

                            if (!returnsMap[invoiceId]) {
                                returnsMap[invoiceId] = 0;
                            }
                            returnsMap[invoiceId] += refundAmount;
                        });
                    }

                    console.log('✅ Returns map:', returnsMap);
                    setInvoiceReturns(returnsMap);
                } catch (err) {
                    console.error('Failed to fetch returns:', err);
                    setInvoiceReturns({});
                }
            }

        } catch (err: any) {
            console.error('Failed to fetch invoices:', err);
            setError('فشل في تحميل الفواتير');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };
    const resetFilters = () => {
        setFilters({
            dateFilter: 'all',
            userId: 'ALL',
            customerId: 'ALL',
            channel: 'ALL',
            search: '',
            startDate: '',
            endDate: '',
        });
    }
    const handleOpenReturn = async (invoice: any) => {
        try {
            setError('');
            const branchId = JSON.parse(localStorage.getItem('user')!).branch?.id;

            console.log('📋 Opening return for invoice:', invoice.id);

            // Fetch full invoice details
            const salesResponse: any = await apiClient.get(`pos/sales/${invoice.id}?branchId=${branchId}`);
            console.log('📦 Sales response:', salesResponse);

            // ✅ Handle different response structures for sales invoice
            let fullInvoice: any;
            if (salesResponse?.lines) {
                fullInvoice = salesResponse;
            } else if (salesResponse?.data?.lines) {
                fullInvoice = salesResponse.data;
            } else if (salesResponse?.data?.data?.lines) {
                fullInvoice = salesResponse.data.data;
            } else {
                console.error('❌ Could not find invoice lines in response:', salesResponse);
                throw new Error('Invalid sales invoice response structure');
            }

            console.log('✅ Full invoice:', fullInvoice);
            console.log('✅ Invoice lines:', fullInvoice.lines);

            // Fetch existing returns
            const existingReturnsResponse: any = await apiClient.get(`pos/returns?salesInvoiceId=${invoice.id}`);
            console.log('📦 Existing returns response:', existingReturnsResponse);

            // ✅ Handle different response structures for returns
            let existingReturnsData: any[] = [];
            if (existingReturnsResponse?.data && Array.isArray(existingReturnsResponse.data)) {
                existingReturnsData = existingReturnsResponse.data;
            } else if (Array.isArray(existingReturnsResponse)) {
                existingReturnsData = existingReturnsResponse;
            } else if (existingReturnsResponse?.data?.data && Array.isArray(existingReturnsResponse.data.data)) {
                existingReturnsData = existingReturnsResponse.data.data;
            }

            console.log('✅ Existing returns data:', existingReturnsData);

            const returnedQty = new Map<number, number>();
            existingReturnsData.forEach((ret: any) => {
                ret.lines?.forEach((line: any) => {
                    const current = returnedQty.get(line.productId) || 0;
                    returnedQty.set(line.productId, current + line.qtyReturned);
                });
            });

            console.log('✅ Returned quantities:', returnedQty);

            // ✅ 1. CHECK DEFECTIVE STATUS & PRICING FOR ALL ITEMS UPFRONT
            console.log('🔍 Checking defective status for', fullInvoice.lines.length, 'products');

            const statusResults = await Promise.all(
                fullInvoice.lines.map(async (line: any) => {
                    const productId = line.productId || line.product?.id;
                    const barcode = line.barcode || line.product?.barcode || '';

                    try {
                        // Fetch both simplified status and full details (pricing, etc)
                        const [isDefectiveRes, checkStatusRes] = await Promise.all([
                            apiClient.get(`pos/returns/is-defective/${productId}`),
                            apiClient.get(`pos/returns/check-defective/${productId}`)
                        ]);

                        return {
                            productId,
                            isDefective: isDefectiveRes.data.isDefective || false,
                            status: checkStatusRes.data
                        };
                    } catch (error: any) {
                        console.error(`❌ Error checking product ${productId}:`, error);
                        return {
                            productId,
                            isDefective: barcode.endsWith('_DEF'),
                            status: { exists: false, error: true }
                        };
                    }
                })
            );

            // Create maps
            const defectiveMap: Record<number, boolean> = {};
            const statusMap: Record<string, any> = {};

            statusResults.forEach(({ productId, isDefective, status }, index) => {
                const lineId = `${productId}-${index}`;
                defectiveMap[productId] = isDefective;
                statusMap[lineId] = status;
            });

            console.log('✅ Defective status map:', statusMap);

            setDefectiveProducts(defectiveMap);
            setDefectiveStatus(statusMap);


            // ✅ Calculate tax rate from invoice
            const invoiceSubtotal = Number(fullInvoice.subtotal) || 0;
            const invoiceTax = Number(fullInvoice.totalTax) || 0;
            const taxRate = invoiceSubtotal > 0 ? invoiceTax / invoiceSubtotal : 0;

            console.log(`📊 Invoice tax rate: ${(taxRate * 100).toFixed(2)}% (Tax: ${invoiceTax}, Subtotal: ${invoiceSubtotal})`);

            const items: ReturnItem[] = fullInvoice.lines.map((line: any, index: number) => {
                const productId = line.productId || line.product?.id;
                const productName = line.productName || line.product?.nameAr || line.product?.nameEn;
                const barcode = line.barcode || line.product?.barcode || '';
                const alreadyReturned = returnedQty.get(productId) || 0;
                const availableToReturn = line.qty - alreadyReturned;

                // SET INITIAL RETURN TYPE BASED ON DEFECTIVE STATUS
                const isDefective = defectiveMap[productId] || false;

                return {
                    lineId: `${productId}-${index}`,
                    productId: productId,
                    productName: productName,
                    barcode: barcode,
                    availableToReturn,
                    returnQty: 0,
                    unitPrice: line.unitPrice,
                    refundAmount: 0,
                    returnType: isDefective ? 'DEFECTIVE' : 'STOCK',
                    taxRate: taxRate, // ✅ Store tax rate for later calculation
                };
            });


            console.log('✅ Created return items:', items);

            setReturnItems(items);
            setSelectedInvoice(invoice);
            setShowModal(true);
        } catch (err: any) {
            console.error('❌ Failed to open return modal:', err);
            setError(err.message || 'فشل في فتح نافذة الإرجاع');
        }
    };





    const updateReturnQty = (lineId: string, qty: number) => {
        setReturnItems((prevItems) =>
            prevItems.map((item) => {
                if (item.lineId === lineId) {
                    const validQty = Math.max(0, Math.min(qty, item.availableToReturn));

                    // Auto-set to DEFECTIVE if product is defective and qty > 0
                    let returnType = item.returnType;
                    if (defectiveProducts[item.productId] && validQty > 0) {
                        returnType = 'DEFECTIVE';
                    }

                    // Check defective status for pricing when quantity is set
                    if (!defectiveStatus[lineId]) {
                        checkDefectiveStatus(item.productId, lineId);
                    }

                    // ✅ Calculate refund including proportional tax
                    const itemSubtotal = validQty * item.unitPrice;
                    const itemTax = itemSubtotal * (item.taxRate || 0);
                    const totalRefund = itemSubtotal + itemTax;

                    console.log(`💰 Refund calculation for ${item.productName}:`);
                    console.log(`   Qty: ${validQty}, Unit Price: ${item.unitPrice}`);
                    console.log(`   Subtotal: ${itemSubtotal.toFixed(2)}`);
                    console.log(`   Tax (${((item.taxRate || 0) * 100).toFixed(2)}%): ${itemTax.toFixed(2)}`);
                    console.log(`   Total Refund: ${totalRefund.toFixed(2)}`);

                    return {
                        ...item,
                        returnQty: validQty,
                        refundAmount: totalRefund, // ✅ Include tax in refund
                        returnType,
                    };
                }
                return item;
            })
        );
    };




    const checkDefectiveStatus = async (productId: number, lineId: string) => {
        // No longer needed as we fetch upfront, but keeping for safety/fallback
        if (defectiveStatus[lineId]) return;

        try {
            const response = await apiClient.get(`pos/returns/check-defective/${productId}`);
            if (isMounted.current) {
                setDefectiveStatus(prev => ({
                    ...prev,
                    [lineId]: response.data
                }));
            }
        } catch (error) {
            console.error('Failed to check defective status:', error);
        }
    };

    // ✅ FIXED: Properly update only the specific product's return type
    const updateReturnType = (lineId: string, type: 'STOCK' | 'DEFECTIVE') => {
        setReturnItems(prevItems =>
            prevItems.map(item => {
                if (item.lineId === lineId) {
                    return { ...item, returnType: type };
                }
                return item;
            })
        );
    };

    // Update defected product pricing
    const updateDefectedPricing = (lineId: string, field: 'priceRetail' | 'priceWholesale', value: string) => {
        setDefectedPricing(prev => {
            const existing = prev.find(p => p.lineId === lineId);
            if (existing) {
                return prev.map(p =>
                    p.lineId === lineId
                        ? { ...p, [field]: value }
                        : p
                );
            } else {
                return [...prev, { lineId, priceRetail: '', priceWholesale: '', [field]: value }];
            }
        });
    };

    // Get defected pricing for a line
    const getDefectedPricing = (lineId: string): DefectedProductPricing => {
        return defectedPricing.find(p => p.lineId === lineId) || {
            lineId,
            priceRetail: '',
            priceWholesale: ''
        };
    };

    // ✅ ADD THIS NEW FUNCTION - Frontend validation
    const canSubmit = () => {
        const itemsToReturn = returnItems.filter(item => item.returnQty > 0);

        if (itemsToReturn.length === 0) return false;

        // Check if any defective items need pricing
        for (const item of itemsToReturn) {
            // Only validate pricing if:
            // 1. User selected DEFECTIVE return type
            // 2. The original product is NOT already a defective product
            if (item.returnType === "DEFECTIVE" && !defectiveProducts[item.productId]) {
                const pricing = getDefectedPricing(item.lineId);
                const status = defectiveStatus[item.lineId];

                // If check-defective status is still loading, only block if we don't have prices entered
                // If the user has typed prices, let them proceed (as we'll use those prices anyway)
                if (!status && !pricing.priceRetail && !pricing.priceWholesale) return false;

                // If status exists and it's a NEW defective product, pricing is REQUIRED
                if (status && !status.exists) {
                    if (!pricing.priceRetail || !pricing.priceWholesale) {
                        return false; // ❌ Missing pricing
                    }

                    // Check if prices are valid numbers > 0
                    const retail = parseFloat(pricing.priceRetail);
                    const wholesale = parseFloat(pricing.priceWholesale);

                    if (isNaN(retail) || isNaN(wholesale) || retail <= 0 || wholesale <= 0) {
                        return false; // ❌ Invalid pricing
                    }
                }
            }
        }

        return true; // ✅ All validation passed
    };


    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError("");

            const returnLines = returnItems
                .filter((item) => item.returnQty > 0)
                .map((i) => {
                    const line: any = {
                        productId: i.productId,
                        qtyReturned: i.returnQty,
                        refundAmount: i.refundAmount,
                        returnType: i.returnType,
                    };

                    // Only send pricing if:
                    // 1. Return type is DEFECTIVE
                    // 2. Product is NOT already defective (converting normal → defective)
                    if (i.returnType === "DEFECTIVE" && !defectiveProducts[i.productId]) {
                        const pricing = getDefectedPricing(i.lineId);
                        if (pricing.priceRetail && pricing.priceWholesale) {
                            line.defectedProductPricing = {
                                priceRetail: parseFloat(pricing.priceRetail),
                                priceWholesale: parseFloat(pricing.priceWholesale),
                            };
                        }
                    }

                    return line;
                });

            if (returnLines.length === 0) {
                alert("الرجاء اختيار منتج واحد على الأقل للإرجاع");
                setSubmitting(false);
                return;
            }

            // ✅ ADD THIS - Frontend validation BEFORE API call
            for (const line of returnLines) {
                if (line.returnType === "DEFECTIVE" && !defectiveProducts[line.productId]) {
                    const item = returnItems.find(i => i.productId === line.productId);
                    if (item) {
                        const status = defectiveStatus[item.lineId];

                        if (!status?.exists && !line.defectedProductPricing) {
                            setError(`أسعار المنتج المعيب مطلوبة للمنتج: ${item.productName}`);
                            setSubmitting(false);
                            return; // ⚠️ STOP - Don't send request
                        }
                    }
                }
            }

            await apiClient.post("pos/returns", {
                salesInvoiceId: selectedInvoice.id,
                items: returnLines,
                reason,
            });

            setSuccess("تم إرجاع المنتجات بنجاح");
            setShowModal(false);
            setDefectedPricing([]);
            fetchInvoices();

            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            // Extract error message from backend
            let errorMessage = "فشل في إرجاع المنتجات";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            // Show error to user
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };


    const filteredInvoices = Array.isArray(invoices) ? invoices : [];

    return (
        <div style={styles.container}>
            {/* ✅ UPDATED: Header with filter button */}
            <div style={styles.header}>
                <h1 style={styles.title}>المرتجعات</h1>
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

            {error && <div style={styles.errorBanner}>{error}</div>}
            {success && <div style={styles.successBanner}>{success}</div>}

            {/* ✅ NEW: Filters Panel */}
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

                        {/* User Filter */}
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

                        {/* Customer Filter */}
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

                        {/* Channel Filter */}
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

            {/* Rest of your existing table code stays the same */}

            <div style={styles.card}>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>رقم الفاتورة</th>
                                <th style={styles.th}>التاريخ</th>
                                <th style={styles.th}>العميل</th>
                                <th style={styles.th}>الفرع</th>
                                <th style={styles.th}>الإجمالي</th>
                                <th style={styles.th}>الحالة</th>
                                <th style={styles.th}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={styles.td}>جاري التحميل...</td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={styles.td}>لا توجد فواتير</td>
                                </tr>
                            ) : (
                                filteredInvoices.map(inv => (
                                    <tr
                                        key={inv.id}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                        style={{ transition: 'background 0.2s' }}
                                    >
                                        <td style={styles.td}>#{inv.invoiceNo}</td>
                                        <td style={styles.td}>{new Date(inv.createdAt).toLocaleDateString('ar-EG')}</td>
                                        <td style={styles.td}>{inv.customer?.name || 'عميل نقدي'}</td>
                                        <td style={styles.td}>{inv.branch.name}</td>
                                        <td style={styles.td}>
                                            {(() => {
                                                const returnAmount = Number(invoiceReturns[inv.id]) || 0;
                                                const invoiceTotal = Number(inv.total) || 0;

                                                return returnAmount > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                            {invoiceTotal.toFixed(2)} ر.س
                                                        </div>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>
                                                            {(invoiceTotal - returnAmount).toFixed(2)} ر.س
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#ef4444' }}>
                                                            - {returnAmount.toFixed(2)} مرتجع
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>{invoiceTotal.toFixed(2)} ر.س</div>
                                                );
                                            })()}
                                        </td>


                                        <td style={styles.td}>
                                            <span style={styles.badgeSuccess}>مكتملة</span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.btnReturn} onClick={() => handleOpenReturn(inv)}>
                                                إرجاع
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>إرجاع منتجات - فاتورة #{selectedInvoice?.invoiceNo}</h2>
                            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>المنتج</th>
                                            <th style={styles.th}>الباركود</th>
                                            <th style={{ ...styles.th, textAlign: 'center' }}>متاح للإرجاع</th>
                                            <th style={{ ...styles.th, textAlign: 'center' }}>الكمية</th>
                                            <th style={styles.th}>نوع الإرجاع</th>
                                            <th style={styles.th}>السعر</th>
                                            <th style={styles.th}>استرداد</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnItems.map(item => (
                                            <tr key={item.lineId} style={{ background: item.availableToReturn === 0 ? '#f9fafb' : 'white' }}>
                                                <td style={{ ...styles.td, opacity: item.availableToReturn === 0 ? 0.5 : 1 }}>
                                                    {item.productName}
                                                </td>
                                                <td style={{ ...styles.td, fontFamily: 'monospace', color: '#64748b' }}>
                                                    {item.barcode}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    <span style={item.availableToReturn > 0 ? styles.badgeSuccess : styles.badgeNeutral}>
                                                        {item.availableToReturn}
                                                    </span>
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    {item.availableToReturn > 0 ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                            <button
                                                                onClick={() => updateReturnQty(item.lineId, item.returnQty - 1)}
                                                                disabled={item.returnQty === 0}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #cbd5e1',
                                                                    background: 'white',
                                                                    cursor: item.returnQty === 0 ? 'not-allowed' : 'pointer',
                                                                    opacity: item.returnQty === 0 ? 0.5 : 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                                                                {item.returnQty}
                                                            </span>
                                                            <button
                                                                onClick={() => updateReturnQty(item.lineId, item.returnQty + 1)}
                                                                disabled={item.returnQty >= item.availableToReturn}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    background: item.returnQty >= item.availableToReturn ? '#cbd5e1' : '#3b82f6',
                                                                    color: 'white',
                                                                    cursor: item.returnQty >= item.availableToReturn ? 'not-allowed' : 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {item.returnQty > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <select
                                                                value={item.returnType}
                                                                onChange={(e) => {
                                                                    console.log(`Changing line ${item.lineId} product ${item.productId} to ${e.target.value}`);
                                                                    updateReturnType(item.lineId, e.target.value as 'STOCK' | 'DEFECTIVE');
                                                                }}
                                                                disabled={defectiveProducts[item.productId]} // ✅ Disable for defective
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    borderRadius: '0.375rem',
                                                                    border: '1px solid #d1d5db',
                                                                    background: defectiveProducts[item.productId]
                                                                        ? '#f3f4f6'  // ✅ Gray background when disabled
                                                                        : (item.returnType === 'DEFECTIVE' ? '#fee2e2' : '#f0fdf4'),
                                                                    color: defectiveProducts[item.productId]
                                                                        ? '#6b7280'  // ✅ Gray text when disabled
                                                                        : (item.returnType === 'DEFECTIVE' ? '#7f1d1d' : '#14532d'),
                                                                    fontWeight: 600,
                                                                    cursor: defectiveProducts[item.productId] ? 'not-allowed' : 'pointer', // ✅ Not-allowed cursor
                                                                    fontSize: '0.875rem',
                                                                    width: '100%',
                                                                    opacity: defectiveProducts[item.productId] ? 0.6 : 1, // ✅ Reduce opacity
                                                                }}
                                                            >
                                                                <option value="STOCK">إرجاع للمخزن</option>
                                                                <option value="DEFECTIVE">معيب</option>
                                                            </select>


                                                            {/* Price inputs for defected items */}
                                                            {item.returnType === 'DEFECTIVE' && (
                                                                <div style={{
                                                                    padding: '10px',
                                                                    background: defectiveProducts[item.productId] ? '#ecfdf5' : (defectiveStatus[item.lineId]?.exists ? '#f0f9ff' : '#fef3c7'),
                                                                    border: `2px solid ${defectiveProducts[item.productId] ? '#10b981' : (defectiveStatus[item.lineId]?.exists ? '#3b82f6' : '#fbbf24')}`,
                                                                    borderRadius: '8px',
                                                                    fontSize: '12px'
                                                                }}>

                                                                    {/* ✅ NEW: Check if product being returned IS ALREADY DEFECTIVE */}
                                                                    {defectiveProducts[item.productId] ? (
                                                                        // ✅ Product IS already defective - just return it to stock
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            color: '#065f46',
                                                                            fontWeight: 600
                                                                        }}>
                                                                            <span style={{ fontSize: '16px' }}>✓</span>
                                                                            <span>المنتج معيب مسبقاً - سيتم إرجاعه مباشرة للمخزون</span>
                                                                        </div>
                                                                    ) : (
                                                                        // ✅ Product is NOT defective - converting normal product to defective
                                                                        <>
                                                                            {/* Status Badge */}
                                                                            <div style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '8px',
                                                                                marginBottom: '10px',
                                                                                paddingBottom: '8px',
                                                                                borderBottom: '1px solid #e5e7eb'
                                                                            }}>
                                                                                {defectiveStatus[item.lineId] ? (
                                                                                    defectiveStatus[item.lineId].exists ? (
                                                                                        <>
                                                                                            <span style={{
                                                                                                fontSize: '11px',
                                                                                                padding: '4px 10px',
                                                                                                background: '#dbeafe',
                                                                                                color: '#1e40af',
                                                                                                borderRadius: '6px',
                                                                                                fontWeight: 600,
                                                                                                border: '1px solid #3b82f6'
                                                                                            }}>
                                                                                                ✓ منتج معيب موجود مسبقاً
                                                                                            </span>
                                                                                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                                                                                                سيتم إضافة الكمية للمنتج الموجود
                                                                                            </span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <span style={{
                                                                                                fontSize: '11px',
                                                                                                padding: '4px 10px',
                                                                                                background: '#fef3c7',
                                                                                                color: '#92400e',
                                                                                                borderRadius: '6px',
                                                                                                fontWeight: 600,
                                                                                                border: '1px solid #fbbf24'
                                                                                            }}>
                                                                                                ★ منتج معيب جديد
                                                                                            </span>
                                                                                            <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>
                                                                                                يجب إدخال أسعار البيع
                                                                                            </span>
                                                                                        </>
                                                                                    )
                                                                                ) : (
                                                                                    <span style={{
                                                                                        fontSize: '11px',
                                                                                        padding: '4px 10px',
                                                                                        background: '#f1f5f9',
                                                                                        color: '#64748b',
                                                                                        borderRadius: '6px',
                                                                                        fontWeight: 600
                                                                                    }}>
                                                                                        ⏳ جاري التحقق...
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {/* Original Product Price Reference */}
                                                                            {defectiveStatus[item.lineId]?.originalProduct && (
                                                                                <div style={{
                                                                                    background: '#f8fafc',
                                                                                    padding: '8px',
                                                                                    borderRadius: '6px',
                                                                                    marginBottom: '10px',
                                                                                    fontSize: '11px'
                                                                                }}>
                                                                                    <div style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                                                                        📋 السعر الأصلي للمنتج:
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', gap: '16px', color: '#64748b' }}>
                                                                                        <span>تجزئة: <strong>{Number(defectiveStatus[item.lineId].originalProduct.priceRetail).toFixed(2)} ج.م</strong></span>
                                                                                        <span>جملة: <strong>{Number(defectiveStatus[item.lineId].originalProduct.priceWholesale).toFixed(2)} ج.م</strong></span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Existing Defective Price Info */}
                                                                            {defectiveStatus[item.lineId]?.exists && defectiveStatus[item.lineId]?.defectiveProduct && (
                                                                                <div style={{
                                                                                    background: '#ecfdf5',
                                                                                    padding: '8px',
                                                                                    borderRadius: '6px',
                                                                                    marginBottom: '10px',
                                                                                    fontSize: '11px',
                                                                                    border: '1px solid #10b981'
                                                                                }}>
                                                                                    <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                                                                                        💰 السعر الحالي للمنتج المعيب:
                                                                                    </div>
                                                                                    <div style={{ display: 'flex', gap: '16px', color: '#047857' }}>
                                                                                        <span>تجزئة: <strong>{Number(defectiveStatus[item.lineId].defectiveProduct.priceRetail).toFixed(2)} ج.م</strong></span>
                                                                                        <span>جملة: <strong>{Number(defectiveStatus[item.lineId].defectiveProduct.priceWholesale).toFixed(2)} ج.م</strong></span>
                                                                                    </div>
                                                                                    <div style={{ fontSize: '10px', color: '#059669', marginTop: '4px' }}>
                                                                                        💡 اترك الحقول فارغة لاستخدام هذه الأسعار، أو أدخل أسعار جديدة للتحديث
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Price Input Fields - ONLY SHOW IF NOT ALREADY EXISTS OR USER WANTS TO UPDATE */}
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                                <div>
                                                                                    <label style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '6px',
                                                                                        fontSize: '11px',
                                                                                        color: '#475569',
                                                                                        marginBottom: '4px',
                                                                                        fontWeight: 600
                                                                                    }}>
                                                                                        <span>سعر التجزئة للمنتج المعيب</span>
                                                                                        {defectiveStatus[item.lineId]?.exists ? (
                                                                                            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 400 }}>
                                                                                                (اختياري)
                                                                                            </span>
                                                                                        ) : defectiveStatus[item.lineId] ? (
                                                                                            <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>
                                                                                                (مطلوب)
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </label>
                                                                                    <input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        min="0"
                                                                                        placeholder={
                                                                                            defectiveStatus[item.lineId]?.exists && defectiveStatus[item.lineId]?.defectiveProduct
                                                                                                ? Number(defectiveStatus[item.lineId].defectiveProduct.priceRetail).toFixed(2)
                                                                                                : ''
                                                                                        }
                                                                                        value={getDefectedPricing(item.lineId).priceRetail}
                                                                                        onChange={(e) => updateDefectedPricing(item.lineId, 'priceRetail', e.target.value)}
                                                                                        style={{
                                                                                            width: '100%',
                                                                                            padding: '6px 10px',
                                                                                            border: `1px solid ${defectiveStatus[item.lineId]?.exists ? '#10b981' : '#fbbf24'}`,
                                                                                            borderRadius: '6px',
                                                                                            fontSize: '13px',
                                                                                            fontWeight: '600',
                                                                                            outline: 'none'
                                                                                        }}
                                                                                    />
                                                                                </div>

                                                                                <div>
                                                                                    <label style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '6px',
                                                                                        fontSize: '11px',
                                                                                        color: '#475569',
                                                                                        marginBottom: '4px',
                                                                                        fontWeight: 600
                                                                                    }}>
                                                                                        <span>سعر الجملة للمنتج المعيب</span>
                                                                                        {defectiveStatus[item.lineId]?.exists ? (
                                                                                            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 400 }}>
                                                                                                (اختياري)
                                                                                            </span>
                                                                                        ) : defectiveStatus[item.lineId] ? (
                                                                                            <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>
                                                                                                (مطلوب)
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </label>
                                                                                    <input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        min="0"
                                                                                        placeholder={
                                                                                            defectiveStatus[item.lineId]?.exists && defectiveStatus[item.lineId]?.defectiveProduct
                                                                                                ? Number(defectiveStatus[item.lineId].defectiveProduct.priceWholesale).toFixed(2)
                                                                                                : ''
                                                                                        }
                                                                                        value={getDefectedPricing(item.lineId).priceWholesale}
                                                                                        onChange={(e) => updateDefectedPricing(item.lineId, 'priceWholesale', e.target.value)}
                                                                                        style={{
                                                                                            width: '100%',
                                                                                            padding: '6px 10px',
                                                                                            border: `1px solid ${defectiveStatus[item.lineId]?.exists ? '#10b981' : '#fbbf24'}`,
                                                                                            borderRadius: '6px',
                                                                                            fontSize: '13px',
                                                                                            fontWeight: '600',
                                                                                            outline: 'none'
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}




                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#9ca3af' }}>-</span>
                                                    )}
                                                    {defectiveProducts[item.productId] && (
                                                        <div style={{
                                                            marginTop: '4px',
                                                            padding: '4px 8px',
                                                            backgroundColor: '#fef3c7',
                                                            border: '1px solid #fbbf24',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            color: '#92400e',
                                                        }}>
                                                            ⚠️ هذا منتج معيب - يجب إرجاعه كمنتج معيب فقط
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={styles.td}>{item.unitPrice.toFixed(2)}</td>
                                                <td style={{ ...styles.td, fontWeight: 'bold', color: item.refundAmount > 0 ? '#16a34a' : '#cbd5e1' }}>
                                                    {item.refundAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '14px', color: '#475569' }}>
                                    السبب (اختياري)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="اكتب سبب الإرجاع..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        minHeight: '80px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical' as const
                                    }}
                                />
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                style={styles.btnCancel}
                                onClick={() => setShowModal(false)}
                            >
                                إلغاء
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <button
                                    style={{
                                        ...styles.btnConfirm,
                                        opacity: !canSubmit() ? 0.5 : 1,
                                        cursor: !canSubmit() ? 'not-allowed' : 'pointer',
                                        background: !canSubmit() ? '#94a3b8' : '#10b981',
                                    }}
                                    onClick={handleSubmit}
                                    disabled={submitting || !canSubmit()}
                                >
                                    {submitting ? "جاري الإرجاع..." : "تأكيد الإرجاع"}
                                </button>

                                {/* Helper text when button is disabled */}
                                {!canSubmit() && returnItems.some(i => i.returnQty > 0) && (
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#dc2626',
                                        textAlign: 'center',
                                        padding: '4px 8px',
                                        background: '#fee2e2',
                                        borderRadius: '6px',
                                    }}>
                                        ⚠️ يجب إدخال أسعار المنتجات المعيبة قبل الإرجاع
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}