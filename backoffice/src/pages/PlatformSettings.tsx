import { useState, useEffect } from 'react';
import { Settings, Save, Trash2, Plus } from 'lucide-react';
import apiClient from '../api/client';

interface Platform {
    id: number;
    platform: string;
    name: string;
    taxRate: number;
    commission: number;
    shippingFee: number; // ✅ NEW
    active: boolean;
}

function PlatformSettings() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPlatform, setNewPlatform] = useState({
        name: '',
        taxRate: 15,
        commission: 0,
        shippingFee: 0, // ✅ NEW
        active: true,
    });

    useEffect(() => {
        fetchPlatforms();
    }, []);

    const fetchPlatforms = async () => {
        console.log('Starting fetchPlatforms...');
        setLoading(true);
        try {
            console.log('Calling API: settings/platforms');
            const response = await apiClient.get('settings/platforms');
            console.log('Response:', response);
            console.log('Response.data:', response.data);

            // ✅ AUTO-INITIALIZE: If no platforms exist, create defaults based on permissions
            if (!response.data || response.data.length === 0) {
                console.log('No platforms found, initializing defaults...');
                await initializeDefaultPlatforms();
                // Fetch again after initialization
                const newResponse = await apiClient.get('settings/platforms');
                setPlatforms(newResponse.data);
            } else {
                setPlatforms(response.data);
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Error response:', error.response);
        } finally {
            console.log('fetchPlatforms complete');
            setLoading(false);
        }
    };

    const initializeDefaultPlatforms = async () => {
        // Get user permissions from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const permissions = userData.permissions || [];

        // Extract platform names from permissions
        const platformPermissions = permissions
            .filter((p: string) => p.startsWith('platform:'))
            .map((p: string) => p.replace('platform:', ''));

        console.log('Found platform permissions:', platformPermissions);

        // Create default platforms for each permission
        const defaultPlatforms = [
            { name: 'POGBA', taxRate: 15, commission: 5, shippingFee: 0, active: true },
            { name: 'NORMAL', taxRate: 15, commission: 0, shippingFee: 0, active: true },
            { name: 'NOON', taxRate: 15, commission: 10, shippingFee: 15, active: true },
            { name: 'JUMIA', taxRate: 15, commission: 12, shippingFee: 20, active: true },
            { name: 'AMAZON', taxRate: 15, commission: 15, shippingFee: 25, active: true },
            { name: 'SOCIAL', taxRate: 15, commission: 0, shippingFee: 0, active: true },
            { name: 'ZID', taxRate: 15, commission: 8, shippingFee: 12, active: true },
            { name: 'AAMAZO', taxRate: 15, commission: 10, shippingFee: 20, active: true },
            { name: 'YOU', taxRate: 15, commission: 5, shippingFee: 10, active: true },
        ];

        // Filter to only platforms the user has permission for
        const allowedPlatforms = defaultPlatforms.filter(p =>
            platformPermissions.includes(p.name)
        );

        console.log('Creating platforms:', allowedPlatforms);

        // Create each platform
        for (const platform of allowedPlatforms) {
            try {
                await apiClient.post('settings/platforms', platform);
                console.log(`✅ Created platform: ${platform.name}`);
            } catch (error) {
                console.error(`❌ Failed to create platform ${platform.name}:`, error);
            }
        }
    };

    const updatePlatform = (id: number, field: string, value: any) => {
        setPlatforms(platforms.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };

    const savePlatform = async (platform: Platform) => {
        try {
            console.log('Saving platform:', platform);
            const response = await apiClient.put(`settings/platforms/${platform.platform}`, {
                name: platform.name,
                taxRate: parseFloat(platform.taxRate.toString()),
                commission: parseFloat(platform.commission.toString()),
                shippingFee: parseFloat(platform.shippingFee.toString()), // ✅ NEW
                active: platform.active,
            });
            console.log('Save response:', response.data);
            setMessage(`✅ تم حفظ إعدادات ${platform.name}`);
            setTimeout(() => setMessage(''), 3000);
            fetchPlatforms();
        } catch (error: any) {
            console.error('Save error:', error);
            setMessage(`❌ ${error.response?.data?.message || 'فشل الحفظ'}`);
        }
    };

    const deletePlatform = async (platform: string, name: string) => {
        if (!confirm(`هل أنت متأكد من حذف ${name}؟`)) return;

        try {
            await apiClient.delete(`settings/platforms/${platform}`);
            setPlatforms(platforms.filter((p) => p.platform !== platform));
            setMessage(`✅ تم حذف ${name}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(`❌ ${error.response?.data?.message || 'فشل الحذف'}`);
        }
    };

    const saveAllPlatforms = async () => {
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const platform of platforms) {
            try {
                await apiClient.put(`settings/platforms/${platform.platform}`, {
                    name: platform.name,
                    taxRate: parseFloat(platform.taxRate.toString()),
                    commission: parseFloat(platform.commission.toString()),
                    shippingFee: parseFloat(platform.shippingFee.toString()), // ✅ NEW
                    active: platform.active,
                });
                successCount++;
            } catch (error: any) {
                console.error(`Failed to save ${platform.platform}`, error);
                failCount++;
            }
        }

        if (failCount === 0) {
            setMessage(`✅ تم حفظ جميع الإعدادات! (${successCount} منصة)`);
        } else {
            setMessage(`⚠️ تم حفظ ${successCount}، فشل ${failCount}`);
        }

        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
        fetchPlatforms();
    };

    const addNewPlatform = async () => {
        if (!newPlatform.name) {
            setMessage('❌ يرجى إدخال اسم المنصة');
            return;
        }

        try {
            // ✅ Better platform code generation that handles Arabic
            // Use timestamp + sanitized name to ensure uniqueness
            let platformCode = newPlatform.name
                .replace(/\s/g, '_')
                .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '') // Allow Arabic Unicode range
                .substring(0, 50); // Limit length
            
            // If name is all Arabic, use transliteration or fallback
            if (!platformCode || !/[a-zA-Z0-9]/.test(platformCode)) {
                // Create a code from timestamp and first letters
                platformCode = `PLATFORM_${Date.now()}`;
            }

            const response = await apiClient.post('settings/platforms', {
                platform: platformCode,
                name: newPlatform.name,
                taxRate: parseFloat(newPlatform.taxRate.toString()),
                commission: parseFloat(newPlatform.commission.toString()),
                shippingFee: parseFloat(newPlatform.shippingFee.toString()),
                active: newPlatform.active,
            });

            setPlatforms([...platforms, response.data]);
            setShowAddModal(false);
            setNewPlatform({ name: '', taxRate: 15, commission: 0, shippingFee: 0, active: true });
            setMessage('✅ تم إضافة المنصة بنجاح');
            setTimeout(() => setMessage(''), 3000);
            fetchPlatforms(); // Refresh list
        } catch (error: any) {
            console.error('Add platform error:', error);
            setMessage(`❌ ${error.response?.data?.message || 'فشل الإضافة'}`);
            setTimeout(() => setMessage(''), 5000);
        }
    };


    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                جاري التحميل...
            </div>
        );
    }

    if (platforms.length === 0 && !loading) {
        return (
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header section with Add button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                            <Settings size={28} color="#6366f1" />
                            إعدادات المنصات والضرائب 🚀
                        </h2>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={18} />
                        إضافة منصة جديدة
                    </button>
                </div>

                {message && (
                    <div
                        style={{
                            padding: '12px 16px',
                            marginBottom: '20px',
                            borderRadius: '8px',
                            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                            color: message.includes('✅') ? '#065f46' : '#991b1b',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                    >
                        {message}
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                    <h3 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '8px' }}>لا توجد منصات مضافة</h3>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>قم بإضافة منصة جديدة للبدء</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '12px 24px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        إضافة منصة الآن
                    </button>
                </div>

                {/* Add New Platform Modal (still needs to render) */}
                {showAddModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => setShowAddModal(false)}
                    >
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '28px',
                                width: '90%',
                                maxWidth: '480px',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>إضافة منصة جديدة</h3>

                            {/* Platform Name */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>اسم المنصة</label>
                                <input
                                    type="text"
                                    value={newPlatform.name}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                                    placeholder="مثال: Noon"
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        textAlign: 'right',
                                    }}
                                />
                            </div>

                            {/* Tax and Commission */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                {/* Tax Rate */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>الضريبة (%)</label>
                                    <input
                                        type="number"
                                        value={newPlatform.taxRate}
                                        onChange={(e) => setNewPlatform({ ...newPlatform, taxRate: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            textAlign: 'center',
                                        }}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                {/* Commission */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>العمولة (%)</label>
                                    <input
                                        type="number"
                                        value={newPlatform.commission}
                                        onChange={(e) => setNewPlatform({ ...newPlatform, commission: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            textAlign: 'center',
                                        }}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                {/* ✅ NEW: Shipping Fee */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>شحن (ر.س)</label>
                                    <input
                                        type="number"
                                        value={newPlatform.shippingFee}
                                        onChange={(e) => setNewPlatform({ ...newPlatform, shippingFee: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            textAlign: 'center',
                                        }}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '10px 24px',
                                        background: '#e2e8f0',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={addNewPlatform}
                                    style={{
                                        padding: '10px 24px',
                                        background: '#6366f1',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}
                                >
                                    إضافة
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        <Settings size={28} color="#6366f1" />
                        إعدادات المنصات والضرائب 🚀
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>إدارة معدلات الضرائب والعمولات لكل منصة بيع</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Save All Button */}
                    <button
                        onClick={saveAllPlatforms}
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: loading ? '#94a3b8' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#059669')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#10b981')}
                    >
                        <Save size={18} />
                        {loading ? 'جاري الحفظ...' : 'حفظ الكل'}
                    </button>

                    {/* Add New Platform Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#4f46e5')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#6366f1')}
                    >
                        <Plus size={18} />
                        إضافة منصة جديدة
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    style={{
                        padding: '12px 16px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                        color: message.includes('✅') ? '#065f46' : '#991b1b',
                        fontSize: '14px',
                        fontWeight: 500,
                    }}
                >
                    {message}
                </div>
            )}

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '14px', width: '25%' }}>اسم المنصة</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px', width: '12%' }}>الضريبة (%)</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px', width: '12%' }}>العمولة (%)</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px', width: '12%' }}>شحن المنصة (ر.س)</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px', width: '12%' }}>الحالة</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '14px', width: '27%' }}>إجراءات</th>
                        </tr>
                    </thead>

                    <tbody>
                        {platforms.map((platform, index) => (
                            <tr key={platform.id} style={{ borderBottom: index !== platforms.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                {/* Platform Name */}
                                <td style={{ padding: '16px' }}>
                                    <input
                                        type="text"
                                        value={platform.name}
                                        onChange={(e) => updatePlatform(platform.id, 'name', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            textAlign: 'right',
                                            transition: 'all 0.2s',
                                            color: '#1e293b',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.background = '#f8fafc';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.background = 'white';
                                        }}
                                        placeholder="اسم المنصة"
                                    />
                                </td>

                                {/* Tax Rate */}
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        value={platform.taxRate}
                                        onChange={(e) => updatePlatform(platform.id, 'taxRate', e.target.value)}
                                        style={{
                                            width: '90px',
                                            padding: '10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                        }}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                </td>

                                {/* Commission */}
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        value={platform.commission}
                                        onChange={(e) => updatePlatform(platform.id, 'commission', e.target.value)}
                                        style={{
                                            width: '90px',
                                            padding: '10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                        }}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                </td>

                                {/* ✅ NEW: Shipping Fee */}
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        value={platform.shippingFee}
                                        onChange={(e) => updatePlatform(platform.id, 'shippingFee', e.target.value)}
                                        style={{
                                            width: '90px',
                                            padding: '10px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                        }}
                                        step="0.01"
                                        min="0"
                                    />
                                </td>

                                {/* Active Toggle */}
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={platform.active}
                                            onChange={(e) => updatePlatform(platform.id, 'active', e.target.checked)}
                                            style={{ display: 'none' }}
                                        />
                                        <span
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                background: platform.active ? '#d1fae5' : '#fee2e2',
                                                color: platform.active ? '#065f46' : '#991b1b',
                                                userSelect: 'none',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {platform.active ? '✅ نشط' : '❌ غير نشط'}
                                        </span>
                                    </label>
                                </td>

                                {/* Actions */}
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        {/* Save Button */}
                                        <button
                                            onClick={() => savePlatform(platform)}
                                            style={{
                                                padding: '9px 16px',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
                                        >
                                            <Save size={15} />
                                            حفظ
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deletePlatform(platform.platform, platform.name)}
                                            style={{
                                                padding: '9px 14px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
                                            title="حذف المنصة"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Note */}
            <div
                style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    color: '#1e40af',
                    fontSize: '14px',
                    lineHeight: 1.6,
                }}
            >
                <strong>💡 ملاحظة:</strong> يمكنك تعديل اسم المنصة بالضغط عليه مباشرة. اضغط "حفظ" لحفظ التغييرات، أو "حفظ الكل" لحفظ جميع المنصات دفعة واحدة.
            </div>

            {/* Add New Platform Modal */}
            {showAddModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '28px',
                            width: '90%',
                            maxWidth: '520px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>إضافة منصة جديدة</h3>

                        {/* Platform Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>اسم المنصة</label>
                            <input
                                type="text"
                                value={newPlatform.name}
                                onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                                placeholder="مثال: Noon"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    textAlign: 'right',
                                }}
                            />
                        </div>

                        {/* Tax, Commission, and Shipping Fee */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            {/* Tax Rate */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>الضريبة (%)</label>
                                <input
                                    type="number"
                                    value={newPlatform.taxRate}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, taxRate: parseFloat(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        textAlign: 'center',
                                    }}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            {/* Commission */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>العمولة (%)</label>
                                <input
                                    type="number"
                                    value={newPlatform.commission}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, commission: parseFloat(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        textAlign: 'center',
                                    }}
                                    step="0.01"
                                    min="0"
                                    max="100"
                                />
                            </div>

                            {/* ✅ NEW: Shipping Fee */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>شحن (ر.س)</label>
                                <input
                                    type="number"
                                    value={newPlatform.shippingFee}
                                    onChange={(e) => setNewPlatform({ ...newPlatform, shippingFee: parseFloat(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        textAlign: 'center',
                                    }}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    background: '#e2e8f0',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={addNewPlatform}
                                style={{
                                    padding: '10px 24px',
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                إضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlatformSettings;