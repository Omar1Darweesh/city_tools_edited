import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, Menu, X, Users, Settings, ShoppingCart, Plane, Building2, Tags, BarChart3, ClipboardList, RotateCcw, DollarSign, Shield, Box, Warehouse, Truck, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from './api/client';

// Icon mapping
const iconMap: Record<string, any> = {
    ShoppingCart,
    RotateCcw,
    DollarSign,
    Package,
    Box,
    Warehouse,
    ClipboardList,
    Users,
    Truck,
    UserCog,
    Shield,
    BarChart3,
    LayoutDashboard,
    Plane,
    Building2,
    Tags,
    Settings,
};

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
    const [userPages, setUserPages] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await apiClient.get('/users/profile');
                if (data) {
                    console.log('Profile Refreshed:', data);
                    localStorage.setItem('user', JSON.stringify(data));
                    setUser(data);
                    setUserPages(data.pages || []);
                }
            } catch (e) {
                console.error('Failed to refresh profile', e);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const sections: Record<string, string> = {
        main: 'الرئيسية',
        inventory: 'المخزون',
        transactions: 'المعاملات',
        people: 'الأشخاص',
        admin: 'الإدارة'
    };

    // Build navigation items from user's pages
    const navItems = [
        { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/', section: 'main', key: 'dashboard' },
        ...userPages.map(page => ({
            icon: iconMap[page.icon] || Package,
            label: page.nameAr,
            path: page.route,
            section: page.category,
            key: page.key
        })),
        // ✅ Add Cost Verification manually
        { icon: DollarSign, label: 'التحقق من التكلفة', path: '/products/cost-verification', section: 'inventory', key: 'cost-verification' }
    ];

    // Group by section
    const groupedItems = navItems.reduce((acc: any, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>
            {/* Sidebar */}
            <div style={{
                width: sidebarOpen ? '280px' : '0',
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                transition: 'width 0.3s',
                overflow: 'hidden',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>
                        نظام الإدارة
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '5px 0 0' }}>
                        {user.fullName || 'مستخدم'}
                    </p>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '15px 0' }}>
                    {Object.entries(groupedItems).map(([section, items]: [string, any]) => (
                        <div key={section} style={{ marginBottom: '20px' }}>
                            <div style={{ padding: '0 20px', marginBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                                    {sections[section] || section}
                                </span>
                            </div>
                            {items.map((item: any) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 20px',
                                            color: isActive ? 'white' : '#cbd5e1',
                                            textDecoration: 'none',
                                            background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                                            transition: 'all 0.2s',
                                            fontSize: '14px',
                                            fontWeight: isActive ? '600' : '400'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = 'white';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#cbd5e1';
                                            }
                                        }}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            justifyContent: 'center'
                        }}
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Bar */}
                <div style={{
                    background: 'white',
                    padding: '15px 30px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                            الفرع: {user.branch?.name || 'غير محدد'}
                        </span>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
