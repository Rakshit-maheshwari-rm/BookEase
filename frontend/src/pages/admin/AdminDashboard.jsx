import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCurrency } from "../../context/CurrencyContext";
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

function AdminDashboard() {
    const { formatPrice } = useCurrency();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalListings: 0,
        pendingWithdrawals: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [usersRes, listingsRes, bookingsRes, withdrawalsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/users`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/admin/all`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/admin/all`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/withdrawal/admin/all`, { withCredentials: true })
                ]);

                let totalUsers = 0;
                let totalListings = 0;
                let pendingWithdrawalsCount = 0;

                if (usersRes.data.success) {
                    totalUsers = usersRes.data.users.length;
                }
                if (listingsRes.data.success) {
                    totalListings = listingsRes.data.listings.length;
                }
                if (withdrawalsRes.data.success) {
                    pendingWithdrawalsCount = withdrawalsRes.data.withdrawals.filter(w => w.status === 'pending').length;
                }

                setStats({
                    totalUsers,
                    totalListings,
                    pendingWithdrawals: pendingWithdrawalsCount
                });

                if (bookingsRes.data.success) {
                    const bookings = bookingsRes.data.bookings;
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const d = new Date();
                    const newChartData = [];

                    for (let i = 5; i >= 0; i--) {
                        const target = new Date(d.getFullYear(), d.getMonth() - i, 1);
                        newChartData.push({
                            name: monthNames[target.getMonth()],
                            month: target.getMonth(),
                            year: target.getFullYear(),
                            revenue: 0,
                            bookings: 0
                        });
                    }

                    bookings.forEach(b => {
                        const bDate = new Date(b.createdAt);
                        const bMonth = bDate.getMonth();
                        const bYear = bDate.getFullYear();

                        const dataPoint = newChartData.find(d => d.month === bMonth && d.year === bYear);
                        if (dataPoint && b.status === 'confirmed') {
                            dataPoint.revenue += (b.totalPrice || 0);
                            dataPoint.bookings += 1;
                        }
                    });

                    setChartData(newChartData);
                }
            } catch (error) {
                console.error("Dashboard error:", error);
                toast.error('Failed to load dashboard metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const labels = chartData.map(d => d.name);

    const revenueChartData = {
        labels,
        datasets: [
            {
                label: 'Gross Revenue',
                data: chartData.map(d => d.revenue),
                fill: true,
                borderColor: '#256af5',
                backgroundColor: 'rgba(37, 106, 245, 0.2)',
                tension: 0.4
            }
        ]
    };

    const revenueOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatPrice(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#6c757d' },
                border: { display: false }
            },
            y: { display: false }
        }
    };

    const bookingsChartData = {
        labels,
        datasets: [
            {
                label: 'Bookings',
                data: chartData.map(d => d.bookings),
                backgroundColor: '#00e5ff',
                borderRadius: 4,
                barThickness: 30
            }
        ]
    };

    const bookingsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#212529',
                titleColor: '#fff',
                bodyColor: '#00e5ff',
                borderColor: '#495057',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#6c757d' },
                border: { display: false }
            },
            y: {
                grid: { display: false },
                ticks: { color: '#6c757d' },
                border: { display: false }
            }
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Admin Dashboard</h3>
                    <p className="text-secondary mb-0">Welcome to the administration panel. Monitor platform metrics here.</p>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-users"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">Total Users</p>
                        <h2 className="text-white fw-bold mb-0">
                            {stats.totalUsers}
                        </h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-house"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">Total Listings</p>
                        <h2 className="text-white fw-bold mb-0">
                            {stats.totalListings}
                        </h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">Pending Withdrawals</p>
                        <h2 className="text-white fw-bold mb-0">
                            {stats.pendingWithdrawals}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-8">
                    <div className="auth-card p-4 rounded-4 h-100">
                        <h5 className="text-white fw-bold mb-4">Gross Revenue (6 Months)</h5>
                        <div className="chart-container">
                            <Line data={revenueChartData} options={revenueOptions} />
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="auth-card p-4 rounded-4 h-100">
                        <h5 className="text-white fw-bold mb-4">Bookings (6 Months)</h5>
                        <div className="chart-container">
                            <Bar data={bookingsChartData} options={bookingsOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;