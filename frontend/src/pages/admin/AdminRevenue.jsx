import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCurrency } from "../../context/CurrencyContext";
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';

function AdminRevenue() {
    const { formatPrice } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        grossBookingValue: 0,
        platformCommission: 0,
        pendingPayouts: 0
    });

    useEffect(() => {
        const fetchFinancialData = async () => {
            try {
                const [bookingsRes, withdrawalsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/admin/all`, { withCredentials: true }),
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/withdrawal/admin/all`, { withCredentials: true })
                ]);

                if (bookingsRes.data.success && withdrawalsRes.data.success) {
                    const bookings = bookingsRes.data.bookings;
                    const withdrawals = withdrawalsRes.data.withdrawals;

                    let grossValue = 0;
                    let totalCommission = 0;
                    let pendingWithdrawals = 0;

                    const mergedTransactions = [];

                    bookings.forEach(booking => {
                        if (booking.status === 'confirmed') {
                            grossValue += booking.totalPrice || 0;
                            totalCommission += booking.commissionAmount || 0;
                        }

                        mergedTransactions.push({
                            id: booking.bookingId || booking._id,
                            type: 'Booking',
                            amount: booking.totalPrice || 0,
                            commission: booking.commissionAmount || 0,
                            date: booking.createdAt,
                            status: booking.status,
                            originalId: booking._id
                        });
                    });

                    withdrawals.forEach(withdrawal => {
                        if (withdrawal.status === 'pending') {
                            pendingWithdrawals += withdrawal.amount || 0;
                        }

                        mergedTransactions.push({
                            id: withdrawal.withdrawalId || withdrawal._id,
                            type: 'Payout',
                            amount: -(withdrawal.amount || 0),
                            commission: 0,
                            date: withdrawal.createdAt,
                            status: withdrawal.status,
                            originalId: withdrawal._id
                        });
                    });

                    mergedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

                    setStats({
                        grossBookingValue: grossValue,
                        platformCommission: totalCommission,
                        pendingPayouts: pendingWithdrawals
                    });

                    setTransactions(mergedTransactions);
                }
            } catch (error) {
                toast.error('Failed to fetch financial data');
            }
        };

        fetchFinancialData();
    }, []);

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(transactions, 10);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Platform Revenue</h3>
                    <p className="text-secondary mb-0">Track platform earnings, commissions, and financial metrics.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-sack-dollar"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">GROSS BOOKING VALUE</p>
                        <h2 className="text-white fw-bold mb-0">{formatPrice(stats?.grossBookingValue)}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-piggy-bank"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">PLATFORM COMMISSION</p>
                        <h2 className="text-white fw-bold mb-0 text-success">{formatPrice(stats?.platformCommission)}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-file-invoice-dollar"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">HOST PAYOUTS (PENDING)</p>
                        <h2 className="text-white fw-bold mb-0 text-warning">{formatPrice(stats?.pendingPayouts)}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="text-white mb-0">Recent Transactions</h5>
                </div>
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Commission</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-white py-4">No transactions to display</td>
                                </tr>
                            ) : (
                                currentItems.map(t => (
                                    <tr key={t?.originalId}>
                                        <td>{t?.id?.substring(0, 10)}...</td>
                                        <td>
                                            <span className={`badge ${t?.type === 'Booking' ? 'bg-primary' : 'bg-info text-dark'}`}>
                                                {t?.type}
                                            </span>
                                        </td>
                                        <td className={t.amount < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                            {t?.amount < 0 ? '-' : '+'}{formatPrice(Math.abs(t?.amount))}
                                        </td>
                                        <td className="text-secondary">
                                            {t?.commission > 0 ? formatPrice(t?.commission) : '-'}
                                        </td>
                                        <td>{new Date(t?.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${t?.status === 'confirmed' ? 'bg-success' :
                                                t?.status === 'pending' ? 'bg-warning text-dark' :
                                                    'bg-danger'
                                                }`}>
                                                {t?.status?.charAt(0).toUpperCase() + t?.status?.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-block d-xl-none mt-4">
                    {currentItems.length > 0 ? currentItems.map((t) => (
                        <div key={t?.originalId} className="card bg-transparent border border-secondary mb-3 rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="text-white mb-1">{t?.type}</h6>
                                        <p className="text-secondary small mb-0">{t?.id}</p>
                                    </div>
                                    <span className={`badge ${t?.status === 'confirmed' ? 'bg-success' :
                                        t?.status === 'pending' ? 'bg-warning text-dark' :
                                            'bg-danger'
                                        }`}>
                                        {t?.status?.charAt(0).toUpperCase() + t?.status?.slice(1)}
                                    </span>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <small className="text-secondary">Amount</small>
                                        <p className={`mb-0 ${t.amount < 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}`}>
                                            {t?.amount < 0 ? '-' : '+'}{formatPrice(Math.abs(t?.amount))}
                                        </p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary">Commission</small>
                                        <p className="text-white mb-0">{t?.commission > 0 ? formatPrice(t?.commission) : '-'}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-secondary">{new Date(t?.date).toLocaleDateString()}</small>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-receipt fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No transactions yet</h5>
                        </div>
                    )}
                </div>

                {transactions.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-4">
                        <Pagination
                            activePage={activePage}
                            itemsCountPerPage={itemsPerPage}
                            totalItemsCount={totalItems}
                            pageRangeDisplayed={1}
                            onChange={handlePageChange}
                            itemClass="page-item"
                            linkClass="page-link"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminRevenue;