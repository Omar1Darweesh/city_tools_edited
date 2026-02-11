import { useState, useEffect } from 'react';
import { Clock, Edit, Trash, Plus, Search, Filter, TrendingUp } from 'lucide-react';
import ProductForm from './ProductForm';
import ProductAuditHistory from './ProductAuditHistory';
import ProductTransactions from './ProductTransactions';
import apiClient from '../api/client';

interface Product {
    id: number;
    code: string;
    barcode: string;
    nameEn: string;
    nameAr: string;
    brand: string;
    unit: string;
    costAvg?: number;
    cost: number;
    priceRetail: number;
    priceWholesale: number;
    minQty: number;
    maxQty: number;
    active: boolean;
    categoryId: number | null;
    itemTypeId: number | null;
    category: any;
    itemType: any;
    stock: number;
}

interface Category {
    id: number;
    name: string;
    nameAr: string;
    subcategories: Subcategory[];
}

interface Subcategory {
    id: number;
    name: string;
    nameAr: string;
    itemTypes: ItemType[];
}

interface ItemType {
    id: number;
    name: string;
    nameAr: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
    const [selectedItemType, setSelectedItemType] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showAuditHistory, setShowAuditHistory] = useState(false);
    const [selectedProductForAudit, setSelectedProductForAudit] = useState<any>(null);
    const [showTransactions, setShowTransactions] = useState(false);
    const [selectedProductForTransactions, setSelectedProductForTransactions] = useState<any>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [stockFilter, setStockFilter] = useState<string>(''); // Add this line

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchTerm, selectedCategory, selectedSubcategory, selectedItemType, page, showInactive, stockFilter]); // Add stockFilter here

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params: any = {
                skip: (page - 1) * 50,
                take: 50,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.categoryId = selectedCategory;
            if (selectedSubcategory) params.subcategoryId = selectedSubcategory;
            if (selectedItemType) params.itemTypeId = selectedItemType;

            if (!showInactive) params.active = true;

            // ✅ NEW: Pass stock filter to backend
            if (stockFilter) {
                params.stockStatus = stockFilter;
            }

            const response = await apiClient.get('/products', { params });

            // ✅ FIXED: Use backend results directly (no client-side filtering)
            setProducts(response.data.data);
            setTotalPages(Math.ceil(response.data.total / 50));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/products/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            await apiClient.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('فشل حذف المنتج');
        }
    };

    const handleReactivate = async (id: number) => {
        try {
            await apiClient.patch(`/products/${id}`, { active: true });
            fetchProducts();
        } catch (error) {
            console.error('Failed to reactivate product:', error);
            alert('فشل تفعيل المنتج');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const getSubcategories = (): Subcategory[] => {
        if (!selectedCategory) return [];
        const category = categories.find(c => c.id === selectedCategory);
        return category?.subcategories || [];
    };

    const getItemTypes = (): ItemType[] => {
        if (!selectedSubcategory) return [];
        const subcategory = getSubcategories().find(s => s.id === selectedSubcategory);
        return subcategory?.itemTypes || [];
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedSubcategory || selectedItemType || stockFilter;

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
            }}>
                <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold' }}>
                    المنتجات
                </h1>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowForm(true);
                    }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                    }}
                >
                    <Plus size={20} />
                    إضافة منتج
                </button>
            </div>

            {/* Enhanced Filters */}
            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                {/* Main Filters Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="بحث (الاسم، الباركود، الكود)"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem 0.75rem 1rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                        {searchTerm && (
                            <span style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                            }}>
                                ✓
                            </span>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div style={{ position: 'relative' }}>
                        <Filter
                            size={18}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: selectedCategory ? '#667eea' : '#9ca3af',
                            }}
                        />
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value ? Number(e.target.value) : null);
                                setSelectedSubcategory(null);
                                setSelectedItemType(null);
                                setPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem 0.75rem 1rem',
                                border: selectedCategory ? '2px solid #667eea' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                background: 'white',
                                transition: 'all 0.2s',
                                fontWeight: selectedCategory ? '600' : 'normal',
                            }}
                        >
                            <option value="">كل الفئات</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nameAr || cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subcategory Filter */}
                    <div style={{ position: 'relative' }}>
                        <Filter
                            size={18}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: selectedSubcategory ? '#667eea' : '#9ca3af',
                            }}
                        />
                        <select
                            value={selectedSubcategory || ''}
                            onChange={(e) => {
                                setSelectedSubcategory(e.target.value ? Number(e.target.value) : null);
                                setSelectedItemType(null);
                                setPage(1);
                            }}
                            disabled={!selectedCategory}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem 0.75rem 1rem',
                                border: selectedSubcategory ? '2px solid #667eea' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                background: 'white',
                                opacity: selectedCategory ? 1 : 0.5,
                                transition: 'all 0.2s',
                                fontWeight: selectedSubcategory ? '600' : 'normal',
                            }}
                        >
                            <option value="">كل الفئات الفرعية</option>
                            {getSubcategories().map(sub => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.nameAr || sub.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Item Type Filter */}
                    <div style={{ position: 'relative' }}>
                        <Filter
                            size={18}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: selectedItemType ? '#667eea' : '#9ca3af',
                            }}
                        />
                        <select
                            value={selectedItemType || ''}
                            onChange={(e) => {
                                setSelectedItemType(e.target.value ? Number(e.target.value) : null);
                                setPage(1);
                            }}
                            disabled={!selectedSubcategory}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem 0.75rem 1rem',
                                border: selectedItemType ? '2px solid #667eea' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                background: 'white',
                                opacity: selectedSubcategory ? 1 : 0.5,
                                transition: 'all 0.2s',
                                fontWeight: selectedItemType ? '600' : 'normal',
                            }}
                        >
                            <option value="">كل الأصناف</option>
                            {getItemTypes().map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.nameAr || item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stock Level Filter */}
                    <div style={{ position: 'relative' }}>
                        <Filter
                            size={18}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: stockFilter ? '#667eea' : '#9ca3af'
                            }}
                        />
                        <select
                            value={stockFilter}
                            onChange={(e) => {
                                setStockFilter(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem 2.5rem 0.75rem 1rem',
                                border: stockFilter ? '2px solid #667eea' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                background: 'white',
                                transition: 'all 0.2s',
                                fontWeight: stockFilter ? 600 : 'normal'
                            }}
                        >
                            <option value="">كل المخزون</option>
                            <option value="empty">نافذ (0)</option>
                            <option value="low">منخفض (&lt;= الحد الأدنى)</option>
                            <option value="enough">كافي (بين الحدود)</option>
                            <option value="high">مرتفع (&gt;= الحد الأقصى)</option>
                        </select>
                    </div>

                </div>

                {/* Filter Actions Row */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}>
                    {/* Show Inactive Products Toggle */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        background: showInactive ? '#f0f4ff' : '#f9fafb',
                        borderRadius: '8px',
                        border: showInactive ? '2px solid #667eea' : '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        userSelect: 'none',
                    }}
                        onMouseEnter={(e) => {
                            if (!showInactive) {
                                e.currentTarget.style.background = '#f3f4f6';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showInactive) {
                                e.currentTarget.style.background = '#f9fafb';
                            }
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: '#667eea',
                            }}
                        />
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: showInactive ? '600' : 'normal',
                            color: showInactive ? '#667eea' : '#374151',
                        }}>
                            عرض المنتجات غير النشطة
                        </span>
                        {showInactive && (
                            <span style={{
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '2px 8px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                            }}>
                                ON
                            </span>
                        )}
                    </label>

                    {/* Active Filters Badge */}
                    {hasActiveFilters && (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#fef3c7',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                color: '#92400e',
                                fontWeight: '600',
                            }}>
                                <Filter size={14} />
                                <span>فلاتر نشطة</span>
                            </div>

                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory(null);
                                    setSelectedSubcategory(null);
                                    setSelectedItemType(null);
                                    setStockFilter(''); // Add this line
                                    setPage(1);
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: '#fee2e2',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: '#991b1b',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fecaca';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fee2e2';
                                }}
                            >
                                ✕ مسح الفلاتر
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        جاري التحميل...
                    </div>
                ) : products.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#9ca3af',
                    }}>
                        <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                            {hasActiveFilters ? 'لا توجد منتجات مطابقة للبحث' : 'لا توجد منتجات'}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                            {hasActiveFilters ? 'حاول تغيير معايير البحث' : 'ابدأ بإضافة منتجات جديدة'}
                        </div>
                    </div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                                        الكود
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                                        الاسم
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                                        الباركود
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                                        السعر
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                                        التكلفة
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                                        الكمية
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                                        الحالة
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                                        إجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const stock = product.stock || 0;
                                    const isLowStock = stock > 0 && stock <= product.minQty;
                                    const isOutOfStock = stock <= 0;

                                    return (
                                        <tr
                                            key={product.id}
                                            style={{
                                                borderBottom: '1px solid #e5e7eb',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                    {product.code}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>
                                                    {product.nameAr || product.nameEn}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                    {product.nameEn}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                    {product.barcode}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ fontWeight: '600', color: '#059669' }}>
                                                    {Number(product.priceRetail).toFixed(2)} ر.س
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>
                                                    {Number(product.costAvg || product.cost || 0).toFixed(2)} ر.س
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                    آخر شراء: {Number(product.cost || 0).toFixed(2)}
                                                </div>
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500',
                                                    background: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7',
                                                    color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
                                                }}>
                                                    {stock} {product.unit}
                                                    {isLowStock && !isOutOfStock && (
                                                        <span style={{ fontSize: '0.75rem' }}>قليل</span>
                                                    )}
                                                    {isOutOfStock && (
                                                        <span style={{ fontSize: '0.75rem' }}>نفذ</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    background: product.active ? '#dcfce7' : '#fee2e2',
                                                    color: product.active ? '#16a34a' : '#dc2626',
                                                }}>
                                                    {product.active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductForAudit(product);
                                                            setShowAuditHistory(true);
                                                        }}
                                                        title="سجل التعديلات"
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#8b5cf6',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Clock size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductForTransactions(product);
                                                            setShowTransactions(true);
                                                        }}
                                                        title="حركات المخزون"
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#3b82f6',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <TrendingUp size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setShowForm(true);
                                                        }}
                                                        title="تعديل"
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#6366f1',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Edit size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        title="حذف"
                                                        style={{
                                                            padding: '0.5rem',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                    {!product.active && (
                                                        <button
                                                            onClick={() => handleReactivate(product.id)}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '0.375rem',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                            }}
                                                            title="تفعيل"
                                                        >
                                                            ✓ تفعيل
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                padding: '1rem',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}>
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        background: page === 1 ? '#f3f4f6' : 'white',
                                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    السابق
                                </button>
                                <div style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>
                                    صفحة {page} من {totalPages}
                                </div>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        background: page === totalPages ? '#f3f4f6' : 'white',
                                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    التالي
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onClose={handleFormClose}
                    onSave={() => {
                        handleFormClose();
                        fetchProducts();
                    }}
                />
            )}

            {showAuditHistory && selectedProductForAudit && (
                <ProductAuditHistory
                    productId={selectedProductForAudit.id}
                    productName={selectedProductForAudit.nameAr || selectedProductForAudit.nameEn}
                    onClose={() => {
                        setShowAuditHistory(false);
                        setSelectedProductForAudit(null);
                    }}
                />
            )}

            {showTransactions && selectedProductForTransactions && (
                <ProductTransactions
                    product={selectedProductForTransactions}
                    onClose={() => {
                        setShowTransactions(false);
                        setSelectedProductForTransactions(null);
                    }}
                />
            )}

        </div>
    );
}