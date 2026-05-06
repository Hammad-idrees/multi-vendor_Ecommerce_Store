import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiUsers, FiShoppingBag, FiPackage, FiDollarSign,
    FiActivity, FiPieChart, FiAlertCircle, FiArrowRight,
    FiTrendingUp, FiBarChart2, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import api from '../../services/api';
import { Link } from 'react-router-dom';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
);

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = () => {
            api.get('/admin/stats')
                .then(({ data }) => { setStats(data); setLoading(false); })
                .catch(() => setLoading(false));
        };
        loadStats();
        const intervalId = window.setInterval(loadStats, 15000);
        return () => window.clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="dash-spinner" />
                <p style={{ color: '#64748b' }}>Loading platform data...</p>
            </div>
        );
    }

    // ─── Chart datasets ───
    const revenueChartData = {
        labels: stats?.salesData?.map((d: any) => d.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            fill: true,
            label: 'Revenue ($)',
            data: stats?.salesData?.map((d: any) => d.sales) || [0, 0, 0, 0, 0, 0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 4,
            borderWidth: 2,
        }],
    };

    // Only show top 5 categories in product distribution
    const topCats = (stats?.categoryData || [])
        .filter((c: any) => c.count > 0)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

    const categoryChartData = {
        labels: topCats.map((c: any) => c.name),
        datasets: [{
            data: topCats.map((c: any) => c.count),
            backgroundColor: CHART_COLORS.slice(0, topCats.length),
            borderWidth: 0,
            hoverOffset: 6,
        }],
    };

    // User role breakdown
    const userRoleData = {
        labels: ['Buyers', 'Vendors', 'Admins'],
        datasets: [{
            data: [stats?.buyersCount || 0, stats?.sellersCount || 0, stats?.adminsCount || 1],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 6,
        }],
    };

    // Order status breakdown
    const orderStatusData = {
        labels: stats?.orderStatusData?.map((s: any) => s.status) || ['Pending', 'Processing', 'Delivered'],
        datasets: [{
            label: 'Orders',
            data: stats?.orderStatusData?.map((s: any) => s.count) || [0, 0, 0],
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    // Category product bar chart (all categories with products)
    const allCatsWithProducts = (stats?.categoryData || []).filter((c: any) => c.count > 0).slice(0, 8);
    const categoryBarData = {
        labels: allCatsWithProducts.map((c: any) => c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name),
        datasets: [{
            label: 'Products',
            data: allCatsWithProducts.map((c: any) => c.count),
            backgroundColor: CHART_COLORS,
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
    };

    const fadeUp = {
        hidden: { y: 24, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <motion.div
            className="dash-page"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="dash-header">
                <div>
                    <h1 className="dash-title">Platform Overview</h1>
                    <p className="dash-subtitle">Real-time metrics and governance for Martify</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/admin/products" className="dash-btn dash-btn-primary">
                        <FiPackage /> Moderation
                    </Link>
                    <Link to="/admin/users" className="dash-btn dash-btn-outline">
                        <FiUsers /> Users
                    </Link>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="dash-kpi-grid">
                {[
                    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, sub: 'Platform lifetime', icon: <FiDollarSign />, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Registered Users', value: stats?.usersCount || 0, sub: `${stats?.vendorsCount || 0} vendors · ${stats?.customersCount || 0} customers`, icon: <FiUsers />, color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'Total Orders', value: stats?.ordersCount || 0, sub: 'All time transactions', icon: <FiShoppingBag />, color: '#10b981', bg: '#f0fdf4' },
                    { label: 'Pending Approval', value: stats?.pendingApprovals || 0, sub: 'Products awaiting review', icon: <FiAlertCircle />, color: '#f59e0b', bg: '#fffbeb' },
                ].map((kpi, i) => (
                    <motion.div key={i} variants={fadeUp} className="dash-kpi-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p className="dash-kpi-label">{kpi.label}</p>
                                <h2 className="dash-kpi-value" style={{ color: kpi.color }}>{kpi.value}</h2>
                                <p className="dash-kpi-sub">{kpi.sub}</p>
                            </div>
                            <div className="dash-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                                {kpi.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart + User Role Doughnut */}
            <div className="dash-row-2-1">
                <motion.div variants={fadeUp} className="dash-card">
                    <div className="dash-card-header">
                        <h3><FiActivity /> Revenue Growth</h3>
                        <span className="dash-badge dash-badge-blue">Last 6 Months</span>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Line
                            data={revenueChartData}
                            options={{
                                ...chartDefaults,
                                scales: {
                                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: (v: any) => `$${v}` } },
                                    x: { grid: { display: false } },
                                },
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="dash-card">
                    <div className="dash-card-header">
                        <h3><FiUsers /> User Distribution</h3>
                    </div>
                    <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={userRoleData}
                            options={{
                                ...chartDefaults,
                                cutout: '65%',
                                plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Order Status Bar + Category Doughnut */}
            <div className="dash-row-2">
                <motion.div variants={fadeUp} className="dash-card">
                    <div className="dash-card-header">
                        <h3><FiBarChart2 /> Orders by Status</h3>
                    </div>
                    <div style={{ height: '220px' }}>
                        <Bar
                            data={orderStatusData}
                            options={{
                                ...chartDefaults,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true },
                                    x: { grid: { display: false } },
                                },
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="dash-card">
                    <div className="dash-card-header">
                        <h3><FiPieChart /> Product Distribution</h3>
                    </div>
                    <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={categoryChartData}
                            options={{
                                ...chartDefaults,
                                cutout: '60%',
                                plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10 } } } },
                            }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Products per Category Bar */}
            <motion.div variants={fadeUp} className="dash-card">
                <div className="dash-card-header">
                    <h3><FiBarChart2 /> Products per Category</h3>
                    <span className="dash-badge dash-badge-purple">Top 8</span>
                </div>
                <div style={{ height: '220px' }}>
                    <Bar
                        data={categoryBarData}
                        options={{
                            ...chartDefaults,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true },
                                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                            },
                        }}
                    />
                </div>
            </motion.div>

            {/* Recent Orders Table */}
            <motion.div variants={fadeUp} className="dash-card">
                <div className="dash-card-header">
                    <h3>Recent Platform Orders</h3>
                    <Link to="/admin/orders" className="dash-view-all">All Orders <FiArrowRight /></Link>
                </div>
                {stats?.recentOrders?.length > 0 ? (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order._id}>
                                        <td><span className="dash-mono" style={{ fontWeight: 700 }}>{order.displayId || `#${order._id.toString().slice(-8).toUpperCase()}`}</span></td>
                                        <td>
                                            <div className="dash-user-cell">
                                                <span className="dash-user-name">{order.user?.name || 'Guest'}</span>
                                                <span className="dash-user-email">{order.user?.email}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td><strong>${order.totalPrice?.toFixed(2)}</strong></td>
                                        <td>
                                            <span className={`dash-status dash-status-${order.isPaid ? 'success' : 'pending'}`}>
                                                {order.isPaid ? <FiCheckCircle /> : <FiClock />}
                                                {order.status || (order.isPaid ? 'Paid' : 'Pending')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No orders yet.</p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboardPage;
