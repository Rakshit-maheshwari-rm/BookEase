import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import { useCurrency } from "../../context/CurrencyContext";

function Earnings() {
    const [stats, setStats] = useState();
    const [booking, setBooking] = useState([]);
    const { currency, formatPrice } = useCurrency();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/dashboard-stats`, { withCredentials: true }).then((res) => {
            setStats(res.data);
        }).catch((err) => {
            toast.error('Failed to get stats');
        });
    }, []);

    useEffect(() => {
        try {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/all-booking`, { withCredentials: true }).then((res) => {
                setBooking(res.data.bookings);
            }).catch((err) => {
                toast.error('Failed to get bookings');
            });
        } catch (error) {
            toast.error('Failed to get bookings');
        }
    }, []);

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(booking, 10);
    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="auth-card p-5 rounded-4">
                        <div className="text-center mb-5">
                            <span className="host-badge mb-3">FINANCIALS</span>
                            <h2 className="display-5 fw-bold text-white mt-2">Your Earnings</h2>
                            <p className="text-midwhite">Track your revenue and upcoming payouts.</p>
                        </div>
                        <div className="row g-4 mb-5">
                            <div className="col-12 col-sm-6 col-xl-4">
                                <div className="overview-stat-card p-4 h-100">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="stat-icon-wrapper icon-revenue">
                                            <i className="fa-solid fa-sack-dollar"></i>
                                        </div>
                                    </div>
                                    <p className="text-secondary small mb-1">Total Earnings</p>
                                    <h2 className="text-white fw-bold mb-0">{formatPrice(stats?.totalRevenue || 0)}</h2>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-xl-4">
                                <div className="overview-stat-card p-4 h-100">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="stat-icon-wrapper icon-listings">
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                    </div>
                                    <p className="text-secondary small mb-1">Pending Payouts</p>
                                    <h2 className="text-white fw-bold mb-0">{formatPrice(stats?.pendingPayouts || 0)}</h2>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-xl-4">
                                <div className="overview-stat-card p-4 h-100">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="stat-icon-wrapper icon-bookings">
                                            <i class="fa-solid fa-receipt"></i>
                                        </div>
                                    </div>
                                    <p className="text-secondary small mb-1">Transaction</p>
                                    <h2 className="text-white fw-bold mb-0">{stats?.actBooking || 0}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive d-none d-xl-block">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Booking ID</th>
                                        <th scope="col">Property Name</th>
                                        <th scope="col">Check-in</th>
                                        <th scope="col">Check-out</th>
                                        <th scope="col">Total Price ({currency})</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? currentItems.filter(item => item.status === 'confirmed').map((item) => {
                                        return (
                                            <tr key={item._id}>
                                                <th scope="row">{item?.bookingId}</th>
                                                <td><span className="booking-property-name text-12">{item?.listing?.title}</span></td>
                                                <td className="booking-date">{item?.checkIn ? new Date(item.checkIn).toISOString().split('T')[0] : ''}</td>
                                                <td className="booking-date">{item?.checkOut ? new Date(item.checkOut).toISOString().split('T')[0] : ''}</td>
                                                <td>{formatPrice(item?.totalPrice)}</td>
                                                <td><span className={`status-badge status-${item?.status?.toLowerCase()}`}>{item?.status}</span></td>
                                            </tr>
                                        )
                                    }) : <tr>
                                        <td colSpan={8} className="text-center text-white py-3">No transaction yet!</td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-block d-xl-none mt-4">
                            {currentItems.length > 0 ? currentItems.filter(item => item.status === 'confirmed').map((item) => (
                                <div key={item._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="text-white mb-1">{item?.listing?.title}</h6>
                                                <p className="text-secondary small mb-0">{item?.bookingId}</p>
                                            </div>
                                            <span className={`status-badge status-${item?.status?.toLowerCase()}`}>{item?.status}</span>
                                        </div>
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <small className="text-secondary">Check-in</small>
                                                <p className="text-white mb-0">{item?.checkIn ? new Date(item.checkIn).toISOString().split('T')[0] : ''}</p>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-secondary">Check-out</small>
                                                <p className="text-white mb-0">{item?.checkOut ? new Date(item.checkOut).toISOString().split('T')[0] : ''}</p>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-secondary">Total</small>
                                                <h5 className="text-white mb-0">{formatPrice(item?.totalPrice)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5">
                                    <i className="fa-solid fa-receipt fs-1 text-secondary mb-3"></i>
                                    <h5 className="text-white">No transactions yet</h5>
                                    <p className="text-secondary">Your confirmed bookings will appear here.</p>
                                </div>
                            )}
                        </div>
                        {booking.length > itemsPerPage && (
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
            </div>
        </div>
    );
}

export default Earnings;
