import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Package } from 'lucide-react';

interface ItemType {
    id: number;
    name: string;
    nameAr: string;
    subcategoryId: number;
    defaultRetailMargin?: number;
    defaultWholesaleMargin?: number;
    _count?: { products: number };
}

interface Subcategory {
    id: number;
    name: string;
    nameAr: string;
    categoryId: number;
    defaultRetailMargin?: number;
    defaultWholesaleMargin?: number;
    itemTypes: ItemType[];
    _count?: { itemTypes: number };
}

interface Category {
    id: number;
    name: string;
    nameAr: string;
    defaultRetailMargin?: number;
    defaultWholesaleMargin?: number;
    subcategories: Subcategory[];
    _count?: { products: number };
}

interface Product {
    id: number;
    code: string;
    barcode: string;
    name: string;
    nameAr: string;
    nameEn: string;
    unit: string;
    stock: number;
    priceRetail: number;
    minQty: number;
}


export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [expandedSubcategories, setExpandedSubcategories] = useState<Set<number>>(new Set());

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [showItemTypeModal, setShowItemTypeModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [editingItemType, setEditingItemType] = useState<ItemType | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', nameAr: '', defaultRetailMargin: 0, defaultWholesaleMargin: 0 });
    const [subcategoryForm, setSubcategoryForm] = useState({ name: '', nameAr: '', categoryId: 0, defaultRetailMargin: 0, defaultWholesaleMargin: 0 });
    const [itemTypeForm, setItemTypeForm] = useState({ name: '', nameAr: '', subcategoryId: 0, defaultRetailMargin: 0, defaultWholesaleMargin: 0 });

    // New states for products
    const [expandedItemTypes, setExpandedItemTypes] = useState<Set<number>>(new Set());
    const [itemProducts, setItemProducts] = useState<Record<number, Product[]>>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const mixedCat = categories.find(c =>
            c.name?.toLowerCase() === 'mixed' || c.nameAr === 'متنوع'
        );
        if (mixedCat) {
            setExpandedCategories(new Set([mixedCat.id]));
        }
    }, [categories]);


    const fetchCategories = async () => {
        try {
            const { data } = await apiClient.get('/products/categories');
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (id: number) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedCategories(newExpanded);
    };

    const toggleSubcategory = (id: number) => {
        const newExpanded = new Set(expandedSubcategories);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSubcategories(newExpanded);
    };

    const fetchItemProducts = async (itemTypeId: number) => {
        try {
            const { data } = await apiClient.get(`/products?itemTypeId=${itemTypeId}&active=true`);
            const products = data.data || data;

            // ✅ Filter out defective products on frontend
            const defectiveCat = categories.find(c =>
                c.name?.toLowerCase() === 'defective' || c.nameAr === 'تلافيات'
            );

            const filteredProducts = Array.isArray(products)
                ? products.filter(p => p.categoryId !== defectiveCat?.id)
                : [];

            setItemProducts(prev => ({ ...prev, [itemTypeId]: filteredProducts }));
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setItemProducts(prev => ({ ...prev, [itemTypeId]: [] }));
        }
    };


    const toggleItemType = (id: number) => {
        const newExpanded = new Set(expandedItemTypes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
            // Fetch products when expanding
            if (!itemProducts[id]) {
                fetchItemProducts(id);
            }
        }
        setExpandedItemTypes(newExpanded);
    };

    // ============================================
    // CATEGORY OPERATIONS
    // ============================================
    const handleAddCategory = () => {
        setCategoryForm({ name: '', nameAr: '', defaultRetailMargin: 0, defaultWholesaleMargin: 0 });
        setEditingCategory(null);
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category: Category) => {
        setCategoryForm({
            name: category.name,
            nameAr: category.nameAr || '',
            defaultRetailMargin: category.defaultRetailMargin || 0,
            defaultWholesaleMargin: category.defaultWholesaleMargin || 0
        });
        setEditingCategory(category);
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await apiClient.patch(`/products/categories/${editingCategory.id}`, categoryForm);
            } else {
                await apiClient.post('/products/categories', categoryForm);
            }
            setShowCategoryModal(false);
            fetchCategories();
        } catch (error) {
            alert('فشل حفظ التصنيف');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
        try {
            await apiClient.delete(`/products/categories/${id}`);
            fetchCategories();
        } catch (error) {
            alert('فشل حذف التصنيف');
        }
    };

    // ============================================
    // SUBCATEGORY OPERATIONS
    // ============================================
    const handleAddSubcategory = (categoryId: number) => {
        setSubcategoryForm({ name: '', nameAr: '', categoryId, defaultRetailMargin: 0, defaultWholesaleMargin: 0 });
        setEditingSubcategory(null);
        setSelectedCategoryId(categoryId);
        setShowSubcategoryModal(true);
    };

    const handleEditSubcategory = (subcategory: Subcategory) => {
        setSubcategoryForm({
            name: subcategory.name,
            nameAr: subcategory.nameAr || '',
            categoryId: subcategory.categoryId,
            defaultRetailMargin: subcategory.defaultRetailMargin || 0,
            defaultWholesaleMargin: subcategory.defaultWholesaleMargin || 0
        });
        setEditingSubcategory(subcategory);
        setShowSubcategoryModal(true);
    };

    const handleSaveSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSubcategory) {
                await apiClient.patch(`/products/subcategories/${editingSubcategory.id}`, subcategoryForm);
            } else {
                await apiClient.post('/products/subcategories', subcategoryForm);
            }
            setShowSubcategoryModal(false);
            fetchCategories();
        } catch (error) {
            alert('فشل حفظ التصنيف الفرعي');
        }
    };

    const handleDeleteSubcategory = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا التصنيف الفرعي؟')) return;
        try {
            await apiClient.delete(`/products/subcategories/${id}`);
            fetchCategories();
        } catch (error) {
            alert('فشل حذف التصنيف الفرعي');
        }
    };

    // ============================================
    // ITEM TYPE OPERATIONS
    // ============================================
    const handleAddItemType = (subcategoryId: number) => {
        setItemTypeForm({ name: '', nameAr: '', subcategoryId, defaultRetailMargin: 0, defaultWholesaleMargin: 0 });
        setEditingItemType(null);
        setSelectedSubcategoryId(subcategoryId);
        setShowItemTypeModal(true);
    };

    const handleEditItemType = (itemType: ItemType) => {
        setItemTypeForm({
            name: itemType.name,
            nameAr: itemType.nameAr || '',
            subcategoryId: itemType.subcategoryId,
            defaultRetailMargin: itemType.defaultRetailMargin || 0,
            defaultWholesaleMargin: itemType.defaultWholesaleMargin || 0
        });
        setEditingItemType(itemType);
        setShowItemTypeModal(true);
    };

    const handleSaveItemType = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItemType) {
                await apiClient.patch(`/products/item-types/${editingItemType.id}`, itemTypeForm);
            } else {
                await apiClient.post('/products/item-types', itemTypeForm);
            }
            setShowItemTypeModal(false);
            fetchCategories();
        } catch (error) {
            alert('فشل حفظ نوع الصنف');
        }
    };

    const handleDeleteItemType = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        try {
            await apiClient.delete(`/products/item-types/${id}`);
            fetchCategories();
        } catch (error) {
            alert('فشل حذف نوع الصنف');
        }
    };

    if (loading) {
        return <div>جاري التحميل...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>التصنيفات الهرمية</h1>
                <button
                    onClick={handleAddCategory}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                    }}
                >
                    <Plus size={20} />
                    إضافة تصنيف رئيسي
                </button>
            </div>

            {/* Hierarchy Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>لا توجد تصنيفات</p>
                        <p>ابدأ بإضافة تصنيف رئيسي</p>
                    </div>
                ) : (
                    [...categories].sort((a, b) => {
                        const aIsMixed = a.name?.toLowerCase() === 'mixed' || a.nameAr === 'متنوع';
                        const bIsMixed = b.name?.toLowerCase() === 'mixed' || b.nameAr === 'متنوع';
                        const aIsDefective = a.name?.toLowerCase() === 'defective' || a.nameAr === 'تلافيات';
                        const bIsDefective = b.name?.toLowerCase() === 'defective' || b.nameAr === 'تلافيات';

                        // Defective always last
                        if (aIsDefective) return 1;
                        if (bIsDefective) return -1;

                        // Mixed second to last (before Defective)
                        if (aIsMixed) return 1;
                        if (bIsMixed) return -1;

                        // Normal categories stay in their order
                        return 0;
                    }).map((category) => (

                        <CategoryCard
                            key={category.id}

                            category={category}
                            isExpanded={expandedCategories.has(category.id)}
                            onToggle={() => toggleCategory(category.id)}
                            onEdit={() => handleEditCategory(category)}
                            onDelete={() => handleDeleteCategory(category.id)}
                            onAddSubcategory={() => handleAddSubcategory(category.id)}
                            expandedSubcategories={expandedSubcategories}
                            onToggleSubcategory={toggleSubcategory}
                            onEditSubcategory={handleEditSubcategory}
                            onDeleteSubcategory={handleDeleteSubcategory}
                            onAddItemType={handleAddItemType}
                            onEditItemType={handleEditItemType}
                            onDeleteItemType={handleDeleteItemType}
                            expandedItemTypes={expandedItemTypes}
                            onToggleItemType={toggleItemType}
                            itemProducts={itemProducts}
                        />
                    ))
                )}
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <Modal title={editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف'} onClose={() => setShowCategoryModal(false)}>
                    <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الاسم (English)</label>
                            <input
                                type="text"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الاسم (عربي)</label>
                            <input
                                type="text"
                                value={categoryForm.nameAr}
                                onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>هامش التجزئة (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={categoryForm.defaultRetailMargin * 100}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, defaultRetailMargin: Number(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>هامش الجملة (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={categoryForm.defaultWholesaleMargin * 100}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, defaultWholesaleMargin: Number(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                حفظ
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Subcategory Modal */}
            {showSubcategoryModal && (
                <Modal title={editingSubcategory ? 'تعديل تصنيف فرعي' : 'إضافة تصنيف فرعي'} onClose={() => setShowSubcategoryModal(false)}>
                    <form onSubmit={handleSaveSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الاسم (English)</label>
                            <input
                                type="text"
                                value={subcategoryForm.name}
                                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الاسم (عربي)</label>
                            <input
                                type="text"
                                value={subcategoryForm.nameAr}
                                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, nameAr: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>هامش التجزئة (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={subcategoryForm.defaultRetailMargin * 100}
                                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, defaultRetailMargin: Number(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>هامش الجملة (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={subcategoryForm.defaultWholesaleMargin * 100}
                                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, defaultWholesaleMargin: Number(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                حفظ
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSubcategoryModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Item Type Modal */}
            {showItemTypeModal && (
                <Modal title={editingItemType ? 'تعديل نوع صنف' : 'إضافة نوع صنف'} onClose={() => setShowItemTypeModal(false)}>
                    <form onSubmit={handleSaveItemType} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الاسم (English)</label>
                            <input
                                type="text"
                                value={itemTypeForm.name}
                                onChange={(e) => setItemTypeForm({ ...itemTypeForm, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>الاسم (عربي)</label>
                            <input
                                type="text"
                                value={itemTypeForm.nameAr}
                                onChange={(e) => setItemTypeForm({ ...itemTypeForm, nameAr: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    textAlign: 'right',
                                }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>هامش التجزئة (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={itemTypeForm.defaultRetailMargin * 100}
                                    onChange={(e) => setItemTypeForm({ ...itemTypeForm, defaultRetailMargin: Number(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>هامش الجملة (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={itemTypeForm.defaultWholesaleMargin * 100}
                                    onChange={(e) => setItemTypeForm({ ...itemTypeForm, defaultWholesaleMargin: Number(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                حفظ
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowItemTypeModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// ============================================
// CATEGORY CARD COMPONENT
// ============================================
function CategoryCard({ category, isExpanded, onToggle, onEdit, onDelete, onAddSubcategory, expandedSubcategories, onToggleSubcategory, onEditSubcategory, onDeleteSubcategory, onAddItemType, onEditItemType, onDeleteItemType, expandedItemTypes, onToggleItemType, itemProducts }: any) {
    // ✅ Detect special categories
    const isMixed = category.name?.toLowerCase() === 'mixed' || category.nameAr === 'متنوع';
    const isDefective = category.name?.toLowerCase().includes('defect') || category.nameAr === 'معيوب'
    const isSpecial = isMixed || isDefective;

    // ✅ Different colors for special categories
    const bgGradient = isDefective
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' // Red for defective
        : isMixed
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' // Orange for mixed
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Purple for normal

    // ✅ State for Mixed products
    const [mixedProducts, setMixedProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // ✅ Load products for special categories (Mixed & Defective)
    useEffect(() => {
        if (isSpecial && isExpanded) {
            loadMixedProducts();
        }
    }, [isSpecial, isExpanded, category.id]);

    const loadMixedProducts = async () => {
        try {
            setLoadingProducts(true);
            const branchId = localStorage.getItem('branchId') || '1';
            const { data } = await apiClient.get(`/products?categoryId=${category.id}&branchId=${branchId}&active=true`);
            console.log('✅ Mixed products loaded:', data);
            const products = data.data || data; // ✅ Extract nested array
            setMixedProducts(Array.isArray(products) ? products : []);

        } catch (error) {
            console.error('Failed to load mixed products:', error);
            setMixedProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    return (
        <div
            style={{
                background: bgGradient, // ✅ Dynamic color
                borderRadius: '1rem',
                padding: '1.5rem',
                color: 'white',
            }}
        >
            {/* Category Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                onClick={onToggle}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* ✅ Different icon for Mixed */}
                        <span style={{ fontSize: '2rem' }}>
                            {isDefective ? '⚠️' : isMixed ? '🔧' : '📁'}
                        </span>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                {category.nameAr || category.name}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                                    {category.name}
                                </div>
                                {category.defaultRetailMargin != null && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                    }}>
                                        R: {(category.defaultRetailMargin * 100).toFixed(0)}%
                                    </div>
                                )}
                                {category.defaultWholesaleMargin != null && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                    }}>
                                        W: {(category.defaultWholesaleMargin * 100).toFixed(0)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isSpecial && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <Edit size={18} />
                        </button>
                    )}
                    {!isSpecial && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            style={{
                                padding: '0.5rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}

                    {/* ✅ Hide "Add Subcategory" button for Mixed */}
                    {!isSpecial && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddSubcategory(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={18} />
                            تصنيف فرعي
                        </button>
                    )}
                </div>
            </div>

            {/* Content - Different for Mixed vs Normal */}
            {isExpanded && (
                <div style={{ marginTop: '1rem', marginRight: '2rem' }}>
                    {isSpecial ? (
                        /* ✅ MIXED CATEGORY - Show Products */
                        loadingProducts ? (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '0.75rem'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                                <div>جاري تحميل المنتجات...</div>
                            </div>
                        ) : mixedProducts.length === 0 ? (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.9)',
                            }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {isDefective ? 'لا توجد منتجات تالفة' : 'لا توجد منتجات متنوعة'}
                                </div>
                                <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                                    {isDefective
                                        ? 'أضف منتجات من صفحة "المنتجات" واختر "تلافيات" كتصنيف'
                                        : 'أضف منتجات من صفحة "المنتجات" واختر "متنوع" كتصنيف'
                                    }
                                </div>
                            </div>

                        ) : (
                            <div>
                                {/* Product Count Badge */}
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                }}>
                                    <span>📦</span>
                                    <span>{mixedProducts.length}{isDefective ? 'منتج تالف' : 'منتج متنوع'}</span>
                                </div>

                                {/* Products Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: '1rem',
                                }}>
                                    {mixedProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            style={{
                                                background: 'rgba(255,255,255,0.15)',
                                                borderRadius: '0.75rem',
                                                padding: '1rem',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Product Icon */}
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                background: 'rgba(255,255,255,0.2)',
                                                borderRadius: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2.5rem',
                                                marginBottom: '0.75rem',
                                                margin: '0 auto 0.75rem auto',
                                            }}>
                                                📦
                                            </div>

                                            {/* Product Name */}
                                            <div style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: '700',
                                                marginBottom: '0.5rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'center',
                                            }}>
                                                {product.nameAr || product.nameEn}
                                            </div>

                                            {/* Product Code */}
                                            <div style={{
                                                fontSize: '0.75rem',
                                                opacity: 0.8,
                                                fontFamily: 'monospace',
                                                marginBottom: '0.75rem',
                                                textAlign: 'center',
                                            }}>
                                                {product.code || product.barcode}
                                            </div>

                                            {/* Divider */}
                                            <div style={{
                                                height: '1px',
                                                background: 'rgba(255,255,255,0.2)',
                                                marginBottom: '0.75rem',
                                            }} />

                                            {/* Stock & Price */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.375rem 0.625rem',
                                                    background: product.stock > 10
                                                        ? 'rgba(16,185,129,0.3)'
                                                        : product.stock > 0
                                                            ? 'rgba(245,158,11,0.3)'
                                                            : 'rgba(239,68,68,0.3)',
                                                    borderRadius: '0.375rem',
                                                    fontWeight: '600',
                                                }}>
                                                    {product.stock || 0} متاح
                                                </div>
                                                <div style={{
                                                    fontSize: '0.9375rem',
                                                    fontWeight: '700'
                                                }}>
                                                    {Number(product.priceRetail).toFixed(2)} ر.س
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        /* ✅ NORMAL CATEGORY - Show Subcategories (Original Logic) */
                        category.subcategories?.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>
                                لا توجد تصنيفات فرعية
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {category.subcategories?.map((sub: Subcategory) => (
                                    <SubcategoryCard
                                        key={sub.id}
                                        subcategory={sub}
                                        isExpanded={expandedSubcategories.has(sub.id)}
                                        onToggle={() => onToggleSubcategory(sub.id)}
                                        onEdit={() => onEditSubcategory(sub)}
                                        onDelete={() => onDeleteSubcategory(sub.id)}
                                        onAddItemType={() => onAddItemType(sub.id)}
                                        onEditItemType={onEditItemType}
                                        onDeleteItemType={onDeleteItemType}
                                        expandedItemTypes={expandedItemTypes}
                                        onToggleItemType={onToggleItemType}
                                        itemProducts={itemProducts}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}


// ============================================
// SUBCATEGORY CARD COMPONENT
// ============================================
function SubcategoryCard({ subcategory, isExpanded, onToggle, onEdit, onDelete, onAddItemType, onEditItemType, onDeleteItemType, expandedItemTypes, onToggleItemType, itemProducts }: any) {
    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '0.75rem',
                padding: '1rem',
                color: 'white',
            }}
        >
            {/* Subcategory Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                onClick={onToggle}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{subcategory.nameAr || subcategory.name}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{subcategory.name}</div>
                            {subcategory.defaultRetailMargin != null && (
                                <div style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    fontWeight: '600'
                                }}>
                                    R: {(subcategory.defaultRetailMargin * 100).toFixed(0)}%
                                </div>
                            )}
                            {subcategory.defaultWholesaleMargin != null && (
                                <div style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    fontWeight: '600'
                                }}>
                                    W: {(subcategory.defaultWholesaleMargin * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        style={{
                            padding: '0.4rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '0.4rem',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        style={{
                            padding: '0.4rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '0.4rem',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddItemType(); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '0.4rem',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={16} />
                        نوع
                    </button>
                </div>
            </div>

            {/* Item Types */}
            {isExpanded && (
                <div style={{ marginTop: '0.75rem', marginRight: '1.5rem' }}>
                    {subcategory.itemTypes?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '0.75rem', opacity: 0.7 }}>لا توجد أنواع أصناف</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {subcategory.itemTypes?.map((itemType: ItemType) => (
                                <ItemTypeCard
                                    key={itemType.id}
                                    itemType={itemType}
                                    onEdit={onEditItemType}
                                    onDelete={onDeleteItemType}
                                    isExpanded={expandedItemTypes.has(itemType.id)}
                                    onToggle={() => onToggleItemType(itemType.id)}
                                    products={itemProducts[itemType.id]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// ITEM TYPE CARD COMPONENT
// ============================================
function ItemTypeCard({ itemType, onEdit, onDelete, isExpanded, onToggle, products }: any) {
    const productCount = products ? products.length : (itemType._count?.products ?? itemType.count?.products ?? 0);

    return (
        <div style={{ marginBottom: '0.5rem' }}>
            {/* Item Type Header */}
            <div
                style={{
                    padding: '0.75rem 1rem',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                }}
                onClick={onToggle}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isExpanded ? (
                        <ChevronDown size={18} color="#6366f1" />
                    ) : (
                        <ChevronRight size={18} color="#6366f1" />
                    )}
                    <Package size={18} style={{ color: '#6366f1' }} />
                    <div>
                        <div style={{ fontWeight: 500, fontSize: '0.95rem', color: '#1f2937' }}>
                            {itemType.nameAr || itemType.name}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                {itemType.name}
                            </div>
                            {itemType.defaultRetailMargin != null && (
                                <div style={{
                                    fontSize: '0.7rem',
                                    background: '#f3f4f6',
                                    color: '#6b7280',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    fontWeight: '600',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    R: {(itemType.defaultRetailMargin * 100).toFixed(0)}%
                                </div>
                            )}
                            {itemType.defaultWholesaleMargin != null && (
                                <div style={{
                                    fontSize: '0.7rem',
                                    background: '#f3f4f6',
                                    color: '#6b7280',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    fontWeight: '600',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    W: {(itemType.defaultWholesaleMargin * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        background: '#f3f4f6',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.375rem'
                    }}>
                        {productCount} منتج
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(itemType); }}
                        style={{
                            padding: '0.25rem',
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            cursor: 'pointer',
                        }}
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(itemType.id); }}
                        style={{
                            padding: '0.25rem',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                        }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Enhanced Products List */}
            {isExpanded && (
                <div style={{
                    marginTop: '0.5rem',
                    marginRight: '2rem',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                }}>
                    {!products ? (
                        <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
                            جاري التحميل...
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
                            لا توجد منتجات نشطة
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '0.75rem',
                        }}>
                            {products.map((product: any) => {
                                const stock = product.stock || 0;
                                const isLowStock = stock > 0 && stock <= (product.minQty || 5);
                                const isOutOfStock = stock === 0;

                                return (
                                    <div
                                        key={product.id}
                                        style={{
                                            padding: '0.875rem',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {/* Product Header */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            marginBottom: '0.75rem',
                                        }}>
                                            {/* Product Icon */}
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '0.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                flexShrink: 0,
                                            }}>
                                                📦
                                            </div>

                                            {/* Product Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    color: '#1f2937',
                                                    marginBottom: '0.25rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {product.nameAr || product.nameEn}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280',
                                                    fontFamily: 'monospace',
                                                }}>
                                                    {product.code || product.barcode}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div style={{
                                            height: '1px',
                                            background: '#e5e7eb',
                                            margin: '0.75rem 0',
                                        }} />

                                        {/* Product Details */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}>
                                            {/* Stock Badge */}
                                            <div style={{
                                                fontSize: '0.75rem',
                                                padding: '0.375rem 0.625rem',
                                                background: isOutOfStock
                                                    ? '#fee2e2'
                                                    : isLowStock
                                                        ? '#fef3c7'
                                                        : '#d1fae5',
                                                color: isOutOfStock
                                                    ? '#991b1b'
                                                    : isLowStock
                                                        ? '#92400e'
                                                        : '#065f46',
                                                borderRadius: '0.375rem',
                                                fontWeight: '600',
                                            }}>
                                                {stock} {product.unit || 'وحدة'}
                                                {isOutOfStock && ' ⚠️'}
                                                {isLowStock && !isOutOfStock && ' ⚡'}
                                            </div>

                                            {/* Price */}
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: '700',
                                                color: '#6366f1',
                                            }}>
                                                {Number(product.priceRetail || 0).toFixed(2)} ر.س
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// MODAL COMPONENT
// ============================================
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '500px',
                    width: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
                {children}
            </div>
        </div>
    );
}

// ✅ NEW COMPONENT: Display products for Mixed category
function MixedCategoryProducts({ categoryId }: { categoryId: number }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMixedProducts();
    }, [categoryId]);

    const loadMixedProducts = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/products?categoryId=${categoryId}&active=true`);
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load mixed products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                <div>جاري التحميل...</div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    لا توجد منتجات متنوعة
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    أضف منتجات من صفحة المنتجات واختر "متنوع" كتصنيف
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
            }}>
                <span>📦</span>
                <span>{products.length} منتج متنوع</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px',
            }}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            padding: '16px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Product Icon */}
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            marginBottom: '12px',
                        }}>
                            📦
                        </div>

                        {/* Product Name */}
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            marginBottom: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {product.nameAr || product.nameEn}
                        </div>

                        {/* Product Code */}
                        <div style={{
                            fontSize: '11px',
                            opacity: 0.8,
                            fontFamily: 'monospace',
                            marginBottom: '8px',
                        }}>
                            {product.code || product.barcode}
                        </div>

                        {/* Stock & Price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{
                                fontSize: '12px',
                                padding: '4px 8px',
                                background: product.stock > 10
                                    ? 'rgba(16,185,129,0.3)'
                                    : product.stock > 0
                                        ? 'rgba(245,158,11,0.3)'
                                        : 'rgba(239,68,68,0.3)',
                                borderRadius: '6px',
                                fontWeight: '600',
                            }}>
                                {product.stock || 0} متاح
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>
                                {Number(product.priceRetail).toFixed(2)} ر.س
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
