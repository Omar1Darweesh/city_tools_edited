import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Search, Package, TrendingUp, TrendingDown, Filter, X, Layers, Save, AlertCircle, Grid, List as ListIcon } from 'lucide-react';
import apiClient from '../api/client';
import './CommonStyles.css';

interface StockLocation {
    id: number;
    name: string;
    branchId: number;
    branch: { name: string };
}

interface Subcategory {
    id: number;
    name: string;
    nameAr?: string;
    categoryId: number;
    itemTypes: ItemType[];
}

interface ItemType {
    id: number;
    name: string;
    nameAr?: string;
    nameEn?: string;
    subcategoryId: number;
    subcategory?: {
        categoryId: number;
        name?: string;
        nameAr?: string;
    };
}

interface Category {
    id: number;
    name: string;
    nameAr?: string;
    nameEn?: string;
    subcategories: Subcategory[];
}

interface Product {
    id: number;
    nameEn: string;
    nameAr?: string;
    barcode: string;
    code: string;
    stock?: number;
    unit?: string;
    categoryId?: number;
    category?: Category;
    itemType?: ItemType;
}

interface Adjustment {
    productId: number;
    product?: Product;
    systemQty: number;
    actualQty: number;
    variance: number;
}

export default function StockAdjustments() {
    const [locations, setLocations] = useState<StockLocation[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Product browsing
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
    const [selectedItemTypeId, setSelectedItemTypeId] = useState<number | null>(null);
    const [showProductBrowser, setShowProductBrowser] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // UI State
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data } = await apiClient.get('/stock/locations');
            setLocations(data);
            if (data.length > 0) {
                setSelectedLocationId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    };

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const params = new URLSearchParams({ active: 'true', take: '500' });
            const { data } = await apiClient.get(`/products?${params}`);
            const products = Array.isArray(data) ? data : data.data || [];
            setAllProducts(products);

            // ✅ Extract hierarchical categories from products
            const categoryMap = new Map<number, Category>();

            products.forEach((product: Product) => {
                if (product.category) {
                    const catId = product.category.id;

                    if (!categoryMap.has(catId)) {
                        categoryMap.set(catId, {
                            id: catId,
                            name: product.category.name || product.category.nameEn || '',
                            nameAr: product.category.nameAr || product.category.name || '',
                            subcategories: [],
                        });
                    }

                    const category = categoryMap.get(catId)!;

                    // Add subcategories and item types
                    if (product.itemType?.subcategory) {
                        const subcat = product.itemType.subcategory;
                        const subcatId = product.itemType.subcategoryId;

                        let subcategory = category.subcategories.find(s => s.id === subcatId);
                        if (!subcategory) {
                            subcategory = {
                                id: subcatId,
                                name: (subcat as any).name || (subcat as any).nameEn || '',
                                nameAr: (subcat as any).nameAr || (subcat as any).name || '',
                                categoryId: catId,
                                itemTypes: [],
                            };
                            category.subcategories.push(subcategory);
                        }

                        // Add item types
                        if (product.itemType) {
                            const itemTypeExists = subcategory.itemTypes.find(it => it.id === product.itemType!.id);
                            if (!itemTypeExists) {
                                subcategory.itemTypes.push({
                                    id: product.itemType.id,
                                    name: product.itemType.name || product.itemType.nameEn || '',
                                    nameAr: product.itemType.nameAr || product.itemType.name || '',
                                    subcategoryId: subcatId,
                                });
                            }
                        }
                    }
                }
            });

            const categoriesArray = Array.from(categoryMap.values()).sort((a, b) =>
                (a.nameAr || a.name).localeCompare(b.nameAr || b.name, 'ar')
            );
            setCategories(categoriesArray);

            setShowProductBrowser(true);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            alert('فشل تحميل المنتجات');
        } finally {
            setLoadingProducts(false);
        }
    };

    // ✅ Get available subcategories based on selected category
    const availableSubcategories = useMemo(() => {
        if (!selectedCategoryId) return [];
        const category = categories.find(c => c.id === selectedCategoryId);
        return category?.subcategories || [];
    }, [selectedCategoryId, categories]);

    // ✅ Get available item types based on selected subcategory
    const availableItemTypes = useMemo(() => {
        if (!selectedSubcategoryId) return [];
        const subcategory = availableSubcategories.find(s => s.id === selectedSubcategoryId);
        return subcategory?.itemTypes || [];
    }, [selectedSubcategoryId, availableSubcategories]);

    // ✅ Handler for category change (resets child filters)
    const handleCategoryChange = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setSelectedSubcategoryId(null);
        setSelectedItemTypeId(null);
    };

    // ✅ Handler for subcategory change (resets item type)
    const handleSubcategoryChange = (subcategoryId: number | null) => {
        setSelectedSubcategoryId(subcategoryId);
        setSelectedItemTypeId(null);
    };

    // ✅ Clear all filters
    const clearFilters = () => {
        setSelectedCategoryId(null);
        setSelectedSubcategoryId(null);
        setSelectedItemTypeId(null);
    };

    // ✅ Count active filters
    const activeFiltersCount = [selectedCategoryId, selectedSubcategoryId, selectedItemTypeId].filter(Boolean).length;

    const addProduct = async (product: Product) => {
        if (adjustments.find((a) => a.productId === product.id)) {
            return;
        }

        let systemQty = product.stock || 0;
        try {
            const { data } = await apiClient.get(`/products/${product.id}`);
            systemQty = data.stock || 0;
        } catch (error) {
            console.error('Failed to fetch product stock:', error);
        }

        setAdjustments([
            ...adjustments,
            {
                productId: product.id,
                product,
                systemQty,
                actualQty: systemQty,
                variance: 0,
            },
        ]);
    };

    const updateActualQty = (productId: number, actualQty: number) => {
        if (actualQty < 0) actualQty = 0;
        setAdjustments(
            adjustments.map((adj) =>
                adj.productId === productId
                    ? { ...adj, actualQty, variance: actualQty - adj.systemQty }
                    : adj
            )
        );
    };

    const quickAdjust = (productId: number, amount: number) => {
        const adj = adjustments.find(a => a.productId === productId);
        if (adj) {
            const newQty = Math.max(0, adj.actualQty + amount);
            updateActualQty(productId, newQty);
        }
    };

    const removeAdjustment = (productId: number) => {
        setAdjustments(adjustments.filter((a) => a.productId !== productId));
    };

    const submitAdjustment = async () => {
        if (adjustments.length === 0) {
            alert('أضف منتجات للجرد');
            return;
        }

        const changes = adjustments.filter((a) => a.variance !== 0);
        if (changes.length === 0) {
            alert('لا توجد فروقات لحفظها');
            return;
        }

        if (!selectedLocationId) {
            alert('اختر مخزن أولاً');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/stock/adjustments/batch', {
                stockLocationId: selectedLocationId,
                adjustments: changes.map((adj) => ({
                    productId: adj.productId,
                    qtyChange: adj.variance,
                })),
                notes: notes || 'جرد دوري',
            });

            alert(`✅ تم حفظ التسوية بنجاح (${changes.length} منتج)`);
            setAdjustments([]);
            setNotes('');
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'خطأ غير معروف';
            alert('❌ فشل الحفظ: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Enhanced filtered products with multi-level filtering
    const filteredProducts = useMemo(() => {
        let filtered = allProducts;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.nameAr?.includes(searchTerm) ||
                p.nameEn?.toLowerCase().includes(search) ||
                p.barcode?.includes(searchTerm) ||
                p.code?.toLowerCase().includes(search)
            );
        }

        // Category filter
        if (selectedCategoryId) {
            filtered = filtered.filter(p =>
                (p.category && p.category.id === selectedCategoryId) ||
                (p.itemType?.subcategory && p.itemType.subcategory.categoryId === selectedCategoryId)
            );
        }

        // Subcategory filter
        if (selectedSubcategoryId) {
            filtered = filtered.filter(p =>
                p.itemType && p.itemType.subcategoryId === selectedSubcategoryId
            );
        }

        // Item type filter
        if (selectedItemTypeId) {
            filtered = filtered.filter(p =>
                p.itemType && p.itemType.id === selectedItemTypeId
            );
        }

        return filtered;
    }, [allProducts, searchTerm, selectedCategoryId, selectedSubcategoryId, selectedItemTypeId]);

    const summary = {
        totalItems: adjustments.length,
        totalIncrease: adjustments.filter(a => a.variance > 0).reduce((sum, a) => sum + a.variance, 0),
        totalDecrease: Math.abs(adjustments.filter(a => a.variance < 0).reduce((sum, a) => sum + a.variance, 0)),
        itemsWithChanges: adjustments.filter(a => a.variance !== 0).length,
    };

    // ✅ New: Filtered adjustments for the main list
    const filteredAdjustments = useMemo(() => {
        if (!searchTerm) return adjustments;
        const search = searchTerm.toLowerCase();
        return adjustments.filter(adj =>
            adj.product?.nameAr?.includes(searchTerm) ||
            adj.product?.nameEn?.toLowerCase().includes(search) ||
            adj.product?.barcode?.includes(searchTerm) ||
            adj.product?.code?.toLowerCase().includes(search)
        );
    }, [adjustments, searchTerm]);

    // ✅ New: Live Search results (products not yet added)
    const liveSearchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        return allProducts
            .filter(p => !adjustments.find(a => a.productId === p.id))
            .filter(p =>
                p.nameAr?.includes(searchTerm) ||
                p.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.barcode?.includes(searchTerm) ||
                p.code?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 10);
    }, [allProducts, searchTerm, adjustments]);

    // ✅ New: Load products on first search if not loaded
    useEffect(() => {
        if (searchTerm.length >= 2 && allProducts.length === 0 && !loadingProducts) {
            fetchProducts();
        }
    }, [searchTerm, allProducts.length, loadingProducts]);

    return (
        <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', direction: 'rtl' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#111827'
                }}>
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '12px',
                        display: 'flex'
                    }}>
                        <ClipboardList size={28} color="#fff" />
                    </div>
                    جرد المخزون
                </h1>
                <p style={{ color: '#6b7280', fontSize: '15px' }}>
                    اختر المنتجات وسجّل الكميات الفعلية بسهولة وسرعة
                </p>
            </div>

            {/* Top Bar */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>

                    {/* Location Selector */}
                    <div style={{ minWidth: '250px' }}>
                        <select
                            value={selectedLocationId}
                            onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                backgroundColor: selectedLocationId ? '#eff6ff' : '#fff',
                                cursor: 'pointer',
                                outline: 'none',
                            }}
                        >
                            <option value={0}>اختر المخزن</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name} - {loc.branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={20} style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af'
                        }} />
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
                                outline: 'none',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => {
                                const target = e.currentTarget;
                                setTimeout(() => { if (target) target.style.borderColor = '#e5e7eb'; }, 200);
                            }}
                        />

                        {/* ✅ Live Search Dropdown */}
                        {liveSearchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                marginTop: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                                zIndex: 100,
                                border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                                    نتائج البحث ({liveSearchResults.length})
                                </div>
                                {liveSearchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            addProduct(product);
                                            setSearchTerm('');
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f3f4f6',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{product.nameAr || product.nameEn}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{product.code} • {product.barcode}</div>
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6' }}>{product.stock || 0} {product.unit}</div>
                                                <div style={{ fontSize: '11px', color: '#10b981' }}>+ إضافة للجرد</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div
                                    onClick={() => setShowProductBrowser(true)}
                                    style={{
                                        padding: '12px',
                                        textAlign: 'center',
                                        color: '#8b5cf6',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        backgroundColor: '#f5f3ff'
                                    }}
                                >
                                    عرض جميع النتائج في المتصفح
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Browse Products Button */}
                    <button
                        onClick={fetchProducts}
                        disabled={loadingProducts}
                        style={{
                            padding: '14px 20px',
                            backgroundColor: '#8b5cf6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loadingProducts ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: loadingProducts ? 0.7 : 1,
                        }}
                    >
                        <Package size={18} />
                        {loadingProducts ? 'جاري التحميل...' : 'تصفح المنتجات'}
                    </button>

                    {/* Filter Toggle */}
                    {categories.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                padding: '14px 20px',
                                backgroundColor: showFilters ? '#8b5cf6' : '#f3f4f6',
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
                                    backgroundColor: showFilters ? '#fff' : '#8b5cf6',
                                    color: showFilters ? '#8b5cf6' : '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: viewMode === 'grid' ? '#fff' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            <Grid size={18} color={viewMode === 'grid' ? '#8b5cf6' : '#6b7280'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: viewMode === 'list' ? '#fff' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            <ListIcon size={18} color={viewMode === 'list' ? '#8b5cf6' : '#6b7280'} />
                        </button>
                    </div>
                </div>

                {/* ✅ Multi-Level Filters Section */}
                {showFilters && categories.length > 0 && (
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
                            {selectedCategoryId && availableSubcategories.length > 0 && (
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
                            {selectedSubcategoryId && availableItemTypes.length > 0 && (
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

            {/* Summary Cards */}
            {adjustments.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '2px solid #e5e7eb',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Package size={20} color="#6b7280" />
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>إجمالي المنتجات</div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>{summary.totalItems}</div>
                    </div>

                    <div style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '2px solid #10b981',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <TrendingUp size={20} color="#10b981" />
                            <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>زيادة في المخزون</div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>+{summary.totalIncrease}</div>
                    </div>

                    <div style={{
                        backgroundColor: '#fef2f2',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '2px solid #ef4444',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <TrendingDown size={20} color="#ef4444" />
                            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600' }}>نقص في المخزون</div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>-{summary.totalDecrease}</div>
                    </div>

                    <div style={{
                        backgroundColor: '#fffbeb',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '2px solid #f59e0b',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <AlertCircle size={20} color="#f59e0b" />
                            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>منتجات بفروقات</div>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.itemsWithChanges}</div>
                    </div>
                </div>
            )}

            {/* Product Browser Modal */}
            {showProductBrowser && (
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
                    padding: '20px',
                }}
                    onClick={() => setShowProductBrowser(false)}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            maxWidth: '1200px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0, marginBottom: '4px' }}>
                                    اختر المنتجات للجرد
                                </h2>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                    {filteredProducts.length} منتج متاح
                                    {activeFiltersCount > 0 && ` • ${activeFiltersCount} فلتر نشط`}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProductBrowser(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#6b7280',
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Product Grid */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                                gap: '16px',
                            }}>
                                {filteredProducts.map((product) => {
                                    const isAdded = adjustments.find(a => a.productId === product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => !isAdded && addProduct(product)}
                                            style={{
                                                padding: '16px',
                                                border: isAdded ? '2px solid #10b981' : '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                cursor: isAdded ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: isAdded ? '#f0fdf4' : '#fff',
                                                opacity: isAdded ? 0.6 : 1,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isAdded) {
                                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                                    e.currentTarget.style.backgroundColor = '#f5f3ff';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isAdded) {
                                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                                    e.currentTarget.style.backgroundColor = '#fff';
                                                }
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#111827', marginBottom: '4px' }}>
                                                        {product.nameAr || product.nameEn}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                        {product.code} • {product.barcode}
                                                    </div>
                                                </div>
                                                {isAdded && (
                                                    <div style={{
                                                        backgroundColor: '#10b981',
                                                        color: '#fff',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                    }}>
                                                        ✓ مُضاف
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: '#f9fafb',
                                                borderRadius: '8px',
                                            }}>
                                                <Package size={16} color="#6b7280" />
                                                <span style={{ fontSize: '13px', color: '#6b7280' }}>المخزون:</span>
                                                <span style={{
                                                    fontSize: '15px',
                                                    fontWeight: '700',
                                                    color: (product.stock || 0) > 0 ? '#059669' : '#dc2626',
                                                }}>
                                                    {product.stock || 0} {product.unit || 'PCS'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: '#6b7280',
                                }}>
                                    <Package size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>لا توجد منتجات</div>
                                    <div style={{ fontSize: '14px' }}>جرّب تغيير الفلاتر أو البحث</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Adjustments List */}
            {adjustments.length > 0 ? (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
                        المنتجات قيد الجرد ({adjustments.length})
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredAdjustments.map((adj) => (
                            <div
                                key={adj.productId}
                                style={{
                                    border: adj.variance !== 0
                                        ? `2px solid ${adj.variance > 0 ? '#10b981' : '#ef4444'}`
                                        : '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    backgroundColor: adj.variance !== 0
                                        ? (adj.variance > 0 ? '#f0fdf4' : '#fef2f2')
                                        : '#fff',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {/* Product Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                                            {adj.product?.nameAr || adj.product?.nameEn}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            الباركود: {adj.product?.barcode}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeAdjustment(adj.productId)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#fee2e2',
                                            color: '#991b1b',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        حذف
                                    </button>
                                </div>

                                {/* Quantities */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px',
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                                            الكمية بالنظام
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                                            {adj.systemQty} {adj.product?.unit || 'PCS'}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f9fafb',
                                        borderRadius: '8px',
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                                            الكمية الفعلية
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                                            {adj.actualQty} {adj.product?.unit || 'PCS'}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: adj.variance > 0 ? '#dcfce7' : adj.variance < 0 ? '#fee2e2' : '#f3f4f6',
                                        borderRadius: '8px',
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            color: adj.variance > 0 ? '#166534' : adj.variance < 0 ? '#991b1b' : '#6b7280',
                                            marginBottom: '4px',
                                            fontWeight: '600',
                                        }}>
                                            الفرق
                                        </div>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: adj.variance > 0 ? '#16a34a' : adj.variance < 0 ? '#dc2626' : '#374151',
                                        }}>
                                            {adj.variance > 0 && '+'}{adj.variance}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Adjust Buttons */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={() => quickAdjust(adj.productId, -10)} style={{ flex: '1', minWidth: '70px', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>- 10</button>
                                    <button onClick={() => quickAdjust(adj.productId, -5)} style={{ flex: '1', minWidth: '70px', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>- 5</button>
                                    <button onClick={() => quickAdjust(adj.productId, -1)} style={{ flex: '1', minWidth: '70px', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>- 1</button>

                                    <input
                                        type="number"
                                        value={adj.actualQty}
                                        onChange={(e) => updateActualQty(adj.productId, Number(e.target.value))}
                                        style={{
                                            width: '120px',
                                            padding: '10px',
                                            border: '2px solid #8b5cf6',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '18px',
                                            backgroundColor: '#f5f3ff',
                                            outline: 'none',
                                        }}
                                    />

                                    <button onClick={() => quickAdjust(adj.productId, 1)} style={{ flex: '1', minWidth: '70px', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ 1</button>
                                    <button onClick={() => quickAdjust(adj.productId, 5)} style={{ flex: '1', minWidth: '70px', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ 5</button>
                                    <button onClick={() => quickAdjust(adj.productId, 10)} style={{ flex: '1', minWidth: '70px', padding: '10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ 10</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: '24px',
                }}>
                    <ClipboardList size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                        لم يتم إضافة منتجات بعد
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        ابحث عن منتج أو تصفح القائمة لإضافة منتجات للجرد
                    </div>
                </div>
            )}

            {/* Notes */}
            {adjustments.length > 0 && (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                        ملاحظات
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="سبب التسوية (مثال: جرد دوري، تلف، خطأ في الإدخال...)"
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '14px',
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                </div>
            )}

            {/* Submit Button */}
            {adjustments.length > 0 && (
                <button
                    onClick={submitAdjustment}
                    disabled={loading || summary.itemsWithChanges === 0 || selectedLocationId === 0}
                    style={{
                        width: '100%',
                        padding: '18px',
                        backgroundColor: summary.itemsWithChanges > 0 && selectedLocationId > 0 ? '#8b5cf6' : '#d1d5db',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: summary.itemsWithChanges > 0 && selectedLocationId > 0 && !loading ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: summary.itemsWithChanges > 0 && selectedLocationId > 0 ? '0 4px 6px rgba(139, 92, 246, 0.3)' : 'none',
                    }}
                >
                    <Save size={20} />
                    {loading ? '⏳ جاري الحفظ...' : selectedLocationId === 0 ? '⚠️ اختر مخزن أولاً' : `💾 حفظ التسوية (${summary.itemsWithChanges} منتج)`}
                </button>
            )}
        </div>
    );
}
