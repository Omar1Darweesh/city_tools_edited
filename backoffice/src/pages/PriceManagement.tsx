import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import {
    TrendingUp,
    TrendingDown,
    Search,
    Filter,
    CheckSquare,
    Square,
    DollarSign,
    Tag,
    Layers,
    Package,
    X,
    Percent, // ✅ NEW
} from 'lucide-react';

interface Product {
    id: number;
    code: string;
    barcode: string;
    nameEn: string;
    nameAr: string;
    priceRetail: number;
    priceWholesale: number;
    costAvg?: number; // ✅ NEW
    category?: { id: number; name: string; nameAr: string };
    itemType?: {
        id: number;
        name: string;
        nameAr: string;
        subcategory: {
            id: number;
            name: string;
            nameAr: string;
            categoryId: number;
        };
    };
}

interface Category {
    id: number;
    name: string;
    nameAr: string;
    defaultRetailMargin?: number; // ✅ NEW
    defaultWholesaleMargin?: number; // ✅ NEW
    subcategories: Subcategory[];
}

interface Subcategory {
    id: number;
    name: string;
    nameAr: string;
    categoryId: number;
    defaultRetailMargin?: number; // ✅ NEW
    defaultWholesaleMargin?: number; // ✅ NEW
    itemTypes: ItemType[];
}

interface ItemType {
    id: number;
    name: string;
    nameAr: string;
    subcategoryId: number;
    defaultRetailMargin?: number; // ✅ NEW
    defaultWholesaleMargin?: number; // ✅ NEW
}

type PriceType = 'RETAIL' | 'WHOLESALE' | 'BOTH';
type AdjustmentType = 'PERCENTAGE' | 'FIXED';
type Operation = 'INCREASE' | 'DECREASE';

