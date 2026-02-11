import { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, ShoppingBag, DollarSign, Package, Users,
    Calendar, Download, RefreshCw, FileText, Target, AlertTriangle,
    TrendingDown, Activity, PieChart
} from 'lucide-react';
import apiClient from '../api/client';

// @ts-ignore - jspdf-autotable types
import type jsPDF from 'jspdf';

// Types
interface DateRange {
    startDate: string;
    endDate: string;
    label: string;
}

interface DashboardMetrics {
    sales: {
        totalRevenue: number;
        orderCount: number;
        averageOrderValue: number;
        totalReturns: number;
        netSales: number;
    };
    financial: {
        grossProfit: number;
        profitMargin: number;
        totalCost: number;
        totalTax: number;
        totalCommission: number;
        netProfit: number;
    };
    inventory: {
        totalStockValue: number;
        lowStockCount: number;
        outOfStockCount: number;
        totalProducts: number;
    };
    performance: {
        topProducts: Array<{
            productName: string;
            quantity: number;
            revenue: number;
            profit: number;
        }>;
        salesByChannel: Array<{
            channel: string;
            channelName: string;
            total: number;
            count: number;
            percentage: number;
        }>;
        salesByPayment: Array<{
            method: string;
            total: number;
            count: number;
        }>;
        salesByCategory: Array<{
            name: string;
            total: number;
            count: number;
        }>;
        hourlyStats: Array<{
            hour: string;
            total: number;
            count: number;
        }>;
    };
    // NEW: Enhanced analytics sections
    customers?: {
        totalCustomers: number;
        customersByType: Array<{ type: string; count: number }>;
        topCustomers: Array<{
            customerId: number;
            name: string;
            type: string;
            totalRevenue: number;
            orderCount: number;
        }>;
        registeredSales: number;
        walkInSales: number;
    };
    returns?: {
        totalReturnsValue: number;
        totalReturnsCount: number;
        returnRate: number;
        returnsByType: Array<{
            type: string;
            count: number;
            qty: number;
            value: number;
        }>;
        topReturnedProducts: Array<{
            productId: number;
            productName: string;
            qtyReturned: number;
            refundAmount: number;
        }>;
    };
    trends?: {
        dailySales: Array<{
            date: string;
            total: number;
            count: number;
            profit: number;
        }>;
    };
    profitByCategory?: Array<{
        category: string;
        revenue: number;
        cost: number;
        profit: number;
        qty: number;
        margin: number;
    }>;
    comparison?: {
        current: { revenue: number; profit: number; orders: number };
        previous: { revenue: number; profit: number; orders: number };
        changes: {
            revenueChange: number;
            profitChange: number;
            orderChange: number;
            revenueDirection: 'up' | 'down' | 'same';
            profitDirection: 'up' | 'down' | 'same';
            orderDirection: 'up' | 'down' | 'same';
        };
    } | null;
}

// ✅ NEW: Platform Sales Details Interface
interface PlatformSalesDetails {
    dateRange: {
        startDate: string | null;
        endDate: string | null;
    };
    summary: {
        grossRevenue: number;
        netRevenue: number;
        refunded: number;
        commission: number;
        tax: number;
        costOfGoods: number;
        grossProfit: number;
        netProfit: number;
        orderCount: number;
        shippingFee: number;
        avgProfitMargin: number;
        avgOrderValue: number;
    };
    platforms: Array<{
        platform: string;
        platformName: string;
        platformIcon: string;
        grossRevenue: number;
        netRevenue: number;
        refunded: number;
        refundRate: number;
        costOfGoods: number;
        commission: number;
        tax: number;
        shippingFee: number;
        grossProfit: number;
        netProfit: number;
        profitMargin: number;
        netProfitMargin: number;
        orderCount: number;
        avgOrderValue: number;
        avgProfit: number;
        actualCommissionRate: number;
        configuredCommissionRate: number;
        actualTaxRate: number;
        configuredTaxRate: number;
        revenuePercentage: number;
        profitPercentage: number;
        orderPercentage: number;
        isConfigured: boolean;
        isActive: boolean;
    }>;
    platformCount: number;
    comparison: {
        currentPeriod: any;
        previousPeriod: any;
        platformChanges: Array<{
            platform: string;
            revenueChange: number;
            profitChange: number;
            orderChange: number;
            isNew: boolean;
        }>;
    } | null;
}

// Helper to format date as YYYY-MM-DD in local time
const formatDate = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

function getToday(): DateRange {
    const today = formatDate(new Date());
    return { startDate: today, endDate: today, label: 'اليوم' };
}

function getYesterday(): DateRange {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = formatDate(yesterday);
    return { startDate: date, endDate: date, label: 'أمس' };
}

function getThisWeek(): DateRange {
    const today = new Date();
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay());
    return {
        startDate: formatDate(firstDay),
        endDate: formatDate(new Date()),
        label: 'هذا الأسبوع'
    };
}

function getThisMonth(): DateRange {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
        startDate: formatDate(firstDay),
        endDate: formatDate(today),
        label: 'هذا الشهر'
    };
}

