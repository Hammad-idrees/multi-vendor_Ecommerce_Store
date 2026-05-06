import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPackage, FiDollarSign, FiShoppingBag, FiStar,
    FiTrendingUp, FiAlertCircle, FiArrowRight, FiBarChart2,
    FiPieChart, FiActivity, FiCheckCircle, FiRefreshCw, FiCalendar
} from 'react-icons/fi';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale,
} from 'chart.js';
import api from '../../services/api';
import { Link } from 'react-router-dom';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler, RadialLinearScale
);

/* ── Animated counter ── */
function useCounter(target: number, duration = 1100) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let cur = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            cur += step;
            if (cur >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(cur));
        }, 16);
        return () => clearInterval(t);
    }, [target, duration]);
    return val;
}

/* ── Mini SVG sparkline ── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const W = 72, H = 28;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`).join(' ');
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
            <polyline points={`0,${H} ${pts} ${W},${H}`} fill={`${color}18`} stroke="none" />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

/* ── Status pill ── */
const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
    pending:    { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
    processing: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
    shipped:    { bg: '#f5f3ff', color: '#6d28d9', dot: '#8b5cf6' },
    delivered:  { bg: '#f0fdf4', color: '#15803d', dot: '#10b981' },
    cancelled:  { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
};
function StatusPill({ status }: { status: string }) {
    const s = STATUS_STYLES[status?.toLowerCase()] ?? { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: s.bg, color: s.color, fontWeight: 700, fontSize: '0.7rem', borderRadius: 99, padding: '0.22rem 0.65rem', letterSpacing: '0.04em', textTransform: 'capitalize' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            {status}
        </span>
    );
}

/* ── KPI card ── */
function KpiCard({ label, value, prefix = '', sub, icon, color, bg, trend, sparkData }: any) {
    const counted = useCounter(Number(value) || 0);
    return (
        <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            whileHover={{ y: -4, boxShadow: `0 16px 40px ${color}1a` }}
            style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '1.4rem 1.5rem', cursor: 'default', transition: 'box-shadow 0.25s', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}55)`, borderRadius: '16px 16px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.9rem', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {prefix}{counted.toLocaleString()}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: trend ? '#10b981' : '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {trend && <FiTrendingUp size={12} />}{sub}
                    </p>
                </div>
                <div style={{ background: bg, color, borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    {icon}
                </div>
            </div>
            {sparkData?.length > 1 && (
                <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid #f1f5f9' }}>
                    <Sparkline data={sparkData} color={color} />
                </div>
            )}
        </motion.div>
    );
}

const fadeUp = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function Card({ children, style = {} }: any) {
    return (
        <motion.div variants={fadeUp} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '1.4rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', ...style }}>
            {children}
        </motion.div>
    );
}

function CardHeader({ icon, title, badge, action }: any) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#8b5cf6', display: 'flex' }}>{icon}</span>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
                {badge && (
                    <span style={{ background: badge === 'Live' ? '#eff6ff' : '#f5f3ff', color: badge === 'Live' ? '#3b82f6' : '#8b5cf6', fontSize: '0.67rem', fontWeight: 700, borderRadius: 99, padding: '0.15rem 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {badge}
                    </span>
                )}
            </div>
            {action}
        </div>
    );
}

const TOOLTIP_OPTS = {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    titleColor: '#1e293b',
    bodyColor: '#64748b',
    padding: 10,
    cornerRadius: 10,
};

const SellerDashboardPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orderFilter, setOrderFilter] = useState('all');
    const [revenueRange, setRevenueRange] = useState<'6m' | '12m'>('6m');

    const loadStats = (manual = false) => {
        if (manual) setRefreshing(true);
        api.get('/seller/stats')
            .then(({ data }) => { setStats(data); setLoading(false); setRefreshing(false); })
            .catch(() => { setLoading(false); setRefreshing(false); });
    };

    useEffect(() => {
        loadStats();
        const id = window.setInterval(() => loadStats(), 15000);
        return () => window.clearInterval(id);
    }, []);

    const salesMonths = stats?.salesData?.map((d: any) => d.month) || [];
    const salesValues = stats?.salesData?.map((d: any) => d.sales) || [];
    const topProds    = stats?.topProducts || [];
    const stockOk     = (stats?.productsCount || 0) - (stats?.lowStockProducts?.length || 0);
    const stockLow    = stats?.lowStockProducts?.length || 0;
    const allOrders = stats?.recentOrders || [];
    const revenuePoints = revenueRange === '12m'
        ? Math.min(12, salesMonths.length)
        : Math.min(6, salesMonths.length);
    const rangeMonths = salesMonths.slice(-revenuePoints);
    const rangeValues = salesValues.slice(-revenuePoints);
    const trendValues = rangeValues.map((_: number, idx: number, arr: number[]) => {
        const start = Math.max(0, idx - 2);
        const chunk = arr.slice(start, idx + 1);
        return chunk.reduce((sum, curr) => sum + curr, 0) / chunk.length;
    });

    const revenueChartData = {
        labels: rangeMonths,
        datasets: [
            {
                label: 'Revenue',
                data: rangeValues,
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124,58,237,0.14)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 7,
                yAxisID: 'y',
            },
            {
                fill: true,
                label: 'Trend',
                data: trendValues,
                borderColor: '#8b5cf6',
                backgroundColor: (ctx: any) => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                    g.addColorStop(0, 'rgba(139,92,246,0.2)');
                    g.addColorStop(1, 'rgba(139,92,246,0)');
                    return g;
                },
                tension: 0.42,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                borderWidth: 2.5,
                yAxisID: 'y',
            },
        ],
    };

    const topProductsBar = {
        labels: topProds.map((p: any) => p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name),
        datasets: [{
            label: 'Reviews',
            data: topProds.map((p: any) => p.numReviews),
            backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const ratingBuckets = [0, 0, 0, 0, 0];
    topProds.forEach((p: any) => {
        const r = Math.round(p.averageRating);
        if (r >= 1 && r <= 5) ratingBuckets[r - 1]++;
    });
    const ratingDoughnut = {
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [{ data: ratingBuckets, backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'], borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }],
    };

    const stockDoughnut = {
        labels: ['Healthy', 'Low Stock'],
        datasets: [{ data: [stockOk, stockLow], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }],
    };

    const weeklyLabels = useMemo(() => {
        const labels: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
        }
        return labels;
    }, []);

    const weeklyOrdersMap = useMemo(() => {
        const map = new Map<string, { revenue: number; orders: number }>();
        weeklyLabels.forEach((day) => map.set(day, { revenue: 0, orders: 0 }));
        (stats?.recentOrders || []).forEach((order: any) => {
            const day = new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short' });
            if (map.has(day)) {
                const current = map.get(day)!;
                map.set(day, {
                    revenue: current.revenue + (order.totalPrice || 0),
                    orders: current.orders + 1,
                });
            }
        });
        return map;
    }, [stats?.recentOrders, weeklyLabels]);

    const weeklyPerformance = {
        labels: weeklyLabels,
        datasets: [
            {
                label: 'Revenue',
                data: weeklyLabels.map((day) => weeklyOrdersMap.get(day)?.revenue || 0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.15)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 7,
                yAxisID: 'y',
            },
            {
                label: 'Orders',
                data: weeklyLabels.map((day) => weeklyOrdersMap.get(day)?.orders || 0),
                borderColor: '#0ea5e9',
                backgroundColor: '#0ea5e9',
                yAxisID: 'y1',
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const orderStatusPolar = {
        labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        datasets: [{
            data: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) =>
                allOrders.filter((o: any) => o.status?.toLowerCase() === status).length
            ),
            backgroundColor: ['rgba(245,158,11,0.75)', 'rgba(59,130,246,0.75)', 'rgba(139,92,246,0.75)', 'rgba(16,185,129,0.75)', 'rgba(239,68,68,0.75)'],
            borderColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
            borderWidth: 1.5,
        }],
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <FiRefreshCw size={24} color="#8b5cf6" />
                </motion.div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading your store data…</p>
            </div>
        );
    }

    const BASE: any = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeInOutQuart' },
        plugins: { legend: { display: false }, tooltip: TOOLTIP_OPTS },
    };
    const SCALES = {
        y: { grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    };

    const filteredOrders = orderFilter === 'all'
        ? allOrders
        : allOrders.filter((o: any) => o.status?.toLowerCase() === orderFilter);

    const ViewAll = ({ to, label = 'View all' }: any) => (
        <Link to={to} style={{ textDecoration: 'none', color: '#8b5cf6', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {label} <FiArrowRight size={12} />
        </Link>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}
        >
            {/* ── Header ── */}
            <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Vendor Dashboard</h1>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.83rem' }}>Here's what's happening with your store today</p>
                </div>
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => loadStats(true)}
                        style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 10, padding: '0.5rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'inherit', fontWeight: 600 }}
                    >
                        <motion.span animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                            <FiRefreshCw size={13} />
                        </motion.span>
                        Refresh
                    </motion.button>
                    <Link to="/seller/products" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}>
                        My Products
                    </Link>
                    <Link to="/seller/products" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderRadius: 10, padding: '0.5rem 1.1rem', fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 4px 16px rgba(139,92,246,0.35)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        + Add Product
                    </Link>
                </div>
            </motion.div>

            {/* ── KPI Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <KpiCard label="Total Revenue"    value={stats?.totalRevenue || 0}              prefix="$" sub="+12.5% vs last month"    icon={<FiDollarSign />}  color="#8b5cf6" bg="#f5f3ff" trend sparkData={salesValues.slice(-6)} />
                <KpiCard label="Total Orders"     value={stats?.totalOrders || 0}                          sub="Across all time"          icon={<FiShoppingBag />} color="#3b82f6" bg="#eff6ff"       sparkData={salesMonths.map((_: any, i: number) => i * 4 + 8)} />
                <KpiCard label="Active Products"  value={stats?.productsCount || 0}                        sub="Listed in catalog"        icon={<FiPackage />}     color="#10b981" bg="#f0fdf4" />
                <KpiCard label="Low Stock Alerts" value={stats?.lowStockProducts?.length || 0}             sub="Need restocking"          icon={<FiAlertCircle />} color="#f59e0b" bg="#fffbeb" />
            </div>

            {/* ── Revenue + Stock Health ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Card>
                    <CardHeader
                        icon={<FiActivity />}
                        title="Revenue Trends"
                        badge="Monthly"
                        action={(
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {(['6m', '12m'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setRevenueRange(range)}
                                        style={{
                                            background: revenueRange === range ? '#ede9fe' : '#fff',
                                            border: `1px solid ${revenueRange === range ? '#c4b5fd' : '#e2e8f0'}`,
                                            color: revenueRange === range ? '#6d28d9' : '#64748b',
                                            borderRadius: 8,
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        {range.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                    <div style={{ height: '260px' }}>
                        <Line data={revenueChartData} options={{
                            ...BASE,
                            interaction: { mode: 'index' as const, intersect: false },
                            scales: {
                                ...SCALES,
                                y: { ...SCALES.y, ticks: { ...SCALES.y.ticks, callback: (v: any) => `$${v}` } },
                            },
                        }} />
                    </div>
                </Card>

                <Card>
                    <CardHeader icon={<FiPieChart />} title="Stock Health" />
                    <div style={{ height: '170px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={stockDoughnut} options={{
                            ...BASE,
                            cutout: '68%',
                            plugins: { ...BASE.plugins, legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12, color: '#64748b', font: { size: 11 } } } },
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>✓ {stockOk} Healthy</span>
                        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.82rem' }}>⚠ {stockLow} Low</span>
                    </div>
                </Card>
            </div>

            {/* ── Top Products Bar + Rating Doughnut ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Card>
                    <CardHeader icon={<FiBarChart2 />} title="Top Products by Reviews" />
                    <div style={{ height: '210px' }}>
                        <Bar data={topProductsBar} options={{ ...BASE, scales: { y: { ...SCALES.y, beginAtZero: true }, x: SCALES.x } }} />
                    </div>
                </Card>

                <Card>
                    <CardHeader icon={<FiStar />} title="Rating Distribution" />
                    <div style={{ height: '210px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={ratingDoughnut} options={{
                            ...BASE,
                            cutout: '55%',
                            plugins: { ...BASE.plugins, legend: { display: true, position: 'right', labels: { boxWidth: 10, padding: 10, color: '#64748b', font: { size: 11 } } } },
                        }} />
                    </div>
                </Card>
            </div>

            {/* ── New: Weekly Performance + Order Status ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Card>
                    <CardHeader icon={<FiCalendar />} title="Weekly Revenue vs Orders" badge="Interactive" />
                    <div style={{ height: '230px' }}>
                        <Line data={weeklyPerformance} options={{
                            ...BASE,
                            interaction: { mode: 'index' as const, intersect: false },
                            scales: {
                                x: SCALES.x,
                                y: { ...SCALES.y, beginAtZero: true, ticks: { ...SCALES.y.ticks, callback: (v: any) => `$${v}` } },
                                y1: {
                                    position: 'right' as const,
                                    beginAtZero: true,
                                    grid: { drawOnChartArea: false },
                                    ticks: { color: '#94a3b8', font: { size: 11 } },
                                },
                            },
                        }} />
                    </div>
                </Card>

                <Card>
                    <CardHeader icon={<FiPieChart />} title="Order Status Mix" badge="Live" />
                    <div style={{ height: '230px', display: 'flex', justifyContent: 'center' }}>
                        <PolarArea data={orderStatusPolar} options={{
                            ...BASE,
                            scales: {
                                r: {
                                    grid: { color: 'rgba(148,163,184,0.2)' },
                                    ticks: { backdropColor: 'transparent', color: '#94a3b8' },
                                },
                            },
                            plugins: {
                                ...BASE.plugins,
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                    labels: { boxWidth: 10, padding: 10, color: '#64748b', font: { size: 11 } },
                                },
                            },
                        }} />
                    </div>
                </Card>
            </div>

            {/* ── Inventory Alerts + Top Products Table ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Card>
                    <CardHeader icon={<FiAlertCircle style={{ color: '#ef4444' }} />} title="Inventory Alerts" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
                        <AnimatePresence>
                            {stats?.lowStockProducts?.length > 0 ? stats.lowStockProducts.map((p: any, i: number) => (
                                <motion.div key={p._id}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.65rem 0.85rem' }}
                                >
                                    <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/36/36`} alt=""
                                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                                        onError={(e: any) => { e.target.src = `https://picsum.photos/seed/${p._id}/36/36`; }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>{p.stock} units left</div>
                                    </div>
                                    <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.68rem', fontWeight: 800, borderRadius: 6, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}>LOW</span>
                                </motion.div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#10b981' }}>
                                    <FiCheckCircle size={30} style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>All stock levels healthy!</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>

                <Card>
                    <CardHeader icon={<FiPackage />} title="Top Performing Products" action={<ViewAll to="/seller/products" label="Manage" />} />
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    {['Product', 'Price', 'Rating', 'Reviews'].map(h => (
                                        <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#94a3b8', fontWeight: 700, fontSize: '0.71rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topProds.map((product: any, i: number) => (
                                    <motion.tr key={product._id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                        style={{ borderBottom: '1px solid #f8fafc' }}
                                        whileHover={{ backgroundColor: '#faf5ff' }}
                                    >
                                        <td style={{ padding: '0.65rem 0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <img src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/32/32`} alt=""
                                                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #f1f5f9' }}
                                                    onError={(e: any) => { e.target.src = `https://picsum.photos/seed/${product._id}/32/32`; }} />
                                                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem' }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.65rem 0.75rem', color: '#8b5cf6', fontWeight: 700 }}>${product.price}</td>
                                        <td style={{ padding: '0.65rem 0.75rem' }}>
                                            <span style={{ color: '#f59e0b', fontWeight: 800 }}>★ {product.averageRating?.toFixed(1)}</span>
                                        </td>
                                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>{product.numReviews}</td>
                                    </motion.tr>
                                ))}
                                {!topProds.length && (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No products yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* ── Recent Orders ── */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ color: '#8b5cf6', display: 'flex' }}><FiShoppingBag /></span>
                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>Recent Orders</h3>
                        <span style={{ background: '#eff6ff', color: '#3b82f6', fontSize: '0.67rem', fontWeight: 700, borderRadius: 99, padding: '0.15rem 0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
                            <button key={f} onClick={() => setOrderFilter(f)}
                                style={{ background: orderFilter === f ? '#f5f3ff' : 'transparent', color: orderFilter === f ? '#8b5cf6' : '#94a3b8', border: `1px solid ${orderFilter === f ? '#ddd6fe' : '#f1f5f9'}`, borderRadius: 8, padding: '0.22rem 0.6rem', fontSize: '0.71rem', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit', transition: 'all 0.18s' }}
                            >{f}</button>
                        ))}
                        <ViewAll to="/seller/orders" label="Manage Orders" />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Address', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '0.55rem 0.85rem', textAlign: 'left', color: '#94a3b8', fontWeight: 700, fontSize: '0.71rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredOrders.map((order: any, i: number) => (
                                    <motion.tr key={order._id}
                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                                        style={{ borderBottom: '1px solid #f8fafc', cursor: 'default' }}
                                        whileHover={{ backgroundColor: '#faf5ff' }}
                                    >
                                        <td style={{ padding: '0.7rem 0.85rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#8b5cf6' }}>
                                                {order.displayId || `#${order._id.slice(-6).toUpperCase()}`}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.7rem 0.85rem' }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.user?.name || 'Guest'}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{order.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '0.7rem 0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.7rem 0.85rem', color: '#64748b' }}>{order.items.length} items</td>
                                        <td style={{ padding: '0.7rem 0.85rem', fontWeight: 800, color: '#10b981' }}>${order.totalPrice.toFixed(2)}</td>
                                        <td style={{ padding: '0.7rem 0.85rem' }}>
                                            <div style={{ fontSize: '0.76rem', color: '#64748b', maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.7rem 0.85rem' }}>
                                            <StatusPill status={order.status} />
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {!filteredOrders.length && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No orders found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
};

export default SellerDashboardPage;