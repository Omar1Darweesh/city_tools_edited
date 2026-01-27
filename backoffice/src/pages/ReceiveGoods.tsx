import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Trash2, Save, Search, X } from 'lucide-react';

interface GRNLine {
    productId: number;
    productName: string;
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

    // Totals
    const subtotal = lines.reduce((sum, line) => sum + (line.qty * line.cost), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Live Search Results
    const liveSearchResults = products.length > 0 && searchTerm.length >= 2
        ? products
            .filter(p =>
                p.nameAr?.includes(searchTerm) ||
                p.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.barcode?.includes(searchTerm) ||
                p.code?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 10)
        : [];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [supRes, prodRes] = await Promise.all([
                apiClient.get('/purchasing/suppliers?active=true'),
                apiClient.get('/products?active=true&take=1000') // Simplification: load all for dropdown
            ]);
            setSuppliers(supRes.data.data);
            setProducts(prodRes.data.data);
        } catch (e) {
            console.error('Failed to load data', e);
        }
    };

    const addProduct = (product: any) => {
        setLines([...lines, {
            productId: product.id,
            productName: product.nameEn || product.nameAr,
            qty: 1,
            cost: product.costAvg || product.cost || 0,
            lineTotal: 0
        }]);
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
        <div>
            <h1 style={{ marginBottom: '20px' }}>استلام بضاعة (GRN)</h1>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>المورد</label>
                            <select
                                className="input-field"
                                value={supplierId}
                                onChange={e => setSupplierId(e.target.value)}
                                required
                            >
                                <option value="">اختر المورد...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>شروط الدفع</label>
                            <select
                                className="input-field"
                                value={paymentTerm}
                                onChange={e => setPaymentTerm(e.target.value)}
                            >
                                <option value="CASH">نقدًا (Cash)</option>
                                <option value="DAYS_15">آجل 15 يوم</option>
                                <option value="DAYS_30">آجل 30 يوم</option>
                                <option value="DAYS_60">آجل 60 يوم</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>الضريبة %</label>
                            <input
                                type="number"
                                className="input-field"
                                value={taxRate}
                                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                min="0" step="0.1"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ملاحظات</label>
                            <input
                                className="input-field"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>


                    <div style={{ marginBottom: '20px' }}>
                        <div className="table-container">
                            <table>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ textAlign: 'right' }}>المنتج</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>الكمية</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>التكلفة</th>
                                        <th style={{ width: '120px', textAlign: 'center' }}>الإجمالي</th>
                                        <th style={{ width: '60px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    className="input-field"
                                                    value={line.productId}
                                                    onChange={e => updateLine(index, 'productId', e.target.value)}
                                                >
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nameAr || p.nameEn} ({p.barcode})</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number" className="input-field"
                                                    style={{ textAlign: 'center' }}
                                                    value={line.qty}
                                                    min="1"
                                                    onChange={e => updateLine(index, 'qty', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number" className="input-field"
                                                    style={{ textAlign: 'center' }}
                                                    value={line.cost}
                                                    step="0.01"
                                                    onChange={e => updateLine(index, 'cost', e.target.value)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                {(Number(line.qty || 0) * Number(line.cost || 0)).toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button type="button" onClick={() => removeLine(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setShowSearchModal(true);
                            }}
                            style={{
                                marginTop: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                color: '#4f46e5',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                padding: '10px'
                            }}
                        >
                            <Plus size={18} /> إضافة منتج
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                        <div style={{ width: '300px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>الإجمالي قبل الضريبة:</span>
                                <span style={{ fontWeight: 'bold' }}>{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                                <span>قيمة الضريبة ({taxRate}%):</span>
                                <span>{taxAmount.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '10px', color: '#166534' }}>
                                <span>الإجمالي النهائي:</span>
                                <span>{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 30px' }}>
                            <Save size={18} style={{ marginLeft: '10px' }} />
                            {loading ? 'جاري الحفظ...' : 'حفظ التوريد'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ✅ Product Search Modal */}
            {showSearchModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        width: '90%',
                        maxWidth: '600px',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        position: 'relative',
                        direction: 'rtl'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>إضافة منتج للتوريد</h2>
                            <button
                                onClick={() => setShowSearchModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <Search size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                autoFocus
                                type="text"
                                className="input-field"
                                placeholder="ابحث باسم المنتج، الباركود، أو الكود..."
                                style={{ paddingRight: '48px', height: '50px', fontSize: '16px', border: '2px solid #4f46e5' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                            {liveSearchResults.length > 0 ? (
                                liveSearchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            addProduct(product);
                                            setShowSearchModal(false);
                                            setSearchTerm('');
                                        }}
                                        style={{
                                            padding: '16px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f1f5f9',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'background 0.2s',
                                            borderRadius: '8px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{product.nameAr || product.nameEn}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                {product.barcode} {product.code && `| ${product.code}`}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>التكلفة</div>
                                                <div style={{ fontWeight: 'bold', color: '#16a34a' }}>
                                                    {product.costAvg || product.cost || 0} <span style={{ fontSize: '10px', color: '#64748b' }}>(Last: {product.cost})</span>
                                                </div>
                                            </div>
                                            <div style={{ backgroundColor: '#f5f3ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                                                + إضافة
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : searchTerm.length >= 2 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    لا توجد منتجات تطابق بحثك
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
                                    اكتب حرفين على الأقل للبحث...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
