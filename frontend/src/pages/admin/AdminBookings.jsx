import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCurrency } from "../../context/CurrencyContext";
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';

function AdminBookings() {
    const { currency, formatPrice } = useCurrency();
    const [bookings, setBookings] = useState([]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/admin/all`, { withCredentials: true });
            if (res.data.success) {
                setBookings(res.data.bookings);
            } else {
                toast.error(res.data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching bookings');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/booking/admin/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success('Booking deleted successfully');
                fetchBookings();
            } else {
                toast.error(res.data.message || 'Failed to delete booking');
            }
        } catch (error) {
            toast.error('Something went wrong while deleting booking');
        }
    };

    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(booking => booking.status === 'confirmed' || booking.status === 'pending').length;
    const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled').length;

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(bookings, 10);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">All Bookings</h3>
                    <p className="text-secondary mb-0">View all reservations made on the platform.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-calendar-check"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">TOTAL BOOKINGS</p>
                        <h2 className="text-white fw-bold mb-0">{totalBookings}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-plane-arrival"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">UPCOMING BOOKINGS</p>
                        <h2 className="text-white fw-bold mb-0">{upcomingBookings}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-ban"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">CANCELLED</p>
                        <h2 className="text-white fw-bold mb-0">{cancelledBookings}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Listing</th>
                                <th>Guest</th>
                                <th>Dates</th>
                                <th>Amount ({currency})</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-white py-4">No bookings to display</td>
                                </tr>
                            ) : (
                                currentItems.map(booking => (
                                    <tr key={booking?._id}>
                                        <td>{booking?.bookingId}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                {booking?.listing?.images?.mainImage && (
                                                    <img
                                                        src={booking.listing.images.mainImage?.startsWith?.('http') ? booking.listing.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${booking.listing.images.mainImage}`}
                                                        alt={booking?.listing?.title}
                                                        className="admin-listing"
                                                    />
                                                )}
                                                <span className="text-truncate">
                                                    {booking.listing?.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{booking.user?.username}</td>
                                        <td>
                                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                        </td>
                                        <td>{booking.totalPrice}</td>
                                        <td>
                                            <span className={`badge ${booking.status === 'confirmed' ? 'bg-success' :
                                                booking.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => handleDelete(booking._id)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Booking"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-block d-xl-none mt-4">
                    {currentItems.length > 0 ? currentItems.map((booking) => (
                        <div key={booking?._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="text-white mb-1">{booking?.listing?.title}</h6>
                                        <p className="text-secondary small mb-0">{booking?.bookingId}</p>
                                    </div>
                                    <span className={`badge ${booking.status === 'confirmed' ? 'bg-success' :
                                        booking.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-12">
                                        <small className="text-secondary">Guest</small>
                                        <p className="text-white mb-0">{booking.user?.username}</p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary">Check-in</small>
                                        <p className="text-white mb-0">{new Date(booking.checkIn).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary">Check-out</small>
                                        <p className="text-white mb-0">{new Date(booking.checkOut).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-secondary">Amount</small>
                                        <h5 className="text-white mb-0">{formatPrice(booking.totalPrice)}</h5>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(booking._id)}
                                        className="btn btn-sm btn-outline-danger"
                                        title="Delete Booking"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-calendar-xmark fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No bookings to display</h5>
                        </div>
                    )}
                </div>

                {bookings.length > itemsPerPage && (
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

export default AdminBookings;