export default function PriceManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

    // Hierarchy filters - single selection per level
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
    const [selectedItemTypeId, setSelectedItemTypeId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [priceType, setPriceType] = useState<PriceType>('RETAIL');
    const [operation, setOperation] = useState<Operation>('INCREASE');
    const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('PERCENTAGE');
    const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
    const [reason, setReason] = useState('');

    // ============================================
    // ✅ NEW: MARGIN MANAGEMENT STATES
    // ============================================
    const [showMarginPanel, setShowMarginPanel] = useState(false);
    const [selectedHierarchyType, setSelectedHierarchyType] = useState<'category' | 'subcategory' | 'itemtype'>('category');
    const [selectedHierarchyId, setSelectedHierarchyId] = useState<number | null>(null);
    const [marginRetail, setMarginRetail] = useState('40');
    const [marginWholesale, setMarginWholesale] = useState('20');
    const [previewProducts, setPreviewProducts] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [marginSubcategories, setMarginSubcategories] = useState<Subcategory[]>([]);
    const [marginItemTypes, setMarginItemTypes] = useState<ItemType[]>([]);

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    const loadCategories = async () => {
        try {
            const { data } = await apiClient.get('/products/categories');
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/products', { params: { take: 1000 } });
            if (data && Array.isArray(data.data)) {
                setProducts(data.data);
            } else if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Get available subcategories based on selected category
    const availableSubcategories = useMemo(() => {
        if (!selectedCategoryId) return [];
        const category = categories.find(c => c.id === selectedCategoryId);
        return category?.subcategories || [];
    }, [selectedCategoryId, categories]);

    // Get available item types based on selected subcategory
    const availableItemTypes = useMemo(() => {
        if (!selectedSubcategoryId) return [];
        const subcategory = availableSubcategories.find(s => s.id === selectedSubcategoryId);
        return subcategory?.itemTypes || [];
    }, [selectedSubcategoryId, availableSubcategories]);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.nameAr?.includes(searchTerm) ||
                p.nameEn?.toLowerCase().includes(search) ||
                p.code?.toLowerCase().includes(search) ||
                p.barcode?.includes(searchTerm)
            );
        }

        if (selectedCategoryId) {
            filtered = filtered.filter(p =>
                (p.category && p.category.id === selectedCategoryId) ||
                (p.itemType?.subcategory && p.itemType.subcategory.categoryId === selectedCategoryId)
            );
        }

        if (selectedSubcategoryId) {
            filtered = filtered.filter(p =>
                p.itemType?.subcategory && p.itemType.subcategory.id === selectedSubcategoryId
            );
        }

        if (selectedItemTypeId) {
            filtered = filtered.filter(p =>
                p.itemType && p.itemType.id === selectedItemTypeId
            );
        }

        return filtered;
    }, [products, searchTerm, selectedCategoryId, selectedSubcategoryId, selectedItemTypeId]);

    const affectedProducts = useMemo(() => {
        return filteredProducts.filter(p => selectedProducts.has(p.id));
    }, [filteredProducts, selectedProducts]);

    const calculateNewPrice = (currentPrice: number): number => {
        const adjustmentVal = operation === 'DECREASE' ? -Math.abs(adjustmentValue) : Math.abs(adjustmentValue);
        const newPrice = adjustmentType === 'PERCENTAGE'
            ? currentPrice * (1 + adjustmentVal / 100)
            : currentPrice + adjustmentVal;
        return Math.max(0, Math.round(newPrice * 100) / 100);
    };

    const selectAllVisible = () => {
        setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    };

    const deselectAll = () => {
        setSelectedProducts(new Set());
    };

    const clearFilters = () => {
        setSelectedCategoryId(null);
        setSelectedSubcategoryId(null);
        setSelectedItemTypeId(null);
    };

    const handleCategoryChange = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setSelectedSubcategoryId(null);
        setSelectedItemTypeId(null);
    };

    const handleSubcategoryChange = (subcategoryId: number | null) => {
        setSelectedSubcategoryId(subcategoryId);
        setSelectedItemTypeId(null);
    };

    const handleUpdate = async () => {
        if (affectedProducts.length === 0) {
            alert('الرجاء تحديد منتجات للتحديث');
            return;
        }

        if (!window.confirm(`هل أنت متأكد من تحديث أسعار ${affectedProducts.length} منتج؟`)) {
            return;
        }

        setUpdating(true);
        try {
            const updates = affectedProducts.map(product => {
                const update: any = { productId: product.id };

                if (priceType === 'RETAIL' || priceType === 'BOTH') {
                    const currentRetail = Number(product.priceRetail) || 0;
                    update.priceRetail = calculateNewPrice(currentRetail);
                }
                if (priceType === 'WHOLESALE' || priceType === 'BOTH') {
                    const currentWholesale = Number(product.priceWholesale) || 0;
                    update.priceWholesale = calculateNewPrice(currentWholesale);
                }
                return update;
            });

            await apiClient.post('/products/prices/bulk-update', {
                updates,
                reason,
            });

            alert('✅ تم تحديث الأسعار بنجاح');
            loadProducts();
            deselectAll();
            setAdjustmentValue(0);
            setReason('');
        } catch (error: any) {
            console.error('Error updating prices:', error);
            alert(`❌ خطأ: ${error.response?.data?.message || 'فشل تحديث الأسعار'}`);
        } finally {
            setUpdating(false);
        }
    };

    // ============================================
    // ✅ NEW: MARGIN MANAGEMENT FUNCTIONS
    // ============================================
    const handleHierarchyTypeChange = (type: 'category' | 'subcategory' | 'itemtype') => {
        setSelectedHierarchyType(type);
        setSelectedHierarchyId(null);
        setShowPreview(false);
        setMarginSubcategories([]);
        setMarginItemTypes([]);
    };

    const handleMarginCategoryChange = (categoryId: number) => {
        setSelectedHierarchyId(categoryId);
        setShowPreview(false);

        const category = categories.find(c => c.id === categoryId);
        setMarginSubcategories(category?.subcategories || []);

        // ✅ FIX: Always set margins, defaulting to 0 if not present
        const retailMargin = category?.defaultRetailMargin ?? 0;
        const wholesaleMargin = category?.defaultWholesaleMargin ?? 0;
        setMarginRetail((retailMargin * 100).toFixed(1));
        setMarginWholesale((wholesaleMargin * 100).toFixed(1));
    };

    const handleMarginSubcategoryChange = (subcategoryId: number) => {
        setSelectedHierarchyId(subcategoryId);
        setShowPreview(false);

        const subcategory = marginSubcategories.find(s => s.id === subcategoryId);
        setMarginItemTypes(subcategory?.itemTypes || []);

        // ✅ FIX: Always set margins, defaulting to 0 if not present
        const retailMargin = subcategory?.defaultRetailMargin ?? 0;
        const wholesaleMargin = subcategory?.defaultWholesaleMargin ?? 0;
        setMarginRetail((retailMargin * 100).toFixed(1));
        setMarginWholesale((wholesaleMargin * 100).toFixed(1));
    };

    const handleMarginItemTypeChange = (itemTypeId: number) => {
        setSelectedHierarchyId(itemTypeId);
        setShowPreview(false);

        const itemType = marginItemTypes.find(it => it.id === itemTypeId);
        
        // ✅ FIX: Always set margins, defaulting to 0 if not present
        const retailMargin = itemType?.defaultRetailMargin ?? 0;
        const wholesaleMargin = itemType?.defaultWholesaleMargin ?? 0;
        setMarginRetail((retailMargin * 100).toFixed(1));
        setMarginWholesale((wholesaleMargin * 100).toFixed(1));
    };

    const handlePreviewMargins = async () => {
        if (!selectedHierarchyId) {
            alert('الرجاء اختيار التصنيف أولاً');
            return;
        }

        // ✅ FIX: Proper validation and conversion
        const retailValue = marginRetail.trim() === '' ? 0 : parseFloat(marginRetail);
        const wholesaleValue = marginWholesale.trim() === '' ? 0 : parseFloat(marginWholesale);
        
        if (isNaN(retailValue) || isNaN(wholesaleValue)) {
            alert('الرجاء إدخال أرقام صحيحة فقط');
            return;
        }
        
        if (retailValue < 0 || wholesaleValue < 0) {
            alert('نسب الربح لا يمكن أن تكون سالبة');
            return;
        }

        const retail = retailValue / 100;
        const wholesale = wholesaleValue / 100;

        try {
            let endpoint = '';
            if (selectedHierarchyType === 'category') {
                endpoint = `/products?categoryId=${selectedHierarchyId}&active=true`;
            } else if (selectedHierarchyType === 'subcategory') {
                const subcategory = marginSubcategories.find(s => s.id === selectedHierarchyId);
                endpoint = `/products?categoryId=${subcategory?.categoryId}&active=true`;
            } else {
                endpoint = `/products?itemTypeId=${selectedHierarchyId}&active=true`;
            }

            const { data } = await apiClient.get(endpoint);
            let productsData = data.data || data || [];

            // Filter by subcategory if needed
            if (selectedHierarchyType === 'subcategory') {
                productsData = productsData.filter((p: any) =>
                    p.itemType?.subcategory?.id === selectedHierarchyId
                );
            }

            const preview = productsData.map((p: any) => ({
                id: p.id,
                nameAr: p.nameAr || p.nameEn,
                nameEn: p.nameEn,
                costAvg: Number(p.costAvg || 0),
                oldRetail: Number(p.priceRetail || 0),
                oldWholesale: Number(p.priceWholesale || 0),
                newRetail: Number(p.costAvg || 0) * (1 + retail),
                newWholesale: Number(p.costAvg || 0) * (1 + wholesale),
            }));

            setPreviewProducts(preview);
            setShowPreview(true);
        } catch (error) {
            console.error('Preview failed:', error);
            alert('فشل تحميل المعاينة');
        }
    };

    const handleApplyMargins = async () => {
        if (!selectedHierarchyId) {
            alert('الرجاء اختيار التصنيف أولاً');
            return;
        }

        // ✅ FIX: Proper validation and conversion
        const retailValue = marginRetail.trim() === '' ? 0 : parseFloat(marginRetail);
        const wholesaleValue = marginWholesale.trim() === '' ? 0 : parseFloat(marginWholesale);
        
        if (isNaN(retailValue) || isNaN(wholesaleValue)) {
            alert('الرجاء إدخال أرقام صحيحة فقط');
            return;
        }
        
        if (retailValue < 0 || wholesaleValue < 0) {
            alert('نسب الربح لا يمكن أن تكون سالبة');
            return;
        }

        const retail = retailValue / 100;
        const wholesale = wholesaleValue / 100;

        if (!confirm(`هل أنت متأكد من تطبيق الهوامش على ${previewProducts.length} منتج؟`)) {
            return;
        }

        try {
            let endpoint = '';
            if (selectedHierarchyType === 'category') {
                endpoint = `/products/margins/category/${selectedHierarchyId}`;
            } else if (selectedHierarchyType === 'subcategory') {
                endpoint = `/products/margins/subcategory/${selectedHierarchyId}`;
            } else {
                endpoint = `/products/margins/item-type/${selectedHierarchyId}`;
            }

            const { data } = await apiClient.post(endpoint, {
                retailMargin: retail,
                wholesaleMargin: wholesale,
            });

            alert(`✅ ${data.message || 'تم تطبيق الهوامش بنجاح'}`);
            setShowPreview(false);
            loadProducts();
            loadCategories();
        } catch (error: any) {
            console.error('Apply failed:', error);
            alert('❌ فشل التطبيق: ' + (error.response?.data?.message || error.message));
        }
    };

    const activeFiltersCount = (selectedCategoryId ? 1 : 0) + (selectedSubcategoryId ? 1 : 0) + (selectedItemTypeId ? 1 : 0);

    return (
        <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', direction: 'rtl' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#111827' }}>
                    <div style={{ padding: '10px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex' }}>
                        <DollarSign size={28} color="#fff" />
                    </div>
                    إدارة الأسعار
                </h1>
                <p style={{ color: '#6b7280', fontSize: '15px' }}>
                    ابحث، اختر، وعدّل أسعار المنتجات بسهولة وسرعة
                </p>
            </div>

            {/* ============================================ */}
            {/* ✅ NEW: MARGIN MANAGEMENT PANEL */}
            {/* ============================================ */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                color: 'white',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Percent size={24} />
                        إدارة هوامش الربح حسب التصنيف
                    </h3>
                    <button
                        onClick={() => setShowMarginPanel(!showMarginPanel)}
                        style={{
                            background: 'rgba(255,255,255,0.25)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    >
                        {showMarginPanel ? '▲ إخفاء' : '▼ عرض'}
                    </button>
                </div>

                {showMarginPanel && (
                    <>
                        {/* Hierarchy Type Selector */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { value: 'category', label: '📊 تصنيف رئيسي' },
                                { value: 'subcategory', label: '📂 تصنيف فرعي' },
                                { value: 'itemtype', label: '🏷️ نوع الصنف' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleHierarchyTypeChange(value as any)}
                                    style={{
                                        padding: '12px 24px',
                                        background: selectedHierarchyType === value ? 'white' : 'rgba(255,255,255,0.2)',
                                        color: selectedHierarchyType === value ? '#764ba2' : 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        flex: 1,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Category/Subcategory/ItemType Selectors */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                            {selectedHierarchyType === 'category' && (
                                <select
                                    value={selectedHierarchyId || ''}
                                    onChange={(e) => handleMarginCategoryChange(Number(e.target.value))}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="">اختر التصنيف الرئيسي...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nameAr || cat.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {selectedHierarchyType === 'subcategory' && (
                                <>
                                    <select
                                        onChange={(e) => handleMarginCategoryChange(Number(e.target.value))}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                                    >
                                        <option value="">اختر التصنيف الرئيسي...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nameAr || cat.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedHierarchyId || ''}
                                        onChange={(e) => handleMarginSubcategoryChange(Number(e.target.value))}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                                        disabled={marginSubcategories.length === 0}
                                    >
                                        <option value="">اختر التصنيف الفرعي...</option>
                                        {marginSubcategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.nameAr || sub.name}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {selectedHierarchyType === 'itemtype' && (
                                <>
                                    <select
                                        onChange={(e) => handleMarginCategoryChange(Number(e.target.value))}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                                    >
                                        <option value="">اختر التصنيف الرئيسي...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nameAr || cat.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        onChange={(e) => handleMarginSubcategoryChange(Number(e.target.value))}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                                        disabled={marginSubcategories.length === 0}
                                    >
                                        <option value="">اختر التصنيف الفرعي...</option>
                                        {marginSubcategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.nameAr || sub.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedHierarchyId || ''}
                                        onChange={(e) => handleMarginItemTypeChange(Number(e.target.value))}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '600', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                                        disabled={marginItemTypes.length === 0}
                                    >
                                        <option value="">اختر نوع الصنف...</option>
                                        {marginItemTypes.map(it => (
                                            <option key={it.id} value={it.id}>{it.nameAr || it.name}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>

                        {/* Margin Inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                    نسبة ربح التجزئة (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={marginRetail}
                                    onChange={(e) => setMarginRetail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                    }}
                                    placeholder="40"
                                />
                                <small style={{ display: 'block', marginTop: '6px', opacity: 0.9, fontSize: '12px' }}>
                                    {marginRetail && !isNaN(parseFloat(marginRetail))
                                        ? `مثال: تكلفة 100 ← سعر ${(100 * (1 + parseFloat(marginRetail) / 100)).toFixed(2)}`
                                        : 'أدخل نسبة الربح'}
                                </small>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                                    نسبة ربح الجملة (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={marginWholesale}
                                    onChange={(e) => setMarginWholesale(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                    }}
                                    placeholder="20"
                                />
                                <small style={{ display: 'block', marginTop: '6px', opacity: 0.9, fontSize: '12px' }}>
                                    {marginWholesale && !isNaN(parseFloat(marginWholesale))
                                        ? `مثال: تكلفة 100 ← سعر ${(100 * (1 + parseFloat(marginWholesale) / 100)).toFixed(2)}`
                                        : 'أدخل نسبة الربح'}
                                </small>
                            </div>

                            <button
                                onClick={handlePreviewMargins}
                                disabled={!selectedHierarchyId}
                                style={{
                                    padding: '12px 28px',
                                    background: selectedHierarchyId ? '#10b981' : 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: selectedHierarchyId ? 'pointer' : 'not-allowed',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                👁️ معاينة
                            </button>

                            <button
                                onClick={handleApplyMargins}
                                disabled={!showPreview || previewProducts.length === 0}
                                style={{
                                    padding: '12px 28px',
                                    background: showPreview && previewProducts.length > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: showPreview && previewProducts.length > 0 ? 'pointer' : 'not-allowed',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                ✅ تطبيق
                            </button>
                        </div>

                        {/* Preview Table */}
                        {showPreview && previewProducts.length > 0 && (
                            <div style={{
                                marginTop: '24px',
                                background: 'white',
                                borderRadius: '16px',
                                padding: '20px',
                                color: '#1e293b',
                                maxHeight: '450px',
                                overflowY: 'auto',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                                    📋 معاينة التغييرات ({previewProducts.length} منتج)
                                </h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>المنتج</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>التكلفة</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>تجزئة قديم</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#10b981' }}>تجزئة جديد</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>فرق</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>جملة قديم</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#10b981' }}>جملة جديد</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>فرق</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewProducts.slice(0, 20).map(p => {
                                                const retailDiff = p.newRetail - p.oldRetail;
                                                const wholesaleDiff = p.newWholesale - p.oldWholesale;
                                                return (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '12px', fontWeight: '600' }}>{p.nameAr}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{p.costAvg.toFixed(2)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>{p.oldRetail.toFixed(2)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#10b981' }}>
                                                            {p.newRetail.toFixed(2)}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            color: retailDiff > 0 ? '#10b981' : retailDiff < 0 ? '#ef4444' : '#64748b',
                                                            fontWeight: '700',
                                                        }}>
                                                            {retailDiff > 0 ? '+' : ''}{retailDiff.toFixed(2)}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>{p.oldWholesale.toFixed(2)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#10b981' }}>
                                                            {p.newWholesale.toFixed(2)}
                                                        </td>
                                                        <td style={{
                                                            padding: '12px',
                                                            textAlign: 'center',
                                                            color: wholesaleDiff > 0 ? '#10b981' : wholesaleDiff < 0 ? '#ef4444' : '#64748b',
                                                            fontWeight: '700',
                                                        }}>
                                                            {wholesaleDiff > 0 ? '+' : ''}{wholesaleDiff.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {previewProducts.length > 20 && (
                                    <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
                                        عرض 20 من {previewProducts.length} منتج
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* ============================================ */}
            {/* END: MARGIN MANAGEMENT PANEL */}
            {/* ============================================ */}

            {/* Top Bar */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>

                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث بالاسم، الكود، أو الباركود..."
                            style={{
                                width: '100%',
                                padding: '14px 48px 14px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <button
                        onClick={selectAllVisible}
                        style={{
                            padding: '14px 20px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <CheckSquare size={18} />
                        تحديد الكل ({filteredProducts.length})
                    </button>

                    <button
                        onClick={deselectAll}
                        style={{
                            padding: '14px 20px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <Square size={18} />
                        إلغاء التحديد
                    </button>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            padding: '14px 20px',
                            backgroundColor: showFilters ? '#3b82f6' : '#f3f4f6',
                            color: showFilters ? '#fff' : '#374151',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <Filter size={18} />
                        تصفية
                        {activeFiltersCount > 0 && (
                            <span style={{
                                backgroundColor: showFilters ? '#fff' : '#3b82f6',
                                color: showFilters ? '#3b82f6' : '#fff',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                            }}>
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Compact Multi-Level Filters */}
                {showFilters && (
                    <div style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={16} />
                                التصفية حسب التصنيف
                            </div>
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#fee2e2',
                                        color: '#991b1b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    <X size={14} />
                                    إزالة الفلاتر
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>

                            {/* Level 1: Category */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                    التصنيف الرئيسي
                                </label>
                                <select
                                    value={selectedCategoryId || ''}
                                    onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: selectedCategoryId ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: selectedCategoryId ? '600' : '400',
                                        backgroundColor: selectedCategoryId ? '#eff6ff' : '#fff',
                                        cursor: 'pointer',
                                        outline: 'none',
                                    }}
                                >
                                    <option value="">الكل</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nameAr || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Level 2: Subcategory (only show if category selected) */}
                            {selectedCategoryId && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                        التصنيف الفرعي
                                    </label>
                                    <select
                                        value={selectedSubcategoryId || ''}
                                        onChange={(e) => handleSubcategoryChange(e.target.value ? Number(e.target.value) : null)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: selectedSubcategoryId ? '2px solid #10b981' : '2px solid #e5e7eb',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            fontWeight: selectedSubcategoryId ? '600' : '400',
                                            backgroundColor: selectedSubcategoryId ? '#d1fae5' : '#fff',
                                            cursor: 'pointer',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="">الكل</option>
                                        {availableSubcategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.nameAr || sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Level 3: Item Type (only show if subcategory selected) */}
                            {selectedSubcategoryId && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>
                                        نوع الصنف
                                    </label>
                                    <select
                                        value={selectedItemTypeId || ''}
                                        onChange={(e) => setSelectedItemTypeId(e.target.value ? Number(e.target.value) : null)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: selectedItemTypeId ? '2px solid #f59e0b' : '2px solid #e5e7eb',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            fontWeight: selectedItemTypeId ? '600' : '400',
                                            backgroundColor: selectedItemTypeId ? '#fef3c7' : '#fff',
                                            cursor: 'pointer',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="">الكل</option>
                                        {availableItemTypes.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.nameAr || item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>

                {/* Products Table */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Package size={20} color="#3b82f6" />
                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                                المنتجات ({filteredProducts.length})
                            </span>
                            {selectedProducts.size > 0 && (
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: '#3b82f6',
                                    color: '#fff',
                                    borderRadius: '999px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                }}>
                                    {selectedProducts.size} محدد
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>
                                <div style={{ fontSize: '16px', fontWeight: '600' }}>جاري التحميل...</div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div style={{ padding: '80px', textAlign: 'center', color: '#9ca3af' }}>
                                <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>لا توجد منتجات</div>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb', zIndex: 5 }}>
                                    <tr>
                                        <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '50px' }}></th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb' }}>المنتج</th>

                                        {priceType === 'BOTH' ? (
                                            <>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '110px' }}>
                                                    تجزئة حالي
                                                </th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '110px' }}>
                                                    تجزئة جديد
                                                </th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '110px' }}>
                                                    جملة حالي
                                                </th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '110px' }}>
                                                    جملة جديد
                                                </th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '120px' }}>السعر الحالي</th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '120px' }}>السعر الجديد</th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', borderBottom: '2px solid #e5e7eb', width: '120px' }}>التغيير</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => {
                                        const isSelected = selectedProducts.has(product.id);
                                        const retailPrice = Number(product.priceRetail) || 0;
                                        const wholesalePrice = Number(product.priceWholesale) || 0;

                                        const newRetailPrice = isSelected ? calculateNewPrice(retailPrice) : retailPrice;
                                        const newWholesalePrice = isSelected ? calculateNewPrice(wholesalePrice) : wholesalePrice;
                                        const retailChange = newRetailPrice - retailPrice;
                                        const wholesaleChange = newWholesalePrice - wholesalePrice;

                                        const currentPrice = priceType === 'RETAIL' ? retailPrice : wholesalePrice;
                                        const newPrice = priceType === 'RETAIL' ? newRetailPrice : newWholesalePrice;
                                        const change = newPrice - currentPrice;

                                        return (
                                            <tr
                                                key={product.id}
                                                onClick={() => {
                                                    const newSet = new Set(selectedProducts);
                                                    if (newSet.has(product.id)) {
                                                        newSet.delete(product.id);
                                                    } else {
                                                        newSet.add(product.id);
                                                    }
                                                    setSelectedProducts(newSet);
                                                }}
                                                style={{
                                                    backgroundColor: isSelected ? '#eff6ff' : '#fff',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '6px',
                                                        border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                                                        backgroundColor: isSelected ? '#3b82f6' : '#fff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto',
                                                    }}>
                                                        {isSelected && (
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                                                        {product.nameAr || product.nameEn}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                        {product.code}
                                                    </div>
                                                </td>

                                                {priceType === 'BOTH' ? (
                                                    <>
                                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                                            {retailPrice.toFixed(2)} ر.س
                                                        </td>
                                                        <td style={{
                                                            padding: '16px',
                                                            textAlign: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                            color: isSelected ? (retailChange > 0 ? '#10b981' : retailChange < 0 ? '#ef4444' : '#374151') : '#374151'
                                                        }}>
                                                            <div>{newRetailPrice.toFixed(2)} ر.س</div>
                                                            {isSelected && Math.abs(retailChange) > 0.01 && (
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    marginTop: '4px',
                                                                    color: retailChange > 0 ? '#065f46' : '#991b1b',
                                                                    fontWeight: '600',
                                                                }}>
                                                                    {retailChange > 0 ? '+' : ''}{retailChange.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                                            {wholesalePrice.toFixed(2)} ر.س
                                                        </td>
                                                        <td style={{
                                                            padding: '16px',
                                                            textAlign: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                            color: isSelected ? (wholesaleChange > 0 ? '#10b981' : wholesaleChange < 0 ? '#ef4444' : '#374151') : '#374151'
                                                        }}>
                                                            <div>{newWholesalePrice.toFixed(2)} ر.س</div>
                                                            {isSelected && Math.abs(wholesaleChange) > 0.01 && (
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    marginTop: '4px',
                                                                    color: wholesaleChange > 0 ? '#065f46' : '#991b1b',
                                                                    fontWeight: '600',
                                                                }}>
                                                                    {wholesaleChange > 0 ? '+' : ''}{wholesaleChange.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                                            {currentPrice.toFixed(2)} ر.س
                                                        </td>
                                                        <td style={{
                                                            padding: '16px',
                                                            textAlign: 'center',
                                                            fontSize: '15px',
                                                            fontWeight: '700',
                                                            color: isSelected ? (change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#374151') : '#374151'
                                                        }}>
                                                            {newPrice.toFixed(2)} ر.س
                                                        </td>
                                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                                            {isSelected && Math.abs(change) > 0.01 && (
                                                                <div style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    padding: '6px 12px',
                                                                    backgroundColor: change > 0 ? '#d1fae5' : '#fee2e2',
                                                                    color: change > 0 ? '#065f46' : '#991b1b',
                                                                    borderRadius: '8px',
                                                                    fontSize: '13px',
                                                                    fontWeight: '700',
                                                                }}>
                                                                    {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                                    {change > 0 ? '+' : ''}{change.toFixed(2)}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Price Adjustment Panel */}
                <div>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'sticky',
                        top: '24px',
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>
                            إعدادات التعديل
                        </h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                نوع السعر
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                {[
                                    { value: 'RETAIL', label: 'تجزئة' },
                                    { value: 'WHOLESALE', label: 'جملة' },
                                    { value: 'BOTH', label: 'كلاهما' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setPriceType(value as PriceType)}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: priceType === value ? '#3b82f6' : '#fff',
                                            color: priceType === value ? '#fff' : '#374151',
                                            border: `2px solid ${priceType === value ? '#3b82f6' : '#e5e7eb'}`,
                                            borderRadius: '10px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                العملية
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button
                                    onClick={() => setOperation('INCREASE')}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: operation === 'INCREASE' ? '#d1fae5' : '#fff',
                                        color: operation === 'INCREASE' ? '#065f46' : '#374151',
                                        border: `2px solid ${operation === 'INCREASE' ? '#10b981' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <TrendingUp size={20} />
                                    زيادة
                                </button>
                                <button
                                    onClick={() => setOperation('DECREASE')}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: operation === 'DECREASE' ? '#fee2e2' : '#fff',
                                        color: operation === 'DECREASE' ? '#991b1b' : '#374151',
                                        border: `2px solid ${operation === 'DECREASE' ? '#ef4444' : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <TrendingDown size={20} />
                                    تخفيض
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                قيمة التعديل
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    value={adjustmentValue}
                                    onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        textAlign: 'center',
                                        outline: 'none',
                                    }}
                                    placeholder="0"
                                    min="0"
                                />
                                <select
                                    value={adjustmentType}
                                    onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                                    style={{
                                        padding: '14px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="PERCENTAGE">%</option>
                                    <option value="FIXED">ر.س</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                سبب التعديل (اختياري)
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="مثال: تخفيضات موسمية"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {affectedProducts.length > 0 && adjustmentValue > 0 && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: operation === 'INCREASE' ? '#d1fae5' : '#fee2e2',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: `2px solid ${operation === 'INCREASE' ? '#10b981' : '#ef4444'}`,
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                                    سيتم تحديث {affectedProducts.length} منتج
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                    {operation === 'INCREASE' ? 'زيادة' : 'تخفيض'} بقيمة {adjustmentValue}
                                    {adjustmentType === 'PERCENTAGE' ? '%' : ' ر.س'}
                                    {' '}على {priceType === 'RETAIL' ? 'سعر التجزئة' : priceType === 'WHOLESALE' ? 'سعر الجملة' : 'كلا السعرين'}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleUpdate}
                            disabled={updating || affectedProducts.length === 0 || adjustmentValue === 0}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: updating || affectedProducts.length === 0 || adjustmentValue === 0 ? '#9ca3af' : '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: updating || affectedProducts.length === 0 || adjustmentValue === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                            }}
                        >
                            <DollarSign size={20} />
                            {updating ? 'جاري التحديث...' : `تطبيق على ${affectedProducts.length} منتج`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
