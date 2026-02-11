import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { Plus, Trash2, Save, Search, X, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface GRNLine {
    productId: number;
    productName: string;
    productCode: string;
    barcode: string;
    currentStock: number;
    qty: number;
    cost: number;
    lineTotal: number;
}

export default function ReceiveGoods() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [lines, setLines] = useState<GRNLine[]>([]);

    // Header Data
    const [supplierId, setSupplierId] = useState('');
    const [paymentTerm, setPaymentTerm] = useState('CASH');
    const [taxRate, setTaxRate] = useState(14);
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Totals
    const subtotal = lines.reduce((sum, line) => sum + (line.qty * line.cost), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Live Search Results with enhanced matching
    const liveSearchResults = products.length > 0 && searchTerm.length >= 1
        ? products
            .filter(p => {
                const term = searchTerm.toLowerCase();
                return (
                    p.nameAr?.includes(searchTerm) ||
                    p.nameEn?.toLowerCase().includes(term) ||
                    p.barcode?.includes(searchTerm) ||
                    p.code?.toLowerCase().includes(term)
                );
            })
            .slice(0, 15)  // Show more results
        : [];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [supRes, prodRes] = await Promise.all([
                apiClient.get('/purchasing/suppliers?active=true'),
                apiClient.get('/products?active=true&take=2000') // Load more products
            ]);
            setSuppliers(supRes.data.data);
            setProducts(prodRes.data.data);
        } catch (e) {
            console.error('Failed to load data', e);
        }
    };

    const addProduct = (product: any) => {
        // Check if product already exists in lines
        const existingIndex = lines.findIndex(l => l.productId === product.id);
        
        if (existingIndex !== -1) {
            // Product exists, increase quantity
            const newLines = [...lines];
            newLines[existingIndex].qty += 1;
            setLines(newLines);
            alert(`تم زيادة كمية ${product.nameAr || product.nameEn} إلى ${newLines[existingIndex].qty}`);
        } else {
            // Add new product
            setLines([...lines, {
                productId: product.id,
                productName: product.nameAr || product.nameEn,
                productCode: product.code || '',
                barcode: product.barcode || '',
                currentStock: product.stock || 0,
                qty: 1,
                cost: Number(product.costAvg || product.cost || 0),
                lineTotal: 0
            }]);
        }
    };


    const updateLine = (index: number, field: keyof GRNLine, value: any) => {
        const newLines = [...lines];
        let sanitizedValue = value;

        if (field === 'qty' || field === 'cost') {
            sanitizedValue = parseFloat(value) || 0;
        }

        const line = { ...newLines[index], [field]: sanitizedValue };

        if (field === 'productId') {
            const prod = products.find(p => p.id === parseInt(value));
            if (prod) {
                line.productName = prod.nameEn;
                line.cost = prod.costAvg || prod.cost || 0;
            }
        }

        // Recalc line total (UI only, backend recalcs)
        // Note: Logic here implies cost is per unit? Yes.

        newLines[index] = line;
        setLines(newLines);
    };

    const removeLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId) return alert('الرجاء اختيار المورد');
        if (lines.length === 0) return alert('الرجاء إضافة منتجات');

        setLoading(true);
        try {
            const payload = {
                branchId: 1, // Hardcoded for now, should be from user context
                supplierId: parseInt(supplierId),
                paymentTerm,
                taxRate: parseFloat(taxRate.toString()),
                lines: lines.map(l => ({
                    productId: parseInt(l.productId.toString()),
                    qty: parseFloat(l.qty.toString()),
                    cost: parseFloat(l.cost.toString())
                })),
                notes
            };

            await apiClient.post('/purchasing/grn', payload);
            alert('تم حفظ إذن الاستلام بنجاح');
            // Reset
            setLines([]);
            setSupplierId('');
            setNotes('');
        } catch (err) {
            console.error(err);
            alert('فشل الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* ✅ Enhanced Header */}
            <div style={{ 
                marginBottom: '32px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px',
                borderRadius: '16px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Package size={36} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>استلام بضاعة (GRN)</h1>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                            إدارة عمليات استلام البضائع من الموردين وتحديث المخزون
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSubmit}>
                    {/* ✅ Improved Header Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                                المورد <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                value={supplierId}
                                onChange={e => setSupplierId(e.target.value)}
                                required
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            >
                                <option value="">اختر المورد...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} {s.phone && `- ${s.phone}`}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                                شروط الدفع
                            </label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                value={paymentTerm}
                                onChange={e => setPaymentTerm(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            >
                                <option value="CASH">نقداً 💵 Cash</option>
                                <option value="DAYS_15">آجل 15 يوم 📅</option>
                                <option value="DAYS_30">آجل 30 يوم 📅</option>
                                <option value="DAYS_60">آجل 60 يوم 📅</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                                نسبة الضريبة (%)
                            </label>
                            <input
                                type="number"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                value={taxRate}
                                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                min="0" 
                                max="100"
                                step="0.1"
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>
                                ملاحظات
                            </label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="أدخل ملاحظات إضافية..."
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    {/* ✅ Enhanced Products Table */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                المنتجات ({lines.length})
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setShowSearchModal(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Plus size={18} /> إضافة منتج
                            </button>
                        </div>

                        {lines.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                border: '2px dashed #cbd5e1'
                            }}>
                                <Package size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                                <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
                                    لم يتم إضافة أي منتجات بعد
                                </p>
                                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
                                    اضغط على "إضافة منتج" للبدء
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '14px', color: '#475569', borderTopLeftRadius: '12px' }}>المنتج</th>
                                            <th style={{ padding: '16px', width: '100px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#475569' }}>المخزون</th>
                                            <th style={{ padding: '16px', width: '120px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#475569' }}>الكمية</th>
                                            <th style={{ padding: '16px', width: '140px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#475569' }}>التكلفة/الوحدة</th>
                                            <th style={{ padding: '16px', width: '140px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#475569' }}>الإجمالي</th>
                                            <th style={{ padding: '16px', width: '60px', textAlign: 'center', borderTopRightRadius: '12px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line, index) => (
                                            <tr key={index} style={{ 
                                                background: index % 2 === 0 ? 'white' : '#fafbfc',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc'}
                                            >
                                                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                                            {line.productName}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                            {line.barcode} {line.productCode && `| ${line.productCode}`}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        background: line.currentStock > 10 ? '#dcfce7' : line.currentStock > 0 ? '#fef3c7' : '#fee2e2',
                                                        color: line.currentStock > 10 ? '#166534' : line.currentStock > 0 ? '#92400e' : '#991b1b',
                                                        fontWeight: '600',
                                                        fontSize: '13px'
                                                    }}>
                                                        {line.currentStock}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                                    <input
                                                        type="number" 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            textAlign: 'center',
                                                            border: '2px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            outline: 'none'
                                                        }}
                                                        value={line.qty}
                                                        min="1"
                                                        onChange={e => updateLine(index, 'qty', e.target.value)}
                                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                    />
                                                </td>
                                                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                                    <input
                                                        type="number" 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            textAlign: 'center',
                                                            border: '2px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            outline: 'none'
                                                        }}
                                                        value={line.cost}
                                                        step="0.01"
                                                        min="0"
                                                        onChange={e => updateLine(index, 'cost', e.target.value)}
                                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                    />
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', fontSize: '16px', color: '#10b981', borderBottom: '1px solid #e2e8f0' }}>
                                                    {(Number(line.qty || 0) * Number(line.cost || 0)).toFixed(2)} ر.س
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeLine(index)} 
                                                        style={{ 
                                                            background: '#fee2e2', 
                                                            border: 'none', 
                                                            cursor: 'pointer', 
                                                            color: '#dc2626',
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ✅ Enhanced Totals Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ 
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                borderRadius: '12px',
                                border: '1px solid #bae6fd'
                            }}>
                                <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '4px', fontWeight: '600' }}>عدد المنتجات</div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>{lines.length}</div>
                            </div>
                            <div style={{ 
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                                borderRadius: '12px',
                                border: '1px solid #ddd6fe'
                            }}>
                                <div style={{ fontSize: '12px', color: '#7c3aed', marginBottom: '4px', fontWeight: '600' }}>إجمالي الكمية</div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#6d28d9' }}>
                                    {lines.reduce((sum, l) => sum + Number(l.qty || 0), 0)}
                                </div>
                            </div>
                        </div>

                        <div style={{ 
                            minWidth: '350px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '2px solid #cbd5e1',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                                <span style={{ color: '#64748b', fontWeight: '500' }}>الإجمالي الفرعي:</span>
                                <span style={{ fontWeight: '700', color: '#334155' }}>{subtotal.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#64748b', fontSize: '14px' }}>
                                <span style={{ fontWeight: '500' }}>الضريبة ({taxRate}%):</span>
                                <span style={{ fontWeight: '600' }}>{taxAmount.toFixed(2)} ر.س</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                fontSize: '20px', 
                                fontWeight: '700', 
                                borderTop: '2px solid #cbd5e1', 
                                paddingTop: '16px', 
                                marginTop: '12px'
                            }}>
                                <span style={{ color: '#1e293b' }}>الإجمالي النهائي:</span>
                                <span style={{ 
                                    color: 'white',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    padding: '8px 20px',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}>
                                    {total.toFixed(2)} ر.س
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Enhanced Submit Button */}
                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <button 
                            type="button"
                            onClick={() => {
                                if (confirm('هل تريد إلغاء العملية وحذف جميع البيانات؟')) {
                                    setLines([]);
                                    setSupplierId('');
                                    setNotes('');
                                }
                            }}
                            style={{
                                padding: '14px 32px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '15px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || lines.length === 0 || !supplierId}
                            style={{
                                padding: '14px 48px',
                                background: (loading || lines.length === 0 || !supplierId) 
                                    ? '#cbd5e1' 
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '700',
                                cursor: (loading || lines.length === 0 || !supplierId) ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: (loading || lines.length === 0 || !supplierId) 
                                    ? 'none' 
                                    : '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && lines.length > 0 && supplierId) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            <Save size={20} />
                            {loading ? 'جاري الحفظ...' : 'حفظ إذن الاستلام'}
                        </button>
                    </div>
                </form>
            </div>
            {/* ✅ Enhanced Product Search Modal */}
            {showSearchModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.2s ease'
                }}
                onClick={() => setShowSearchModal(false)}
                >
                    <div style={{
                        backgroundColor: '#fff',
                        width: '90%',
                        maxWidth: '700px',
                        borderRadius: '20px',
                        padding: '0',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
                        position: 'relative',
                        direction: 'rtl',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ 
                            padding: '24px 32px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, marginBottom: '4px' }}>
                                    إضافة منتج للتوريد
                                </h2>
                                <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
                                    ابحث عن المنتج المطلوب وأضفه إلى قائمة التوريد
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSearchModal(false)}
                                style={{ 
                                    background: 'rgba(255,255,255,0.2)', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    color: 'white',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ 
                                    position: 'absolute', 
                                    right: '20px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    color: '#667eea',
                                    zIndex: 1
                                }} />
                                <input
                                    ref={searchInputRef}
                                    autoFocus
                                    type="text"
                                    placeholder="ابحث باسم المنتج، الباركود، أو الكود..."
                                    style={{ 
                                        width: '100%',
                                        paddingRight: '52px',
                                        paddingLeft: '20px',
                                        height: '56px',
                                        fontSize: '16px',
                                        border: '2px solid #667eea',
                                        borderRadius: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        background: '#f8fafc'
                                    }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#764ba2';
                                        e.target.style.background = 'white';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.background = '#f8fafc';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setShowSearchModal(false);
                                        }
                                    }}
                                />
                            </div>
                            {searchTerm && (
                                <div style={{ 
                                    marginTop: '12px',
                                    fontSize: '13px',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <TrendingUp size={14} />
                                    {liveSearchResults.length} نتيجة
                                </div>
                            )}
                        </div>

                        {/* Results Container */}
                        <div style={{ 
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px 0'
                        }}>
                            {liveSearchResults.length > 0 ? (
                                <div>
                                    {liveSearchResults.map((product, idx) => (
                                        <div
                                            key={product.id}
                                            onClick={() => {
                                                addProduct(product);
                                                setShowSearchModal(false);
                                                setSearchTerm('');
                                            }}
                                            style={{
                                                padding: '20px 32px',
                                                cursor: 'pointer',
                                                borderBottom: idx < liveSearchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f5f3ff';
                                                e.currentTarget.style.paddingRight = '36px';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.paddingRight = '32px';
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontWeight: '700', 
                                                    color: '#1e293b',
                                                    fontSize: '16px',
                                                    marginBottom: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {product.nameAr || product.nameEn}
                                                    {product.stock <= 0 && (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            background: '#fee2e2',
                                                            color: '#991b1b',
                                                            fontWeight: '600'
                                                        }}>
                                                            نفذ
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '13px', 
                                                    color: '#64748b',
                                                    marginBottom: '8px'
                                                }}>
                                                    📦 {product.barcode || 'لا يوجد باركود'} 
                                                    {product.code && <span> | 🏷️ {product.code}</span>}
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                                                    <div style={{
                                                        padding: '4px 10px',
                                                        background: product.stock > 10 ? '#dcfce7' : product.stock > 0 ? '#fef3c7' : '#fee2e2',
                                                        color: product.stock > 10 ? '#166534' : product.stock > 0 ? '#92400e' : '#991b1b',
                                                        borderRadius: '6px',
                                                        fontWeight: '600'
                                                    }}>
                                                        المخزون: {product.stock || 0}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '20px',
                                                marginRight: '24px'
                                            }}>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ 
                                                        fontSize: '11px', 
                                                        color: '#64748b',
                                                        marginBottom: '4px',
                                                        fontWeight: '600'
                                                    }}>
                                                        التكلفة (آخر)
                                                    </div>
                                                    <div style={{ 
                                                        fontWeight: '700', 
                                                        color: '#10b981',
                                                        fontSize: '18px'
                                                    }}>
                                                        {Number(product.costAvg || product.cost || 0).toFixed(2)} ر.س
                                                    </div>
                                                </div>
                                                <div style={{ 
                                                    backgroundColor: '#667eea', 
                                                    color: 'white',
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                }}>
                                                    <Plus size={16} /> إضافة
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchTerm.length >= 1 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '80px 20px',
                                    color: '#64748b'
                                }}>
                                    <AlertCircle size={64} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#334155' }}>
                                        لا توجد نتائج
                                    </h3>
                                    <p style={{ fontSize: '14px', margin: 0 }}>
                                        لم نجد أي منتجات تطابق "{searchTerm}"
                                    </p>
                                </div>
                            ) : (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '80px 20px',
                                    color: '#94a3b8'
                                }}>
                                    <Search size={64} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#64748b' }}>
                                        ابدأ البحث
                                    </h3>
                                    <p style={{ fontSize: '14px', margin: 0 }}>
                                        اكتب اسم المنتج، الباركود، أو الكود للبحث
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Hint */}
                        <div style={{
                            padding: '16px 32px',
                            background: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>💡&#160;&#160;نصيحة: يمكنك البحث بالباركود مباشرة باستخدام ماسح الباركود</span>
                            <span style={{ 
                                background: '#e2e8f0',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                color: '#475569'
                            }}>
                                ESC للإغلاق
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
