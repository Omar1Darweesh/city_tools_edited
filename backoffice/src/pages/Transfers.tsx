import { useState, useEffect } from 'react';
import { ArrowRightLeft, Search, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import './CommonStyles.css';

interface StockLocation {
    id: number;
    name: string;
    branchId: number;
    branch: {
        name: string;
    };
}

interface Product {
    id: number;
    nameEn: string;
    nameAr?: string;
    barcode: string;
}

interface TransferItem {
    productId: number;
    product?: Product;
    qty: number;
}

export default function Transfers() {
    const [locations, setLocations] = useState<StockLocation[]>([]);
    const [fromLocationId, setFromLocationId] = useState<number>(0);
    const [toLocationId, setToLocationId] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [items, setItems] = useState<TransferItem[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data } = await apiClient.get('/stock/locations');
            setLocations(data);
            if (data.length >= 2) {
                setFromLocationId(data[0].id);
                setToLocationId(data[1].id);
            }
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    };

    const searchProducts = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        try {
            const { data } = await apiClient.get(`/products?search=${query}&active=true`);
            setSearchResults(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const addProduct = (product: Product) => {
        if (items.find(i => i.productId === product.id)) {
            alert('المنتج موجود بالفعل');
            return;
        }
        setItems([...items, { productId: product.id, product, qty: 1 }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateQty = (productId: number, qty: number) => {
        setItems(items.map(i => i.productId === productId ? { ...i, qty } : i));
    };

    const removeItem = (productId: number) => {
        setItems(items.filter(i => i.productId !== productId));
    };

    const submitTransfer = async () => {
        if (fromLocationId === toLocationId) {
            alert('المخزن المصدر والوجهة يجب أن يكونا مختلفين');
            return;
        }
        if (items.length === 0) {
            alert('أضف منتجات للنقل');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/stock/transfers', {
                fromStockLocationId: fromLocationId,
                toStockLocationId: toLocationId,
                items: items.map(i => ({ productId: i.productId, qty: i.qty })),
                notes,
            });

            alert('✅ تمت عملية النقل بنجاح');
            setItems([]);
            setNotes('');
        } catch (error: any) {
            alert('❌ فشل النقل: ' + (error.response?.data?.message || 'خطأ'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><ArrowRightLeft size={32} /> نقل المخزون</h1>
                <p>نقل المنتجات بين المخازن والفروع</p>
            </div>

            <div className="card">
                <div className="form-row">
                    <div className="form-group">
                        <label>من مخزن</label>
                        <select
                            value={fromLocationId}
                            onChange={(e) => setFromLocationId(Number(e.target.value))}
                            className="form-input"
                        >
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name} - {loc.branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>إلى مخزن</label>
                        <select
                            value={toLocationId}
                            onChange={(e) => setToLocationId(Number(e.target.value))}
                            className="form-input"
                        >
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name} - {loc.branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>بحث منتج</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    searchProducts(e.target.value);
                                }}
                                placeholder="اسم أو باركود..."
                                className="form-input"
                            />
                            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            {searchResults.length > 0 && (
                                <div className="search-dropdown">
                                    {searchResults.map(p => (
                                        <div key={p.id} onClick={() => addProduct(p)} className="search-dropdown-item">
                                            <strong>{p.nameAr || p.nameEn}</strong>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>{p.barcode}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {items.length > 0 && (
                <div className="card">
                    <h3>المنتجات</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.productId}>
                                    <td>{item.product?.nameAr || item.product?.nameEn}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                                            className="form-input"
                                            style={{ width: '100px' }}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => removeItem(item.productId)} className="btn btn-danger btn-sm">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>ملاحظات</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-input"
                            rows={3}
                        />
                    </div>

                    <button onClick={submitTransfer} disabled={loading} className="btn btn-primary" style={{ marginTop: '10px' }}>
                        {loading ? '⏳ جاري النقل...' : '🚚 تنفيذ النقل'}
                    </button>
                </div>
            )}

            {items.length === 0 && (
                <div className="empty-state">
                    <AlertCircle size={64} color="#94a3b8" />
                    <p>لم يتم إضافة منتجات للنقل بعد</p>
                </div>
            )}
        </div>
    );
}
