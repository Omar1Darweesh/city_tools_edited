import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Package, Download, Search, Filter, RefreshCw } from 'lucide-react';

interface Product {
    id: number;
    code: string;
    barcode: string;
    nameAr: string;
    nameEn: string;
    cost: number;
    costAvg: number;
    priceRetail: number;
    priceWholesale: number;
    stock: number;
    retailMargin?: number;
    wholesaleMargin?: number;
    retailProfit?: number;
    wholesaleProfit?: number;
    category?: any;
    itemType?: any;
}

interface VerificationData {
    summary: {
        totalProducts: number;
        zeroCostAvgCount: number;
        retailLossCount: number;
        wholesaleLossCount: number;
        lowMarginCount: number;
        highMarginCount: number;
        stockedWithoutPriceCount: number;
    };
    categories: {
        zeroCostAvg: Product[];
        retailLoss: Product[];
        wholesaleLoss: Product[];
        lowMargin: Product[];
        highMargin: Product[];
        stockedWithoutPrice: Product[];
    };
    allProductsWithMargins: Product[];
}

export default function CostVerification() {
    const [data, setData] = useState<VerificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'zeroCostAvg' | 'retailLoss' | 'wholesaleLoss' | 'lowMargin' | 'highMargin' | 'stockedWithoutPrice'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyWithStock, setShowOnlyWithStock] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: response } = await apiClient.get('/products/cost-verification');
            setData(response);
        } catch (error) {
            console.error('Failed to fetch cost verification data:', error);
            alert('فشل تحميل بيانات التحقق من التكلفة');
        } finally {
            setLoading(false);
        }
    };

    const getDisplayProducts = (): Product[] => {
        if (!data) return [];

        let products: Product[] = [];

        if (selectedCategory === 'all') {
            products = data.allProductsWithMargins;
        } else {
            products = data.categories[selectedCategory] || [];
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            products = products.filter(p =>
                p.nameAr?.toLowerCase().includes(term) ||
                p.nameEn?.toLowerCase().includes(term) ||
                p.code?.toLowerCase().includes(term) ||
                p.barcode?.toLowerCase().includes(term)
            );
        }

        // Apply stock filter
        if (showOnlyWithStock) {
            products = products.filter(p => p.stock > 0);
        }

        return products;
    };

    const exportToCSV = () => {
        const products = getDisplayProducts();
        if (products.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }

        const headers = ['الكود', 'الباركود', 'الاسم بالعربية', 'الاسم بالإنجليزية', 'التكلفة الأخيرة', 'متوسط التكلفة', 'سعر القطاعي', 'سعر الجملة', 'هامش القطاعي %', 'هامش الجملة %', 'الربح القطاعي', 'الربح الجملة', 'المخزون'];
        const rows = products.map(p => [
            p.code,
            p.barcode,
            p.nameAr,
            p.nameEn,
            p.cost.toFixed(2),
            p.costAvg.toFixed(2),
            p.priceRetail.toFixed(2),
            p.priceWholesale.toFixed(2),
            p.retailMargin?.toFixed(2) || '0',
            p.wholesaleMargin?.toFixed(2) || '0',
            p.retailProfit?.toFixed(2) || '0',
            p.wholesaleProfit?.toFixed(2) || '0',
            p.stock
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cost_verification_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const displayProducts = getDisplayProducts();

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <RefreshCw size={48} className="spin" style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>جاري تحميل البيانات...</h2>
                </div>
            </div>
        );
    }

    if (!data) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>لا توجد بيانات</div>;
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '2rem',
            direction: 'rtl'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px -12px rgba(102, 126, 234, 0.4)',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <DollarSign size={40} />
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>
                            التحقق من التكلفة والهوامش
                        </h1>
                        <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>
                            تحليل شامل لتكاليف المنتجات والهوامش الربحية
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginTop: '1.5rem'
                }}>
                    <SummaryCard
                        title="إجمالي المنتجات"
                        value={data.summary.totalProducts}
                        icon={<Package size={24} />}
                        color="#10b981"
                    />
                    <SummaryCard
                        title="متوسط تكلفة = 0"
                        value={data.summary.zeroCostAvgCount}
                        icon={<AlertTriangle size={24} />}
                        color="#f59e0b"
                    />
                    <SummaryCard
                        title="خسارة قطاعي"
                        value={data.summary.retailLossCount}
                        icon={<TrendingDown size={24} />}
                        color="#ef4444"
                    />
                    <SummaryCard
                        title="خسارة جملة"
                        value={data.summary.wholesaleLossCount}
                        icon={<TrendingDown size={24} />}
                        color="#dc2626"
                    />
                    <SummaryCard
                        title="هامش منخفض (<10%)"
                        value={data.summary.lowMarginCount}
                        icon={<TrendingDown size={24} />}
                        color="#f97316"
                    />
                    <SummaryCard
                        title="هامش مرتفع (>100%)"
                        value={data.summary.highMarginCount}
                        icon={<TrendingUp size={24} />}
                        color="#8b5cf6"
                    />
                    <SummaryCard
                        title="مخزون بدون سعر"
                        value={data.summary.stockedWithoutPriceCount}
                        icon={<AlertTriangle size={24} />}
                        color="#ef4444"
                    />
                </div>
            </div>

            {/* Filters and Controls */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                    {/* Category Filter */}
                    <div style={{ flex: '1 1 300px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                            <Filter size={16} style={{ display: 'inline', marginLeft: '8px' }} />
                            التصنيف
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as any)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        >
                            <option value="all">جميع المنتجات ({data.summary.totalProducts})</option>
                            <option value="zeroCostAvg">متوسط تكلفة = 0 ({data.summary.zeroCostAvgCount})</option>
                            <option value="retailLoss">خسارة قطاعي ({data.summary.retailLossCount})</option>
                            <option value="wholesaleLoss">خسارة جملة ({data.summary.wholesaleLossCount})</option>
                            <option value="lowMargin">هامش منخفض &lt;10% ({data.summary.lowMarginCount})</option>
                            <option value="highMargin">هامش مرتفع &gt;100% ({data.summary.highMarginCount})</option>
                            <option value="stockedWithoutPrice">مخزون بدون سعر ({data.summary.stockedWithoutPriceCount})</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div style={{ flex: '1 1 300px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>
                            <Search size={16} style={{ display: 'inline', marginLeft: '8px' }} />
                            بحث
                        </label>
                        <input
                            type="text"
                            placeholder="ابحث بالاسم، الكود، أو الباركود..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '15px',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Stock Filter */}
                    <div style={{ flex: '0 1 auto', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                        <input
                            type="checkbox"
                            id="stockFilter"
                            checked={showOnlyWithStock}
                            onChange={(e) => setShowOnlyWithStock(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="stockFilter" style={{ fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                            المنتجات بالمخزون فقط
                        </label>
                    </div>

                    {/* Actions */}
                    <div style={{ flex: '0 1 auto', display: 'flex', gap: '12px', marginTop: '28px' }}>
                        <button
                            onClick={fetchData}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <RefreshCw size={18} />
                            تحديث
                        </button>
                        <button
                            onClick={exportToCSV}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Download size={18} />
                            تصدير CSV
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div style={{ marginTop: '1rem', padding: '12px', background: '#f1f5f9', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#475569' }}>
                        عرض {displayProducts.length} منتج
                    </span>
                </div>
            </div>

            {/* Products Table */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                overflowX: 'auto'
            }}>
                {displayProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <Package size={64} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                            لا توجد منتجات
                        </h3>
                        <p>جرب تغيير الفلاتر أو البحث</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={thStyle}>الكود</th>
                                <th style={thStyle}>الباركود</th>
                                <th style={thStyle}>اسم المنتج</th>
                                <th style={thStyle}>التصنيف</th>
                                <th style={thStyle}>التكلفة الأخيرة</th>
                                <th style={thStyle}>متوسط التكلفة</th>
                                <th style={thStyle}>سعر القطاعي</th>
                                <th style={thStyle}>سعر الجملة</th>
                                <th style={thStyle}>هامش القطاعي</th>
                                <th style={thStyle}>هامش الجملة</th>
                                <th style={thStyle}>المخزون</th>
                                <th style={thStyle}>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayProducts.map((product) => {
                                const retailIssue = product.costAvg > 0 && product.priceRetail < product.costAvg;
                                const wholesaleIssue = product.costAvg > 0 && product.priceWholesale > 0 && product.priceWholesale < product.costAvg;
                                const zeroCost = product.costAvg === 0;
                                
                                return (
                                    <tr
                                        key={product.id}
                                        style={{
                                            background: retailIssue || wholesaleIssue ? '#fef2f2' : zeroCost ? '#fffbeb' : 'white',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f5f3ff';
                                            e.currentTarget.style.transform = 'scale(1.01)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = retailIssue || wholesaleIssue ? '#fef2f2' : zeroCost ? '#fffbeb' : 'white';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <td style={tdStyle}>{product.code}</td>
                                        <td style={tdStyle}>{product.barcode}</td>
                                        <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b' }}>{product.nameAr}</td>
                                        <td style={{ ...tdStyle, fontSize: '13px', color: '#64748b' }}>
                                            {product.itemType?.subcategory?.category?.nameAr || product.category?.nameAr || '-'}
                                        </td>
                                        <td style={tdStyle}>{product.cost.toFixed(2)}</td>
                                        <td style={{ ...tdStyle, fontWeight: '700', color: zeroCost ? '#f59e0b' : '#10b981' }}>
                                            {product.costAvg.toFixed(2)}
                                        </td>
                                        <td style={{ ...tdStyle, color: retailIssue ? '#dc2626' : '#0ea5e9' }}>
                                            {product.priceRetail.toFixed(2)}
                                        </td>
                                        <td style={{ ...tdStyle, color: wholesaleIssue ? '#dc2626' : '#06b6d4' }}>
                                            {product.priceWholesale.toFixed(2)}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                background: getMarginColor(product.retailMargin || 0, true),
                                                color: 'white'
                                            }}>
                                                {product.retailMargin?.toFixed(1) || '0'}%
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                background: getMarginColor(product.wholesaleMargin || 0, true),
                                                color: 'white'
                                            }}>
                                                {product.wholesaleMargin?.toFixed(1) || '0'}%
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                background: product.stock > 10 ? '#dcfce7' : product.stock > 0 ? '#fef3c7' : '#fee2e2',
                                                color: product.stock > 10 ? '#166534' : product.stock > 0 ? '#92400e' : '#991b1b'
                                            }}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {retailIssue && (
                                                <span style={statusStyle('#dc2626')}>
                                                    <AlertTriangle size={14} /> خسارة قطاعي
                                                </span>
                                            )}
                                            {wholesaleIssue && (
                                                <span style={statusStyle('#dc2626')}>
                                                    <AlertTriangle size={14} /> خسارة جملة
                                                </span>
                                            )}
                                            {zeroCost && !retailIssue && !wholesaleIssue && (
                                                <span style={statusStyle('#f59e0b')}>
                                                    <AlertTriangle size={14} /> تكلفة صفر
                                                </span>
                                            )}
                                            {!retailIssue && !wholesaleIssue && !zeroCost && (
                                                <span style={statusStyle('#10b981')}>
                                                    ✓ سليم
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: number; icon: any; color: string }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 16px ${color}40`
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{value}</div>
            </div>
        </div>
    );
}

function getMarginColor(margin: number, forBackground: boolean): string {
    if (margin < 0) return forBackground ? '#dc2626' : '#fee2e2';
    if (margin < 10) return forBackground ? '#f97316' : '#fed7aa';
    if (margin < 30) return forBackground ? '#f59e0b' : '#fef3c7';
    if (margin < 50) return forBackground ? '#10b981' : '#d1fae5';
    if (margin < 100) return forBackground ? '#06b6d4' : '#cffafe';
    return forBackground ? '#8b5cf6' : '#ede9fe';
}

const thStyle: React.CSSProperties = {
    padding: '16px 12px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tdStyle: React.CSSProperties = {
    padding: '16px 12px',
    textAlign: 'right',
    fontSize: '14px',
    color: '#1e293b'
};

const statusStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    background: color,
    color: 'white',
    marginBottom: '4px'
});
