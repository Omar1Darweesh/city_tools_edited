import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Printer, RotateCcw, AlertTriangle } from 'lucide-react';
import apiClient from '../api/client';

interface SaleDetail {
    id: number;
    invoiceNo: string;
    total: number;
    subtotal: number;
    totalTax: number;
    totalDiscount: number;
    platformCommission: number;
    shippingFee: number;
    costOfGoods: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    totalRefunded?: number;  // From backend
    netRevenue?: number;     // From backend
    paymentMethod: string;
    paymentStatus: string;
    channel: string;
    notes: string;
    createdAt: string;
    customer: {
        name: string;
        type: string;
    } | null;
    branch: {
        name: string;
    };
    user: {
        fullName: string;
    };
    lines: Array<{
        id: number;
        qty: number;
        unitPrice: number;
        lineTotal: number;
        taxRate: number;
        priceType?: 'RETAIL' | 'WHOLESALE' | 'CUSTOM'; // ADD THIS
        product: {
            nameEn: string;
            nameAr?: string;
            barcode: string;
        };
        productId: number;
    }>;
}

interface ReturnData {
    id: number;
    createdAt: string;
    reason: string;
    totalRefund: number;
    lines: Array<{
        id: number;
        productId: number;
        qtyReturned: number;
        refundAmount: number;
        product: {
            nameAr: string;
            nameEn: string;
            barcode: string;
        };
    }>;
}