export default function Reports() {
    const [dateRange, setDateRange] = useState<DateRange>(getToday());
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'financial' | 'inventory'>('overview');
    const [showCustomDateRange, setShowCustomDateRange] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    // ✅ NEW: Platform sales state
    const [platformSales, setPlatformSales] = useState<PlatformSalesDetails | null>(null);
    const [loadingPlatformSales, setLoadingPlatformSales] = useState(false);

    useEffect(() => {
        fetchReports();
        fetchPlatformSales(); // ✅ Fetch platform sales when date changes
    }, [dateRange]);

    const handleCustomDateRange = () => {
        if (customStartDate && customEndDate) {
            setDateRange({
                startDate: customStartDate,
                endDate: customEndDate,
                label: 'تاريخ مخصص'
            });
            setShowCustomDateRange(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const branchId = user.branchId || 1;

            // Convert YYYY-MM-DD to local start/end ISO strings to ensure timezone accuracy
            const getLocalISO = (dateStr: string, isEnd = false) => {
                const parts = dateStr.split('-').map(Number);
                const date = new Date(parts[0], parts[1] - 1, parts[2]);
                if (isEnd) {
                    date.setHours(23, 59, 59, 999);
                } else {
                    date.setHours(0, 0, 0, 0);
                }
                // We need the absolute instant that corresponds to this local time
                // toISOString() uses UTC. 
                // Example: Local 00:00 (+02) -> UTC 22:00 (prev day)
                // This is EXACTLY what the backend needs to filter correctly against stored UTC timestamps
                return date.toISOString();
            };

            const response = await apiClient.get('/reports/enhanced', {
                params: {
                    startDate: getLocalISO(dateRange.startDate),
                    endDate: getLocalISO(dateRange.endDate, true),
                    branchId
                }
            });

            setMetrics(response.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            setMetrics({
                sales: {
                    totalRevenue: 0,
                    orderCount: 0,
                    averageOrderValue: 0,
                    totalReturns: 0,
                    netSales: 0
                },
                financial: {
                    grossProfit: 0,
                    profitMargin: 0,
                    totalCost: 0,
                    totalTax: 0,
                    totalCommission: 0,
                    netProfit: 0
                },
                inventory: {
                    totalStockValue: 0,
                    lowStockCount: 0,
                    outOfStockCount: 0,
                    totalProducts: 0
                },
                performance: {
                    topProducts: [],
                    salesByChannel: [],
                    salesByPayment: [],
                    salesByCategory: [],
                    hourlyStats: []
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Fetch Platform Sales Details
    const fetchPlatformSales = async () => {
        setLoadingPlatformSales(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const branchId = user.branchId || 1;

            const getLocalISO = (dateStr: string, isEnd = false) => {
                const parts = dateStr.split('-').map(Number);
                const date = new Date(parts[0], parts[1] - 1, parts[2]);
                if (isEnd) {
                    date.setHours(23, 59, 59, 999);
                } else {
                    date.setHours(0, 0, 0, 0);
                }
                return date.toISOString();
            };

            const response = await apiClient.get('/reports/platform-sales', {
                params: {
                    startDate: getLocalISO(dateRange.startDate),
                    endDate: getLocalISO(dateRange.endDate, true),
                    branchId,
                    includeComparison: 'true'
                }
            });

            setPlatformSales(response.data);
        } catch (error) {
            console.error('Failed to fetch platform sales:', error);
            setPlatformSales(null);
        } finally {
            setLoadingPlatformSales(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (!metrics) return;

        if (format === 'pdf') {
            // @ts-ignore
            const jsPDF = (await import('jspdf')).default;
            // @ts-ignore
            const html2canvas = (await import('html2canvas')).default;

            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '0';
            element.style.width = '800px';
            element.style.padding = '40px';
            element.style.background = 'white';
            element.style.direction = 'rtl';
            element.style.fontFamily = 'Inter, system-ui, sans-serif';

            element.innerHTML = `
                <div style="margin-bottom: 40px; text-align: center; border-bottom: 4px solid #667eea; padding-bottom: 20px;">
                    <h1 style="color: #667eea; font-size: 32px; margin-bottom: 10px;">تقرير المبيعات الشامل</h1>
                    <p style="color: #64748b; font-size: 16px;">الفترة: ${dateRange.startDate} - ${dateRange.endDate}</p>
                    <p style="color: #94a3b8; font-size: 14px;">تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}</p>
                </div>

                <!-- 1. EXECUTIVE SUMMARY -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1e293b; border-right: 4px solid #667eea; padding-right: 15px; margin-bottom: 20px; font-size: 20px;">الملخص التنفيذي</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <tr style="background: #f8fafc;">
                            <th style="text-align: right; padding: 12px; border: 1px solid #e2e8f0; width: 60%;">المؤشر</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">القيمة</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">إجمالي الإيرادات</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${metrics.sales.totalRevenue.toFixed(2)} ر.س</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">عدد الفواتير</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.sales.orderCount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">المرتجعات</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444;">${metrics.sales.totalReturns.toFixed(2)} ر.س</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: 600;">صافي المبيعات</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${metrics.sales.netSales.toFixed(2)} ر.س</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">إجمالي الربح</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.financial.grossProfit.toFixed(2)} ر.س</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">هامش الربح</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.financial.profitMargin.toFixed(1)}%</td>
                        </tr>
                        <tr style="background: #f0fdf4;">
                            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: 800;">صافي الربح النهائي</td>
                            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #15803d; font-weight: 800; font-size: 16px;">${metrics.financial.netProfit.toFixed(2)} ر.س</td>
                        </tr>
                    </table>
                </div>

                <!-- 2. EXPENSE BREAKDOWN -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1e293b; border-right: 4px solid #ef4444; padding-right: 15px; margin-bottom: 20px; font-size: 20px;">تحليل المصروفات</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fef2f2;">
                            <th style="text-align: right; padding: 12px; border: 1px solid #e2e8f0;">نوع المصروف</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">المبلغ</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">النسبة</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">تكلفة البضاعة</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.financial.totalCost.toFixed(2)} ر.س</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${((metrics.financial.totalCost / metrics.sales.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">الضرائب</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.financial.totalTax.toFixed(2)} ر.س</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${((metrics.financial.totalTax / metrics.sales.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">العمولات والرسوم</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.financial.totalCommission.toFixed(2)} ر.س</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${((metrics.financial.totalCommission / metrics.sales.totalRevenue) * 100 || 0).toFixed(1)}%</td>
                        </tr>
                    </table>
                </div>

                <!-- 3. SALES BY CHANNEL -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1e293b; border-right: 4px solid #f59e0b; padding-right: 15px; margin-bottom: 20px; font-size: 20px;">المبيعات حسب القناة</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #fffbeb;">
                            <th style="text-align: right; padding: 12px; border: 1px solid #e2e8f0;">القناة</th>
                            <th style="text-align: center; padding: 12px; border: 1px solid #e2e8f0;">العدد</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">الإجمالي</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">النسبة</th>
                        </tr>
                        ${metrics.performance.salesByChannel.map(ch => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${ch.channelName || ch.channel}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${ch.count}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${ch.total.toFixed(2)} ر.س</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${ch.percentage.toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <!-- 4. TOP PRODUCTS -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1e293b; border-right: 4px solid #10b981; padding-right: 15px; margin-bottom: 20px; font-size: 20px;">أكثر المنتجات مبيعاً</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f0fdf4;">
                            <th style="text-align: right; padding: 12px; border: 1px solid #e2e8f0;">المنتج</th>
                            <th style="text-align: center; padding: 12px; border: 1px solid #e2e8f0;">الكمية</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">الإيراد</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">الربح</th>
                        </tr>
                        ${metrics.performance.topProducts.slice(0, 10).map(p => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${p.productName}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${p.quantity}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${p.revenue.toFixed(2)}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; color: #059669;">${p.profit.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <!-- 5. PAYMENT METHODS -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1e293b; border-right: 4px solid #8b5cf6; padding-right: 15px; margin-bottom: 20px; font-size: 20px;">طرق الدفع</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f5f3ff;">
                            <th style="text-align: right; padding: 12px; border: 1px solid #e2e8f0;">الطريقة</th>
                            <th style="text-align: center; padding: 12px; border: 1px solid #e2e8f0;">عدد العمليات</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">الإجمالي</th>
                        </tr>
                        ${metrics.performance.salesByPayment.map(pm => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${pm.method}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${pm.count}</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0;">${pm.total.toFixed(2)} ر.س</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <!-- 6. INVENTORY SUMMARY -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1e293b; border-right: 4px solid #06b6d4; padding-right: 15px; margin-bottom: 20px; font-size: 20px;">مخلص المخزون</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #ecfeff;">
                            <th style="text-align: right; padding: 12px; border: 1px solid #e2e8f0; width: 60%;">البيان</th>
                            <th style="text-align: left; padding: 12px; border: 1px solid #e2e8f0;">القيمة</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">إجمالي قيمة المخزون</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${metrics.inventory.totalStockValue.toFixed(2)} ر.س</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">إجمالي عدد المنتجات</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">${metrics.inventory.totalProducts}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">منتجات مخزونها منخفض</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #f59e0b;">${metrics.inventory.lowStockCount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">منتجات نفذت من المخزون</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #ef4444;">${metrics.inventory.outOfStockCount}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    نظام الإدارة المتكامل - سحلة
                </div>
            `;

            document.body.appendChild(element);

            try {
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save(`sales-report-${dateRange.startDate}-${dateRange.endDate}.pdf`);
            } catch (err) {
                console.error('PDF Generation Error:', err);
                alert('حدث خطأ أثناء إنشاء الملف');
            } finally {
                document.body.removeChild(element);
            }

        } else {
            // Excel export
            // @ts-ignore
            const XLSX = await import('xlsx');

            const wb = XLSX.utils.book_new();

            // === SUMMARY SHEET ===
            const summaryData = [
                ['تقرير المبيعات الشامل'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [`تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}`],
                [],
                ['البيان', 'القيمة', 'ملاحظات'],
                ['إجمالي الإيرادات', metrics.sales.totalRevenue.toFixed(2), 'ر.س'],
                ['عدد الفواتير', metrics.sales.orderCount, 'فاتورة'],
                ['متوسط الفاتورة', metrics.sales.averageOrderValue.toFixed(2), 'ر.س'],
                ['المرتجعات', metrics.sales.totalReturns.toFixed(2), 'ر.س'],
                ['صافي المبيعات', metrics.sales.netSales.toFixed(2), 'ر.س'],
                [],
                ['البيانات المالية', '', ''],
                ['التكلفة الإجمالية', metrics.financial.totalCost.toFixed(2), `${((metrics.financial.totalCost / metrics.sales.totalRevenue) * 100).toFixed(1)}% من الإيرادات`],
                ['إجمالي الربح', metrics.financial.grossProfit.toFixed(2), 'ر.س'],
                ['هامش الربح', `${metrics.financial.profitMargin.toFixed(1)}%`, 'نسبة مئوية'],
                ['الضرائب المحصلة', metrics.financial.totalTax.toFixed(2), `${((metrics.financial.totalTax / metrics.sales.totalRevenue) * 100).toFixed(1)}%`],
                ['العمولات والرسوم', metrics.financial.totalCommission.toFixed(2), `${((metrics.financial.totalCommission / metrics.sales.totalRevenue) * 100).toFixed(1)}%`],
                ['صافي الربح النهائي', metrics.financial.netProfit.toFixed(2), 'ر.س'],
                [],
                ['المخزون', '', ''],
                ['قيمة المخزون الإجمالية', metrics.inventory.totalStockValue.toFixed(2), 'ر.س'],
                ['عدد المنتجات', metrics.inventory.totalProducts, 'منتج'],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            ws1['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 30 }];
            XLSX.utils.book_append_sheet(wb, ws1, 'الملخص التنفيذي');

            // === EXPENSE BREAKDOWN SHEET ===
            const expenseData = [
                ['تفصيل المصروفات والضرائب'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['نوع المصروف', 'المبلغ (ر.س)', '% من الإيرادات', '% من الربح الإجمالي', 'تفاصيل'],
                [
                    'تكلفة البضاعة المباعة (COGS)',
                    metrics.financial.totalCost.toFixed(2),
                    ((metrics.financial.totalCost / metrics.sales.totalRevenue) * 100).toFixed(2),
                    ((metrics.financial.totalCost / (metrics.financial.grossProfit + metrics.financial.totalCost || 1)) * 100).toFixed(2),
                    'التكلفة المباشرة للمنتجات'
                ],
                [
                    'الضرائب المحصلة',
                    metrics.financial.totalTax.toFixed(2),
                    ((metrics.financial.totalTax / metrics.sales.totalRevenue) * 100).toFixed(2),
                    ((metrics.financial.totalTax / (metrics.financial.grossProfit || 1)) * 100).toFixed(2),
                    'ضريبة القيمة المضافة والضرائب الأخرى'
                ],
                [
                    'العمولات والرسوم',
                    metrics.financial.totalCommission.toFixed(2),
                    ((metrics.financial.totalCommission / metrics.sales.totalRevenue) * 100).toFixed(2),
                    ((metrics.financial.totalCommission / (metrics.financial.grossProfit || 1)) * 100).toFixed(2),
                    'عمولات المنصات والقنوات'
                ],
                [],
                ['إجمالي المصروفات', (metrics.financial.totalCost + metrics.financial.totalTax + metrics.financial.totalCommission).toFixed(2), (((metrics.financial.totalCost + metrics.financial.totalTax + metrics.financial.totalCommission) / metrics.sales.totalRevenue) * 100).toFixed(2), '', ''],
                ['صافي الربح بعد المصروفات', metrics.financial.netProfit.toFixed(2), ((metrics.financial.netProfit / metrics.sales.totalRevenue) * 100).toFixed(2), '100%', 'الربح النهائي'],
            ];
            const ws1a = XLSX.utils.aoa_to_sheet(expenseData);
            ws1a['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 35 }];
            XLSX.utils.book_append_sheet(wb, ws1a, 'تفصيل المصروفات');

            // === SALES BY CHANNEL SHEET ===
            const channelData = [
                ['تحليل المبيعات حسب القناة'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['القناة', 'عدد الفواتير', 'إجمالي المبيعات (ر.س)', 'النسبة %', 'متوسط الفاتورة', 'أعلى فاتورة', 'أقل فاتورة'],
                ...metrics.performance.salesByChannel.map(ch => [
                    ch.channelName || ch.channel,
                    ch.count,
                    ch.total.toFixed(2),
                    ch.percentage.toFixed(1),
                    (ch.total / ch.count).toFixed(2),
                    '-',
                    '-'
                ]),
                [],
                ['الإجمالي', metrics.sales.orderCount, metrics.sales.totalRevenue.toFixed(2), '100%', metrics.sales.averageOrderValue.toFixed(2), '', '']
            ];
            const ws2 = XLSX.utils.aoa_to_sheet(channelData);
            ws2['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
            XLSX.utils.book_append_sheet(wb, ws2, 'المبيعات حسب القناة');

            // === TOP PRODUCTS SHEET ===
            const productData = [
                ['تحليل أفضل المنتجات'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['المنتج', 'الكمية المباعة', 'الإيرادات (ر.س)', 'التكلفة المتوقعة', 'الربح (ر.س)', 'هامش الربح %', 'سعر الوحدة', 'تصنيف الأداء'],
                ...metrics.performance.topProducts.map((p, idx) => [
                    p.productName,
                    p.quantity,
                    p.revenue.toFixed(2),
                    (p.revenue - p.profit).toFixed(2),
                    p.profit.toFixed(2),
                    ((p.profit / (p.revenue || 1)) * 100).toFixed(1),
                    (p.revenue / (p.quantity || 1)).toFixed(2),
                    idx < 3 ? 'ممتاز ⭐' : idx < 7 ? 'جيد ✓' : 'متوسط'
                ]),
                [],
                ['الإجمالي', metrics.performance.topProducts.reduce((sum, p) => sum + p.quantity, 0), metrics.performance.topProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2), '', metrics.performance.topProducts.reduce((sum, p) => sum + p.profit, 0).toFixed(2), '', '', '']
            ];
            const ws3 = XLSX.utils.aoa_to_sheet(productData);
            ws3['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, ws3, 'أفضل المنتجات');

            // === PAYMENT METHODS SHEET ===
            const paymentData = [
                ['تفصيل طرق الدفع'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['طريقة الدفع', 'عدد العمليات', 'إجمالي المبلغ (ر.س)', 'النسبة من الإجمالي %', 'متوسط العملية', 'الحد الأقصى', 'الحد الأدنى'],
                ...metrics.performance.salesByPayment.map(pm => [
                    pm.method,
                    pm.count,
                    pm.total.toFixed(2),
                    ((pm.total / metrics.sales.totalRevenue) * 100).toFixed(1),
                    (pm.total / pm.count).toFixed(2),
                    '-',
                    '-'
                ]),
                [],
                ['الإجمالي', metrics.performance.salesByPayment.reduce((sum, pm) => sum + pm.count, 0), metrics.sales.totalRevenue.toFixed(2), '100%', '', '', '']
            ];
            const ws4 = XLSX.utils.aoa_to_sheet(paymentData);
            ws4['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 22 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, ws4, 'طرق الدفع');

            // === SALES BY CATEGORY SHEET ===
            const categoryData = [
                ['مبيعات الأقسام (التصنيفات)'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['القسم', 'عدد القطع المباعة', 'إجمالي المبيعات (ر.س)', 'متوسط سعر القطعة', 'النسبة من الإجمالي %'],
                ...(metrics.performance.salesByCategory || []).map(cat => [
                    cat.name,
                    cat.count,
                    cat.total.toFixed(2),
                    (cat.total / (cat.count || 1)).toFixed(2),
                    metrics.sales.totalRevenue > 0 ? ((cat.total / metrics.sales.totalRevenue) * 100).toFixed(1) + '%' : '0%'
                ]),
                [],
                ['الإجمالي', (metrics.performance.salesByCategory || []).reduce((sum, c) => sum + c.count, 0), (metrics.performance.salesByCategory || []).reduce((sum, c) => sum + c.total, 0).toFixed(2), '', '100%']
            ];
            const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
            wsCategory['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, wsCategory, 'مبيعات الأقسام');

            // === HOURLY STATS SHEET ===
            const hourlyData = [
                ['تحليل المبيعات بالساعة'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['الساعة', 'عدد الفواتير', 'إجمالي المبيعات (ر.س)', 'متوسط الفاتورة', 'نشاط الساعة'],
                ...(metrics.performance.hourlyStats || []).map(h => [
                    h.hour,
                    h.count,
                    h.total.toFixed(2),
                    h.count > 0 ? (h.total / h.count).toFixed(2) : '0.00',
                    h.count > 0 ? 'نشطة' : '-'
                ]),
                [],
                ['الإجمالي', (metrics.performance.hourlyStats || []).reduce((sum, h) => sum + h.count, 0), (metrics.performance.hourlyStats || []).reduce((sum, h) => sum + h.total, 0).toFixed(2), '', '']
            ];
            const wsHourly = XLSX.utils.aoa_to_sheet(hourlyData);
            wsHourly['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, wsHourly, 'النشاط بالساعة');

            // === INVENTORY SHEET ===
            const inventoryData = [
                ['ملخص وتحليل المخزون'],
                [`تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`],
                [],
                ['بيان المخزون', 'القيمة', 'النسبة %', 'ملاحظات'],
                ['إجمالي قيمة المخزون', `${metrics.inventory.totalStockValue.toFixed(2)} ر.س`, '100%', 'القيمة الإجمالية للمخزون الحالي'],
                ['إجمالي عدد المنتجات', metrics.inventory.totalProducts.toString(), '100%', 'عدد المنتجات المختلفة'],
                [],
                ['حالة المخزون', '', '', ''],
                ['المخزون الصحي', (metrics.inventory.totalProducts - metrics.inventory.lowStockCount - metrics.inventory.outOfStockCount).toString(), ((((metrics.inventory.totalProducts - metrics.inventory.lowStockCount - metrics.inventory.outOfStockCount) / metrics.inventory.totalProducts) * 100).toFixed(1)), 'متوفر بكميات كافية ✓'],
                ['المخزون المنخفض', metrics.inventory.lowStockCount.toString(), (((metrics.inventory.lowStockCount / metrics.inventory.totalProducts) * 100).toFixed(1)), 'يحتاج إلى تعبئة ⚠'],
                ['نفذ من المخزون', metrics.inventory.outOfStockCount.toString(), (((metrics.inventory.outOfStockCount / metrics.inventory.totalProducts) * 100).toFixed(1)), 'غير متوفر ❌'],
                [],
                ['التنبيهات والإجراءات', '', '', ''],
                ['عدد المنتجات المطلوب تعبئتها', (metrics.inventory.lowStockCount + metrics.inventory.outOfStockCount).toString(), '', 'إجمالي المنتجات التي تحتاج اهتمام'],
                ['نسبة الصحة العامة للمخزون', `${(((metrics.inventory.totalProducts - metrics.inventory.lowStockCount - metrics.inventory.outOfStockCount) / metrics.inventory.totalProducts) * 100).toFixed(1)}%`, '', metrics.inventory.lowStockCount === 0 && metrics.inventory.outOfStockCount === 0 ? 'ممتاز ⭐⭐⭐' : metrics.inventory.lowStockCount < 5 ? 'جيد ✓' : 'يحتاج تحسين ⚠'],
            ];
            const ws5 = XLSX.utils.aoa_to_sheet(inventoryData);
            ws5['!cols'] = [{ wch: 35 }, { wch: 22 }, { wch: 15 }, { wch: 35 }];
            XLSX.utils.book_append_sheet(wb, ws5, 'تحليل المخزون');

            // === FINANCIAL RATIOS SHEET ===
            const ratiosData = [
                ['النسب والمؤشرات المالية'],
                [`الفترة: ${dateRange.startDate} إلى ${dateRange.endDate}`],
                [],
                ['المؤشر المالي', 'القيمة', 'المعيار', 'الحالة'],
                ['هامش الربح الإجمالي', `${metrics.financial.profitMargin.toFixed(1)}%`, '> 20%', metrics.financial.profitMargin > 20 ? 'جيد ✓' : 'يحتاج تحسين'],
                ['هامش الربح الصافي', `${((metrics.financial.netProfit / metrics.sales.totalRevenue) * 100).toFixed(1)}%`, '> 10%', ((metrics.financial.netProfit / metrics.sales.totalRevenue) * 100) > 10 ? 'جيد ✓' : 'منخفض'],
                ['نسبة التكلفة إلى الإيرادات', `${((metrics.financial.totalCost / metrics.sales.totalRevenue) * 100).toFixed(1)}%`, '< 70%', ((metrics.financial.totalCost / metrics.sales.totalRevenue) * 100) < 70 ? 'جيد ✓' : 'مرتفع'],
                ['نسبة الضرائب', `${((metrics.financial.totalTax / metrics.sales.totalRevenue) * 100).toFixed(1)}%`, '', 'معلومات'],
                ['نسبة العمولات', `${((metrics.financial.totalCommission / metrics.sales.totalRevenue) * 100).toFixed(1)}%`, '< 10%', ((metrics.financial.totalCommission / metrics.sales.totalRevenue) * 100) < 10 ? 'جيد ✓' : 'مرتفع'],
                ['متوسط قيمة الفاتورة', `${metrics.sales.averageOrderValue.toFixed(2)} ر.س`, '', 'معلومات'],
                ['معدل دوران المخزون', `${((metrics.sales.totalRevenue / metrics.inventory.totalStockValue) || 0).toFixed(2)} مرة`, '> 4', 'معلومات'],
            ];
            const ws6 = XLSX.utils.aoa_to_sheet(ratiosData);
            ws6['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 15 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws6, 'النسب المالية');

            XLSX.writeFile(wb, `sales-report-${dateRange.startDate}-${dateRange.endDate}.xlsx`);
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, color, subtitle }: any) => (
        <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>{title}</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{value}</div>
                    {subtitle && <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{subtitle}</div>}
                </div>
                <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                }}>
                    <Icon size={24} color={color} strokeWidth={2.5} />
                </div>
            </div>
            {change !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: change >= 0 ? '#dcfce7' : '#fee2e2',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: change >= 0 ? '#16a34a' : '#dc2626'
                    }}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>مقارنة بالفترة السابقة</span>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <RefreshCw size={48} color="#6366f1" className="spin" />
                <p style={{ marginTop: '16px', fontSize: '16px', color: '#64748b' }}>جاري تحميل التقارير...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '32px',
                color: 'white',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <BarChart3 size={36} />
                            لوحة التقارير والتحليلات
                        </h1>
                        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
                            تحليل شامل لأداء النظام من {dateRange.startDate} إلى {dateRange.endDate}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => handleExport('excel')}
                            style={{
                                padding: '12px 20px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            <FileText size={18} /> Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            style={{
                                padding: '12px 20px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#667eea',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: '700',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'}
                        >
                            <Download size={18} /> تصدير PDF
                        </button>
                    </div>
                </div>

                {/* Date Filter Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                        { fn: getToday, label: 'اليوم' },
                        { fn: getYesterday, label: 'أمس' },
                        { fn: getThisWeek, label: 'هذا الأسبوع' },
                        { fn: getThisMonth, label: 'هذا الشهر' }
                    ].map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setDateRange(preset.fn())}
                            style={{
                                padding: '10px 18px',
                                background: dateRange.label === preset.label
                                    ? 'rgba(255, 255, 255, 0.95)'
                                    : 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '10px',
                                color: dateRange.label === preset.label ? '#667eea' : 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Calendar size={16} />
                            {preset.label}
                        </button>
                    ))}
                    <button
                        onClick={fetchReports}
                        style={{
                            padding: '10px 18px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <RefreshCw size={16} />
                        تحديث
                    </button>
                    <button
                        onClick={() => setShowCustomDateRange(!showCustomDateRange)}
                        style={{
                            padding: '10px 18px',
                            background: showCustomDateRange
                                ? 'rgba(255, 255, 255, 0.95)'
                                : 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '10px',
                            color: showCustomDateRange ? '#667eea' : 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Calendar size={16} />
                        تاريخ مخصص
                    </button>
                </div>

                {/* Custom Date Range Picker */}
                {showCustomDateRange && (
                    <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    opacity: 0.9
                                }}>
                                    من تاريخ
                                </label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        fontSize: '14px',
                                        color: '#667eea',
                                        fontWeight: '600'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    opacity: 0.9
                                }}>
                                    إلى تاريخ
                                </label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        fontSize: '14px',
                                        color: '#667eea',
                                        fontWeight: '600'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleCustomDateRange}
                                disabled={!customStartDate || !customEndDate}
                                style={{
                                    padding: '10px 20px',
                                    background: customStartDate && customEndDate
                                        ? 'rgba(255, 255, 255, 0.95)'
                                        : 'rgba(255, 255, 255, 0.3)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#667eea',
                                    cursor: customStartDate && customEndDate ? 'pointer' : 'not-allowed',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                تطبيق
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                background: 'white',
                padding: '8px',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                {[
                    { id: 'overview', label: 'نظرة عامة', icon: Activity },
                    { id: 'sales', label: 'المبيعات', icon: TrendingUp },
                    { id: 'financial', label: 'التحليل المالي', icon: DollarSign },
                    { id: 'inventory', label: 'المخزون', icon: Package }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            flex: 1,
                            padding: '14px 20px',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && metrics && (
                <>
                    {/* KPI Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px'
                    }}>
                        <StatCard
                            title="إجمالي المبيعات"
                            value={`${metrics.sales.totalRevenue.toFixed(2)} ر.س`}
                            subtitle={`${metrics.sales.orderCount} فاتورة`}
                            icon={DollarSign}
                            color="#10b981"
                            change={metrics.comparison?.changes.revenueChange}
                        />
                        <StatCard
                            title="صافي الربح"
                            value={`${metrics.financial.netProfit.toFixed(2)} ر.س`}
                            subtitle={`هامش ${metrics.financial.profitMargin.toFixed(1)}%`}
                            icon={TrendingUp}
                            color="#6366f1"
                            change={metrics.comparison?.changes.profitChange}
                        />
                        <StatCard
                            title="قيمة المخزون"
                            value={`${metrics.inventory.totalStockValue.toFixed(2)} ر.س`}
                            subtitle={`${metrics.inventory.totalProducts} منتج`}
                            icon={Package}
                            color="#f59e0b"
                        />
                        <StatCard
                            title="متوسط الفاتورة"
                            value={`${metrics.sales.averageOrderValue.toFixed(2)} ر.س`}
                            subtitle="لكل عملية بيع"
                            icon={Target}
                            color="#8b5cf6"
                            change={metrics.comparison?.changes.orderChange}
                        />
                    </div>

                    {/* Charts Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                        {/* Top Products */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <ShoppingBag size={24} color="#6366f1" />
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>أكثر المنتجات مبيعاً</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {metrics.performance.topProducts.slice(0, 5).map((product, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        background: '#f8fafc',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                                {product.productName}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                الكمية: {product.quantity}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: '#10b981', fontSize: '15px' }}>
                                                {product.revenue.toFixed(2)} ر.س
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6366f1' }}>
                                                ربح: {product.profit.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sales by Channel */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <PieChart size={24} color="#f59e0b" />
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>المبيعات حسب القناة</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {metrics.performance.salesByChannel.map((channel, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{channel.channelName || channel.channel}</span>
                                            <span style={{ fontWeight: '700', color: '#6366f1' }}>
                                                {channel.total.toFixed(2)} ر.س ({channel.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '8px',
                                            background: '#e2e8f0',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(channel.percentage, 100)}%`,
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            {channel.count} فاتورة
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ✅ NEW: Detailed Platform Sales Section */}
                    {platformSales && platformSales.platforms.length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                            {/* Section Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                color: 'white',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <Activity size={28} />
                                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>تحليل المبيعات التفصيلي حسب المنصات</h2>
                                        </div>
                                        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                            {platformSales.platformCount} منصة نشطة • {platformSales.summary.orderCount} فاتورة
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                                            {platformSales.summary.netRevenue.toFixed(2)} ر.س
                                        </div>
                                        <div style={{ fontSize: '13px', opacity: 0.9 }}>صافي الإيرادات</div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: '2px solid #10b981'
                                }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>إجمالي الربح</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                                        {platformSales.summary.grossProfit.toFixed(2)} ر.س
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                        هامش {platformSales.summary.avgProfitMargin.toFixed(1)}%
                                    </div>
                                </div>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: '2px solid #6366f1'
                                }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>صافي الربح</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#6366f1' }}>
                                        {platformSales.summary.netProfit.toFixed(2)} ر.س
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                        بعد العمولات والضرائب
                                    </div>
                                </div>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: '2px solid #f59e0b'
                                }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>إجمالي العمولات</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                                        {platformSales.summary.commission.toFixed(2)} ر.س
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                        رسوم المنصات
                                    </div>
                                </div>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    border: '2px solid #ef4444'
                                }}>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>المرتجعات</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                                        {platformSales.summary.refunded.toFixed(2)} ر.س
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                        من {platformSales.summary.grossRevenue.toFixed(2)} ر.س
                                    </div>
                                </div>
                            </div>

                            {/* Platform Cards */}
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {platformSales.platforms.map((platform, index) => {
                                    const change = platformSales.comparison?.platformChanges.find(
                                        c => c.platform === platform.platform
                                    );
                                    
                                    return (
                                        <div key={platform.platform} style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            border: index === 0 ? '2px solid #667eea' : '1px solid #e2e8f0',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            {index === 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    padding: '6px 16px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    borderBottomLeftRadius: '12px'
                                                }}>
                                                    الأعلى أداءً 🏆
                                                </div>
                                            )}

                                            {/* Platform Header */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{
                                                        fontSize: '48px',
                                                        lineHeight: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '70px',
                                                        height: '70px',
                                                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                                        borderRadius: '16px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                                    }}>
                                                        {platform.platformIcon}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                                                            {platform.platformName}
                                                        </h3>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <span style={{
                                                                fontSize: '12px',
                                                                padding: '4px 10px',
                                                                background: platform.isActive ? '#10b98120' : '#ef444420',
                                                                color: platform.isActive ? '#10b981' : '#ef4444',
                                                                borderRadius: '6px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {platform.isActive ? 'نشط' : 'غير نشط'}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '12px',
                                                                padding: '4px 10px',
                                                                background: '#6366f120',
                                                                color: '#6366f1',
                                                                borderRadius: '6px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {platform.orderCount} فاتورة
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#667eea', marginBottom: '4px' }}>
                                                        {platform.netRevenue.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                        {platform.revenuePercentage.toFixed(1)}% من الإجمالي
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                                gap: '16px',
                                                marginBottom: '20px'
                                            }}>
                                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>إجمالي الإيرادات</div>
                                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                                                        {platform.grossRevenue.toFixed(2)} ر.س
                                                    </div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>إجمالي الربح</div>
                                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                                                        {platform.grossProfit.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                        هامش {platform.profitMargin.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>صافي الربح</div>
                                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
                                                        {platform.netProfit.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                        هامش {platform.netProfitMargin.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>متوسط الفاتورة</div>
                                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#d97706' }}>
                                                        {platform.avgOrderValue.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                        ربح: {platform.avgProfit.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Costs & Fees Row */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                gap: '12px',
                                                padding: '16px',
                                                background: '#fef2f2',
                                                borderRadius: '12px',
                                                marginBottom: '16px'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>تكلفة البضاعة</div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                                        {platform.costOfGoods.toFixed(2)} ر.س
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>العمولة</div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b' }}>
                                                        {platform.commission.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                                        {platform.actualCommissionRate.toFixed(2)}% (قياسي: {platform.configuredCommissionRate.toFixed(2)}%)
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>الضريبة</div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>
                                                        {platform.tax.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                                        {platform.actualTaxRate.toFixed(2)}% (قياسي: {platform.configuredTaxRate.toFixed(2)}%)
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>المرتجعات</div>
                                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>
                                                        {platform.refunded.toFixed(2)} ر.س
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                                        معدل {platform.refundRate.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Period Comparison */}
                                            {change && (
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    padding: '12px 16px',
                                                    background: change.isNew ? '#ecfdf5' : '#f8fafc',
                                                    borderRadius: '10px',
                                                    border: change.isNew ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                                                }}>
                                                    {change.isNew ? (
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                                                            ✨ منصة جديدة في هذه الفترة
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>تغير الإيرادات</div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '14px',
                                                                    fontWeight: '700',
                                                                    color: change.revenueChange >= 0 ? '#10b981' : '#ef4444'
                                                                }}>
                                                                    {change.revenueChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                                    {Math.abs(change.revenueChange).toFixed(1)}%
                                                                </div>
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>تغير الربح</div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '14px',
                                                                    fontWeight: '700',
                                                                    color: change.profitChange >= 0 ? '#10b981' : '#ef4444'
                                                                }}>
                                                                    {change.profitChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                                    {Math.abs(change.profitChange).toFixed(1)}%
                                                                </div>
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>تغير الطلبات</div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '14px',
                                                                    fontWeight: '700',
                                                                    color: change.orderChange >= 0 ? '#10b981' : '#ef4444'
                                                                }}>
                                                                    {change.orderChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                                    {Math.abs(change.orderChange).toFixed(1)}%
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* NEW: Customer Analytics & Returns Analysis Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
                        {/* Customer Analytics */}
                        {metrics.customers && (
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <Users size={24} color="#8b5cf6" />
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>تحليل العملاء</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>{metrics.customers.totalCustomers}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>إجمالي العملاء</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{metrics.customers.registeredSales}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>مبيعات مسجلة</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>أفضل العملاء:</div>
                                {metrics.customers.topCustomers.slice(0, 3).map((customer, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        background: i === 0 ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : '#f8fafc',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        border: i === 0 ? '1px solid #fbbf24' : '1px solid #e2e8f0'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{customer.name}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b', marginRight: '8px' }}>({customer.orderCount} طلب)</span>
                                        </div>
                                        <div style={{ fontWeight: '700', color: '#10b981' }}>{customer.totalRevenue.toFixed(0)} ر.س</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Returns Analysis */}
                        {metrics.returns && (
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <TrendingDown size={24} color="#ef4444" />
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>تحليل المرتجعات</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ textAlign: 'center', padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>{metrics.returns.totalReturnsCount}</div>
                                        <div style={{ fontSize: '12px', color: '#991b1b' }}>عدد المرتجعات</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>{metrics.returns.totalReturnsValue.toFixed(0)}</div>
                                        <div style={{ fontSize: '12px', color: '#991b1b' }}>قيمة المرتجعات</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '12px', background: metrics.returns.returnRate > 5 ? '#fef2f2' : '#f0fdf4', borderRadius: '12px', border: `1px solid ${metrics.returns.returnRate > 5 ? '#fecaca' : '#bbf7d0'}` }}>
                                        <div style={{ fontSize: '22px', fontWeight: '700', color: metrics.returns.returnRate > 5 ? '#dc2626' : '#16a34a' }}>{metrics.returns.returnRate}%</div>
                                        <div style={{ fontSize: '12px', color: metrics.returns.returnRate > 5 ? '#991b1b' : '#166534' }}>نسبة المرتجعات</div>
                                    </div>
                                </div>
                                {metrics.returns.returnsByType.length > 0 && (
                                    <>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>حسب النوع:</div>
                                        {metrics.returns.returnsByType.map((rt, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                background: '#f8fafc',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <span style={{ fontWeight: '600', color: '#0f172a' }}>
                                                    {rt.type === 'STOCK' ? '🔄 إرجاع للمخزون' : '⚠️ تالف'}
                                                </span>
                                                <div>
                                                    <span style={{ fontWeight: '600', color: '#64748b' }}>{rt.qty} قطعة</span>
                                                    <span style={{ marginRight: '12px', fontWeight: '700', color: '#dc2626' }}>{rt.value.toFixed(0)} ر.س</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Alerts Section */}
                    {(metrics.inventory.lowStockCount > 0 || metrics.inventory.outOfStockCount > 0) && (
                        <div style={{
                            marginTop: '24px',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '2px solid #fbbf24'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <AlertTriangle size={24} color="#d97706" />
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
                                    تنبيهات المخزون
                                </h3>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1, padding: '16px', background: 'white', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                                        مخزون منخفض
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#d97706' }}>
                                        {metrics.inventory.lowStockCount}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#78350f', marginTop: '4px' }}>
                                        منتج يحتاج تعبئة
                                    </div>
                                </div>
                                <div style={{ flex: 1, padding: '16px', background: 'white', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                                        نفذ من المخزون
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>
                                        {metrics.inventory.outOfStockCount}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#78350f', marginTop: '4px' }}>
                                        منتج غير متوفر
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <StatCard
                        title="إجمالي الإيرادات"
                        value={`${metrics.sales.totalRevenue.toFixed(2)} ر.س`}
                        subtitle={`${metrics.sales.orderCount} فاتورة`}
                        icon={DollarSign}
                        color="#10b981"
                    />
                    <StatCard
                        title="متوسط الفاتورة"
                        value={`${metrics.sales.averageOrderValue.toFixed(2)} ر.س`}
                        icon={Target}
                        color="#8b5cf6"
                    />
                    <StatCard
                        title="المرتجعات"
                        value={`${metrics.sales.totalReturns.toFixed(2)} ر.س`}
                        icon={TrendingDown}
                        color="#ef4444"
                    />
                    <StatCard
                        title="صافي المبيعات"
                        value={`${metrics.sales.netSales.toFixed(2)} ر.س`}
                        icon={TrendingUp}
                        color="#6366f1"
                    />
                </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <StatCard
                        title="إجمالي الربح"
                        value={`${metrics.financial.grossProfit.toFixed(2)} ر.س`}
                        subtitle={`هامش ${metrics.financial.profitMargin.toFixed(1)}%`}
                        icon={TrendingUp}
                        color="#10b981"
                    />
                    <StatCard
                        title="التكلفة الإجمالية"
                        value={`${metrics.financial.totalCost.toFixed(2)} ر.س`}
                        icon={DollarSign}
                        color="#ef4444"
                    />
                    <StatCard
                        title="الضرائب"
                        value={`${metrics.financial.totalTax.toFixed(2)} ر.س`}
                        icon={FileText}
                        color="#f59e0b"
                    />
                    <StatCard
                        title="العمولات"
                        value={`${metrics.financial.totalCommission.toFixed(2)} ر.س`}
                        icon={Users}
                        color="#8b5cf6"
                    />
                    <StatCard
                        title="صافي الربح"
                        value={`${metrics.financial.netProfit.toFixed(2)} ر.س`}
                        icon={TrendingUp}
                        color="#6366f1"
                    />
                </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <StatCard
                        title="قيمة المخزون"
                        value={`${metrics.inventory.totalStockValue.toFixed(2)} ر.س`}
                        icon={Package}
                        color="#6366f1"
                    />
                    <StatCard
                        title="عدد المنتجات"
                        value={metrics.inventory.totalProducts.toString()}
                        subtitle="منتج مختلف"
                        icon={ShoppingBag}
                        color="#10b981"
                    />
                    <StatCard
                        title="مخزون منخفض"
                        value={metrics.inventory.lowStockCount.toString()}
                        subtitle="يحتاج تعبئة"
                        icon={AlertTriangle}
                        color="#f59e0b"
                    />
                    <StatCard
                        title="نفذ من المخزون"
                        value={metrics.inventory.outOfStockCount.toString()}
                        subtitle="غير متوفر"
                        icon={AlertTriangle}
                        color="#ef4444"
                    />
                </div>
            )}
        </div>
    );
}