export default function SalesDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState<SaleDetail | null>(null);
    const [returns, setReturns] = useState<ReturnData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(false);

                // Fetch sale details
                const saleResponse = await apiClient.get(`/pos/sales/${id}`);
                setSale(saleResponse.data);

                // Fetch returns for this invoice
                const returnsResponse = await apiClient.get('/pos/returns', {
                    params: { salesInvoiceId: id }
                });
                setReturns(returnsResponse.data.data || []);

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };
    // ✅ NEW: Refresh data function
    const refreshData = async () => {
        if (!id) return;
        try {
            setLoading(true);

            // Fetch fresh sale details (with updated profit!)
            const saleResponse = await apiClient.get(`/pos/sales/${id}`);
            setSale(saleResponse.data);

            // Fetch fresh returns
            const returnsResponse = await apiClient.get('/pos/returns', {
                params: { salesInvoiceId: id }
            });
            setReturns(returnsResponse.data.data || []);

            console.log('✅ Data refreshed - Profit updated!');
        } catch (err) {
            console.error('Failed to refresh data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals after returns
    const totalRefunded = returns.reduce((sum, ret) => sum + Number(ret.totalRefund || 0), 0);
    const netRevenue = sale ? Number(sale.total) - totalRefunded : 0;

    // ✅ ADD THIS NEW BLOCK - Calculate adjusted values for display
    const calculateAdjustedValues = () => {
        if (!sale || returns.length === 0) {
            // No returns - show original values
            return {
                remainingRevenue: Number(sale?.subtotal || 0) - Number(sale?.totalDiscount || 0),
                adjustedTax: Number(sale?.totalTax || 0),
                adjustedCommission: Number(sale?.platformCommission || 0),
                fixedShipping: Number(sale?.shippingFee || 0),
            };
        }

        // Calculate returned revenue (based on unit prices)
        let returnedRevenue = 0;
        for (const returnRecord of returns) {
            for (const returnLine of returnRecord.lines) {
                const originalLine = sale.lines.find((l) => l.productId === returnLine.productId);
                if (originalLine) {
                    returnedRevenue += Number(originalLine.unitPrice) * returnLine.qtyReturned;
                }
            }
        }

        // Original and remaining revenue
        const originalRevenue = Number(sale.subtotal) - Number(sale.totalDiscount || 0);
        const remainingRevenue = originalRevenue - returnedRevenue;

        // Calculate proportion
        const proportion = originalRevenue > 0 ? remainingRevenue / originalRevenue : 1;

        // Adjust tax and commission proportionally
        const adjustedTax = Number(sale.totalTax || 0) * proportion;
        const adjustedCommission = Number(sale.platformCommission || 0) * proportion;

        // Shipping stays fixed
        const fixedShipping = Number(sale.shippingFee || 0);

        return {
            remainingRevenue,
            adjustedTax,
            adjustedCommission,
            fixedShipping,
        };
    };

    const { remainingRevenue, adjustedTax, adjustedCommission, fixedShipping } = calculateAdjustedValues();

    // Calculate returned quantities per product
    const getReturnedQty = (productId: number) => {
        return returns.reduce((sum, ret) => {
            const line = ret.lines.find(l => l.productId === productId);
            return sum + (line ? line.qtyReturned : 0);
        }, 0);
    };

    const InfoCard = ({ label, value }: { label: string; value: string }) => (
        <div style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>{value}</div>
        </div>
    );

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                fontSize: '18px',
                color: '#6b7280'
            }}>
                جاري تحميل تفاصيل الفاتورة...
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                gap: '20px'
            }}>
                <div style={{ fontSize: '48px' }}>⚠️</div>
                <div style={{ fontSize: '20px', color: '#dc2626', fontWeight: 'bold' }}>
                    فشل تحميل تفاصيل الفاتورة
                </div>
                <button
                    onClick={() => navigate('/sales')}
                    style={{
                        padding: '10px 20px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    العودة إلى المبيعات
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .thermal-receipt, .thermal-receipt * { visibility: visible; }
                    .thermal-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        background: white;
                    }
                    .no-print { display: none !important; }
                    @page {
                        margin: 5mm 0;
                        size: 80mm auto;
                    }
                    * { font-family: 'Courier New', monospace; }
                }
            `}</style>

            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Screen Header */}
                <div className="no-print" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                            تفاصيل الفاتورة #{sale.invoiceNo}
                        </h1>
                        {returns.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                                <RotateCcw size={18} />
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                    تحتوي على {returns.length} عملية إرجاع
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => navigate('/sales')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <ArrowRight size={18} />
                            رجوع
                        </button>
                        <button
                            onClick={refreshData}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '1rem',
                            }}
                            title="تحديث البيانات"
                        >
                            🔄 تحديث
                        </button>
                        <button
                            onClick={handlePrint}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <Printer size={18} />
                            طباعة
                        </button>
                    </div>
                </div>

                {/* Thermal Receipt - BOLD & BLACK/WHITE FOR PRINT */}
                <div className="thermal-receipt" style={{
                    maxWidth: '80mm',
                    margin: '0 auto',
                    background: 'white',
                    padding: '10mm 5mm',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '12px',
                    lineHeight: '1.4',
                    color: '#000'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: '#000' }}>
                            City Tools System
                        </div>
                        <div style={{ fontSize: '11px', marginBottom: '2px', fontWeight: 'bold', color: '#000' }}>
                            {sale.branch.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#000', fontWeight: '600' }}>
                            نظام إدارة الأدوات والمبيعات
                        </div>
                    </div>

                    <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

                    {/* Invoice Info */}
                    <div style={{ fontSize: '11px', marginBottom: '8px', fontWeight: '600' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#000' }}>رقم الفاتورة:</span>
                            <span style={{ fontWeight: 'bold', color: '#000' }}>{sale.invoiceNo}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#000' }}>التاريخ:</span>
                            <span style={{ color: '#000' }}>{new Date(sale.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#000' }}>الوقت:</span>
                            <span style={{ color: '#000' }}>{new Date(sale.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#000' }}>الموظف:</span>
                            <span style={{ color: '#000' }}>{sale.user.fullName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#000' }}>العميل:</span>
                            <span style={{ color: '#000' }}>{sale.customer?.name || 'نقدي'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#000' }}>الدفع:</span>
                            <span style={{ color: '#000' }}>{sale.paymentMethod}</span>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

                    {/* Products */}
                    <div style={{ marginBottom: '8px' }}>
                        {sale.lines.map(line => {
                            const lineSubtotal = line.qty * Number(line.unitPrice);
                            return (
                                <div key={line.id} style={{ marginBottom: '6px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#000' }}>
                                        {line.product.nameAr || line.product.nameEn}
                                        {line.priceType === 'CUSTOM' && (
                                            <span style={{ fontSize: '9px', marginRight: '4px' }}> *</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                                        <span style={{ color: '#000' }}>
                                            {line.qty} x {Number(line.unitPrice).toFixed(2)}
                                            {line.priceType === 'CUSTOM' && (
                                                <span style={{ fontSize: '8px' }}> [خاص]</span>
                                            )}
                                        </span>
                                        <span style={{ fontWeight: 'bold', color: '#000' }}>{lineSubtotal.toFixed(2)} ج</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />


                    {/* Totals */}
                    <div style={{ fontSize: '11px', marginBottom: '8px', fontWeight: '600' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ color: '#000' }}>المجموع الفرعي:</span>
                            <span style={{ color: '#000' }}>{Number(sale.subtotal).toFixed(2)} ر.س</span>
                        </div>
                        {Number(sale.totalDiscount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ color: '#000' }}>الخصم:</span>
                                <span style={{ color: '#000' }}>-{Number(sale.totalDiscount).toFixed(2)} ر.س</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ color: '#000' }}>الضريبة:</span>
                            <span style={{ color: '#000' }}>+{Number(sale.totalTax).toFixed(2)} ر.س</span>
                        </div>
                        {/* Shipping Fee */}
                        {Number(sale.shippingFee) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ color: '#000' }}>رسوم الشحن:</span>
                                <span style={{ color: '#000' }}>
                                    +{Number(sale.shippingFee).toFixed(2)} ر.س  {/* ✅ FIXED! */}
                                </span>
                            </div>
                        )}

                    </div>

                    <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}>الإجمالي:</span>
                        <span style={{ color: '#000' }}>{Number(sale.total).toFixed(2)} ر.س</span>
                    </div>

                    <div style={{ borderTop: '2px solid #000', margin: '8px 0' }} />

                    {sale.notes && (
                        <div style={{ fontSize: '10px', marginBottom: '8px', fontWeight: '600', color: '#000' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>ملاحظات:</div>
                            <div>{sale.notes}</div>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px', color: '#000' }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>شكراً لتعاملكم معنا</div>
                        <div style={{ fontSize: '10px', marginBottom: '4px', fontWeight: 'bold', color: '#000' }}>Thank you for your business</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000' }}>{new Date().toLocaleString('ar-EG')}</div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px' }}>
                        <div style={{ background: '#000', height: '2px', width: '60%', margin: '0 auto 2px' }} />
                        <div style={{ background: '#000', height: '3px', width: '50%', margin: '0 auto 2px' }} />
                        <div style={{ background: '#000', height: '2px', width: '70%', margin: '0 auto 4px' }} />
                        <div style={{ fontWeight: 'bold', color: '#000' }}>{sale.invoiceNo}</div>
                    </div>

                </div>

                {/* Screen-only Details */}
                <div className="no-print" style={{ marginTop: '40px' }}>
                    {/* Info Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <InfoCard
                            label="التاريخ والوقت"
                            value={new Date(sale.createdAt).toLocaleString('ar-EG', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}
                        />
                        <InfoCard label="الموظف" value={sale.user.fullName} />
                        <InfoCard label="طريقة الدفع" value={sale.paymentMethod} />
                        <InfoCard label="القناة" value={sale.channel || '-'} />
                        <InfoCard
                            label="العميل"
                            value={sale.customer?.name ? `${sale.customer.name} (${sale.customer.type})` : 'عميل نقدي'}
                        />
                        <InfoCard label="الفرع" value={sale.branch.name} />
                    </div>

                    {/* 🔴 DETAILED ITEMS TABLE with Return History */}
                    <div style={{
                        background: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: '20px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid #e5e7eb'
                        }}>
                            📦 تفاصيل المنتجات
                        </h3>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#475569' }}>المنتج</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#475569' }}>الباركود</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#475569' }}>الكمية</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#475569' }}>مرتجع</th>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#475569' }}>السعر</th>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#475569' }}>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.lines.map((line) => {
                                        const returnedQty = getReturnedQty(line.productId);
                                        return (
                                            <tr key={line.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                                                    {line.product.nameAr || line.product.nameEn}
                                                    {line.priceType === 'CUSTOM' && (
                                                        <span style={{
                                                            marginRight: '8px',
                                                            padding: '2px 8px',
                                                            background: '#f3e8ff',
                                                            color: '#7c3aed',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}>
                                                            ★ سعر خاص
                                                        </span>
                                                    )}
                                                </td>

                                                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>
                                                    {line.product.barcode}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        background: '#dbeafe',
                                                        color: '#1e40af',
                                                        borderRadius: '12px',
                                                        fontSize: '13px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {line.qty}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {returnedQty > 0 ? (
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '4px 12px',
                                                            background: '#fee2e2',
                                                            color: '#dc2626',
                                                            borderRadius: '12px',
                                                            fontSize: '13px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {returnedQty}
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>-</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                                                    {Number(line.unitPrice).toFixed(2)} ر.س
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                                                    {Number(line.lineTotal).toFixed(2)} ر.س
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 🔴 RETURNS SECTION - NEW */}
                    {returns.length > 0 && (
                        <div style={{
                            background: '#fffbeb',
                            padding: '24px',
                            borderRadius: '8px',
                            border: '2px solid #fbbf24',
                            marginBottom: '30px'
                        }}>
                            <h3 style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#92400e',
                                marginBottom: '20px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #fcd34d'
                            }}>
                                <RotateCcw size={24} />
                                عمليات الإرجاع ({returns.length})
                            </h3>

                            {returns.map((returnData, idx) => (
                                <div key={returnData.id} style={{
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    marginBottom: idx < returns.length - 1 ? '16px' : '0',
                                    border: '1px solid #fde68a'
                                }}>
                                    {/* Return Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '16px',
                                        paddingBottom: '12px',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                                                إرجاع #{idx + 1}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {new Date(returnData.createdAt).toLocaleString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: '#dc2626'
                                        }}>
                                            -{Number(returnData.totalRefund).toFixed(2)} ر.س
                                        </div>
                                    </div>

                                    {/* Return Reason */}
                                    {returnData.reason && (
                                        <div style={{
                                            background: '#fef3c7',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            marginBottom: '16px',
                                            fontSize: '14px',
                                            color: '#92400e'
                                        }}>
                                            <strong>السبب:</strong> {returnData.reason}
                                        </div>
                                    )}

                                    {/* Returned Items */}
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: '#f9fafb' }}>
                                                    <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>المنتج</th>
                                                    <th style={{ padding: '10px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>الكمية المرتجعة</th>
                                                    <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>مبلغ الاسترداد</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {returnData.lines.map((line) => (
                                                    <tr key={line.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '10px', fontSize: '14px', color: '#374151' }}>
                                                            {line.product.nameAr || line.product.nameEn}
                                                            <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                                                                {line.product.barcode}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                padding: '4px 10px',
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                borderRadius: '8px',
                                                                fontSize: '13px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {line.qtyReturned}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '10px', fontSize: '14px', fontWeight: 'bold', color: '#dc2626' }}>
                                                            {Number(line.refundAmount).toFixed(2)} ر.س
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            {/* Returns Summary */}
                            <div style={{
                                marginTop: '20px',
                                padding: '16px',
                                background: 'white',
                                border: '2px solid #ef4444',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                        إجمالي المبالغ المستردة:
                                    </span>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                                        -{totalRefunded.toFixed(2)} ر.س
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== PROFIT ANALYSIS - OPTION 2 ==================== */}
                    <div style={{
                        background: '#ffffff',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: '30px',
                    }}>
                        <h3 style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: '20px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid #e5e7eb',
                        }}>
                            💰 تحليل الربحية التفصيلي
                            {returns.length > 0 && (
                                <span style={{
                                    fontSize: '14px',
                                    padding: '4px 12px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                }}>
                                    بعد المرتجعات
                                </span>
                            )}
                        </h3>

                        {/* SECTION 1: CUSTOMER PAYMENT INFO (INFORMATIONAL ONLY) */}
                        <div style={{
                            marginBottom: '24px',
                            padding: '20px',
                            background: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#1e40af',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <span style={{ fontSize: '22px' }}>💳</span>
                                حركة الأموال مع العميل
                            </div>

                            {/* Step 1: Original Payment */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                marginBottom: returns.length > 0 ? '16px' : '0',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px 18px',
                                    background: '#dbeafe',
                                    borderRadius: '8px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '20px' }}>✅</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e40af' }}>
                                            المبلغ المدفوع من العميل
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: 'bold', fontSize: '19px', color: '#1e40af' }}>
                                        {Number(sale.total).toFixed(2)} ر.س
                                    </span>
                                </div>

                                {/* Breakdown of original payment */}
                                <div style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    padding: '8px 18px 0 18px',
                                    lineHeight: '1.6',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>المجموع الفرعي:</span>
                                        <span>{Number(sale.subtotal).toFixed(2)} ر.س</span>
                                    </div>
                                    {sale.totalDiscount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: '#ef4444' }}>
                                            <span>الخصم:</span>
                                            <span>-{Number(sale.totalDiscount).toFixed(2)} ر.س</span>
                                        </div>
                                    )}
                                    {sale.totalTax > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span>الضريبة:</span>
                                            <span>+{Number(sale.totalTax).toFixed(2)} ر.س</span>
                                        </div>
                                    )}
                                    {sale.shippingFee > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>رسوم الشحن:</span>
                                            <span>+{Number(sale.shippingFee).toFixed(2)} ر.س</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Returns Section - Only if returns exist */}
                            {returns.length > 0 && (
                                <>
                                    {/* Visual Separator */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        margin: '16px 0',
                                    }}>
                                        <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                                        <span style={{ fontSize: '24px' }}>⬇️</span>
                                        <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }}></div>
                                    </div>

                                    {/* Returns Warning Box */}
                                    <div style={{
                                        padding: '12px 16px',
                                        background: '#fffbeb',
                                        border: '2px solid #fbbf24',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}>
                                        <span style={{ fontSize: '20px' }}>⚠️</span>
                                        <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                                            <strong>تم إرجاع {returns.length} منتج</strong> - تم استرجاع جزء من المبلغ للعميل
                                        </div>
                                    </div>

                                    {/* Refunded Amount */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px 18px',
                                        background: '#fee2e2',
                                        borderRadius: '8px',
                                        border: '2px solid #f87171',
                                        marginBottom: '16px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '20px' }}>🔄</span>
                                            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#dc2626' }}>
                                                المبلغ المسترد للعميل
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: 'bold', fontSize: '19px', color: '#dc2626' }}>
                                            -{totalRefunded.toFixed(2)} ر.س
                                        </span>
                                    </div>

                                    {/* Visual Separator */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        margin: '16px 0',
                                    }}>
                                        <div style={{ flex: 1, height: '2px', background: '#16a34a' }}></div>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>=</span>
                                        <div style={{ flex: 1, height: '2px', background: '#16a34a' }}></div>
                                    </div>

                                    {/* Final Net Amount */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px 18px',
                                        background: '#dcfce7',
                                        borderRadius: '8px',
                                        border: '2px solid #16a34a',
                                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '22px' }}>💵</span>
                                            <span style={{ fontWeight: 'bold', fontSize: '17px', color: '#16a34a' }}>
                                                صافي المبلغ النهائي
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#16a34a' }}>
                                            {netRevenue.toFixed(2)} ر.س
                                        </span>
                                    </div>

                                    {/* Explanation Note */}
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '10px 14px',
                                        background: '#f1f5f9',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#475569',
                                        lineHeight: '1.5',
                                    }}>
                                        <strong>💡 ملاحظة:</strong> العميل دفع {Number(sale.total).toFixed(2)} ر.س في البداية، ثم استرجع {totalRefunded.toFixed(2)} ر.س بعد المرتجعات. المبلغ الصافي الذي حصلت عليه هو {netRevenue.toFixed(2)} ر.س
                                    </div>
                                </>
                            )}

                            {/* No Returns - Show simple summary */}
                            {returns.length === 0 && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '10px 14px',
                                    background: '#ecfdf5',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#065f46',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <span>✅</span>
                                    <span>لا يوجد مرتجعات - المبلغ الكامل مستلم</span>
                                </div>
                            )}
                        </div>

                        {/* ==================== BRIDGE SECTION ==================== */}
                        {returns.length > 0 && (
                            <div style={{
                                background: '#fffbeb',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '2px solid #fbbf24',
                                marginBottom: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}>
                                <div style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#92400e',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <span style={{ fontSize: '20px' }}>📋</span>
                                    تحليل المبلغ المستلم من العميل
                                </div>

                                <div style={{
                                    fontSize: '14px',
                                    color: '#78350f',
                                    marginBottom: '12px',
                                    lineHeight: '1.6',
                                }}>
                                    من أصل <strong style={{ color: '#16a34a' }}>{netRevenue.toFixed(2)} ر.س</strong> المستلمة من العميل، إليك التوزيع:
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    background: '#ffffff',
                                    padding: '16px',
                                    borderRadius: '8px',
                                }}>
                                    {/* Revenue Portion */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 14px',
                                        background: '#ecfdf5',
                                        borderRadius: '6px',
                                        border: '1px solid #86efac',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>💵</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                                                إيرادات المبيعات (بعد الخصم)
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>
                                            {remainingRevenue.toFixed(2)} ر.س
                                        </span>
                                    </div>

                                    {/* Tax + Shipping Combined */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 14px',
                                        background: '#fef3c7',
                                        borderRadius: '6px',
                                        border: '1px solid #fde047',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '16px' }}>📦</span>
                                            <span style={{ fontSize: '14px', color: '#78350f' }}>
                                                الضريبة + رسوم الشحن
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#92400e' }}>
                                            +{(netRevenue - remainingRevenue).toFixed(2)} ر.س
                                        </span>
                                    </div>

                                    {/* Total Check */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 14px',
                                        background: '#f0f9ff',
                                        borderRadius: '6px',
                                        border: '2px solid #3b82f6',
                                        marginTop: '4px',
                                    }}>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af' }}>
                                            = المجموع (التحقق)
                                        </span>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e40af' }}>
                                            {netRevenue.toFixed(2)} ر.س ✅
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Breakdown */}
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px 14px',
                                    background: '#f8fafc',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#64748b',
                                    lineHeight: '1.6',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>تفصيل دقيق:</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>• الإيرادات بعد الخصم:</span>
                                        <span>{remainingRevenue.toFixed(2)} ر.س</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>• الضريبة المعدلة:</span>
                                        <span>{adjustedTax.toFixed(2)} ر.س</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span>• رسوم الشحن (ثابتة):</span>
                                        <span>{fixedShipping.toFixed(2)} ر.س</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '4px', marginTop: '4px', fontWeight: 'bold', color: '#1e40af' }}>
                                        <span>= المجموع:</span>
                                        <span>{netRevenue.toFixed(2)} ر.س</span>
                                    </div>
                                </div>

                                {/* Explanation Note */}
                                <div style={{
                                    marginTop: '12px',
                                    padding: '10px 14px',
                                    background: '#fef3c7',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: '#78350f',
                                    lineHeight: '1.5',
                                    border: '1px solid #fde68a',
                                }}>
                                    <strong>💡 ملاحظة:</strong> من أصل {netRevenue.toFixed(2)} ر.س، فقط <strong>{remainingRevenue.toFixed(2)} ر.س</strong> تعتبر إيرادات حقيقية تستخدم في حساب الربح.
                                </div>
                            </div>
                        )}



                        {/* SECTION 2: PROFIT CALCULATION */}
                        <div style={{
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                        }}>
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <span style={{ fontSize: '20px' }}>📊</span>
                                حساب صافي الربح
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>

                                {/* 1. Net Revenue (Starting Point) */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px 20px',
                                    background: '#ecfdf5',
                                    fontSize: '15px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>💵</span>
                                        <span style={{ fontWeight: 'bold', color: '#065f46' }}>صافي الإيرادات (بعد الخصم)</span>
                                    </div>
                                    <span style={{ fontWeight: 'bold', fontSize: '17px', color: '#065f46' }}>
                                        {remainingRevenue.toFixed(2)} ر.س
                                    </span>
                                </div>

                                {/* 2. Cost of Goods */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 20px 12px 40px',
                                    background: '#ffffff',
                                    fontSize: '14px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#9ca3af' }}>📦</span>
                                        <span style={{ color: '#6b7280' }}>تكلفة البضاعة</span>
                                    </div>
                                    <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                        -{Number(sale.costOfGoods || 0).toFixed(2)} ر.س
                                    </span>
                                </div>

                                {/* 3. Tax (adjusted) */}
                                {adjustedTax > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 20px 12px 40px',
                                        background: '#ffffff',
                                        fontSize: '14px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#9ca3af' }}>📊</span>
                                            <span style={{ color: '#6b7280' }}>الضريبة</span>
                                        </div>
                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                            -{adjustedTax.toFixed(2)} ر.س
                                        </span>
                                    </div>
                                )}

                                {/* 4. Platform Commission (adjusted) */}
                                {adjustedCommission > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 20px 12px 40px',
                                        background: '#ffffff',
                                        fontSize: '14px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#9ca3af' }}>💼</span>
                                            <span style={{ color: '#6b7280' }}>عمولة المنصة</span>
                                        </div>
                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                            -{adjustedCommission.toFixed(2)} ر.س
                                        </span>
                                    </div>
                                )}

                                {/* 5. Shipping Fee (FIXED) */}
                                {fixedShipping > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 20px 12px 40px',
                                        background: '#ffffff',
                                        fontSize: '14px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#9ca3af' }}>🚚</span>
                                            <span style={{ color: '#6b7280' }}>رسوم الشحن</span>
                                        </div>
                                        <span style={{ color: '#ef4444', fontWeight: 600 }}>
                                            -{fixedShipping.toFixed(2)} ر.س
                                        </span>
                                    </div>
                                )}

                                {/* = NET PROFIT (FINAL RESULT) */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px 20px',
                                    background: sale.netProfit >= 0 ? '#f0fdf4' : '#fef2f2',
                                    fontSize: '16px',
                                    borderTop: '3px solid #111827',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '22px' }}>{sale.netProfit >= 0 ? '✅' : '⚠️'}</span>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: sale.netProfit >= 0 ? '#065f46' : '#991b1b'
                                        }}>
                                            = صافي الربح النهائي
                                        </span>
                                    </div>
                                    <span style={{
                                        fontWeight: 'bold',
                                        fontSize: '19px',
                                        color: sale.netProfit >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                        {Number(sale.netProfit || 0).toFixed(2)} ر.س
                                    </span>
                                </div>

                            </div>

                            {/* Profit Margin Badge */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '16px',
                            }}>
                                <div style={{
                                    padding: '10px 24px',
                                    background: sale.profitMargin >= 0 ? '#ecfdf5' : '#fef2f2',
                                    border: `2px solid ${sale.profitMargin >= 0 ? '#10b981' : '#ef4444'}`,
                                    borderRadius: '20px',
                                    fontSize: '15px',
                                }}>
                                    <span style={{ fontWeight: '600', color: '#374151' }}>هامش الربح: </span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: sale.profitMargin >= 0 ? '#10b981' : '#ef4444',
                                        fontSize: '17px',
                                    }}>
                                        {Number(sale.profitMargin || 0).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* Formula Explanation */}
                        <div style={{
                            marginTop: '16px',
                            padding: '12px 16px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#92400e',
                            lineHeight: '1.6',
                        }}>
                            <strong>💡 المعادلة:</strong> صافي الربح = صافي الإيرادات - (تكلفة البضاعة + الضريبة + العمولة + الشحن)
                            <br />
                            <strong>هامش الربح</strong> = (صافي الربح ÷ صافي الإيرادات) × 100
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
