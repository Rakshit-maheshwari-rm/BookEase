import { useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import { useCurrency } from "../../context/CurrencyContext";

function ListingBooking() {
    const [booking, setBooking] = useState([]);
    const { currency, formatPrice } = useCurrency();

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

    const handleStatus = (id, status) => {
        const statusMessages = {
            confirmed: 'Booking confirmed!',
            cancelled: 'Booking cancelled.',
            completed: 'Booking marked as completed.',
        };
        try {
            axios.put(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}`, { status }, { withCredentials: true }).then((res) => {
                if (res.data.success) {
                    toast.success(statusMessages[status] || 'Status updated successfully');
                    setBooking(prev => prev.map(b => b._id === id ? { ...b, status } : b));
                } else {
                    toast.error(res.data.message || 'Failed to update status');
                }
            }).catch((err) => {
                toast.error('Failed to update status');
            });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };
    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(booking, 10);
    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="auth-card p-5 rounded-4">
                        <div className="text-center mb-5">
                            <span className="host-badge mb-3">LISTINGS OVERVIEW</span>
                            <h2 className="display-5 fw-bold text-white mt-2">Your Property Listings</h2>
                            <p className="text-midwhite">View, manage, and update all your listed properties in one place.</p>
                        </div>
                        <div className="table-responsive d-none d-xl-block">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Booking ID</th>
                                        <th scope="col">Property Name</th>
                                        <th scope="col">Location</th>
                                        <th scope="col">Check-in</th>
                                        <th scope="col">Check-out</th>
                                        <th scope="col">Total Price</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? currentItems.map((item) => {
                                        return (
                                            <tr key={item._id}>
                                                <th scope="row">{item?.bookingId}</th>
                                                <td><span className="booking-property-name text-12">{item?.listing?.title}</span></td>
                                                <td className="booking-date">{item?.listing?.city}</td>
                                                <td className="booking-date">{item?.checkIn ? new Date(item.checkIn).toISOString().split('T')[0] : ''}</td>
                                                <td className="booking-date">{item?.checkOut ? new Date(item.checkOut).toISOString().split('T')[0] : ''}</td>
                                                <td>{formatPrice(item?.totalPrice)}</td>
                                                <td><span className={`status-badge status-${item?.status?.toLowerCase()}`}>{item?.status}</span></td>
                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-sm btn-outline-info rounded-pill px-3" data-bs-toggle="modal" data-bs-target={`#BookModal-${item._id}`}>View</button>
                                                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => handleStatus(item._id, "cancelled")} disabled={item?.status === 'cancelled'}>Cancel</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }) : <tr>
                                        <td colSpan={8} className="text-center text-white py-3">No bookings yet!</td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-block d-xl-none mt-4">
                            {currentItems.length > 0 ? currentItems.map((item) => (
                                <div key={item._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="fw-bold text-info">#{item?.bookingId}</span>
                                            <span className={`status-badge status-${item?.status?.toLowerCase()}`}>{item?.status}</span>
                                        </div>
                                        <h5 className="card-title text-white mb-2">{item?.listing?.title}</h5>
                                        <p className="card-text text-secondary mb-3">
                                            <i className="fa-solid fa-location-dot me-2"></i>{item?.listing?.city}
                                        </p>
                                        <div className="d-flex justify-content-between bg-dark p-3 rounded-3 mb-3">
                                            <div>
                                                <small className="text-secondary d-block mb-1">Check-in</small>
                                                <span className="text-white">{item?.checkIn ? new Date(item.checkIn).toISOString().split('T')[0] : ''}</span>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-secondary d-block mb-1">Check-out</small>
                                                <span className="text-white">{item?.checkOut ? new Date(item.checkOut).toISOString().split('T')[0] : ''}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                                            <span className="fw-bold fs-5 text-white">{formatPrice(item?.totalPrice)}</span>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-outline-info rounded-pill px-3" data-bs-toggle="modal" data-bs-target={`#BookModal-${item._id}`}>View</button>
                                                <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => handleStatus(item._id, "cancelled")} disabled={item?.status === 'cancelled'}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-white py-4 border border-secondary rounded-4">No bookings yet!</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {booking.length > 0 && booking.map((item) => (
                <div key={`modal-${item._id}`} className="modal fade" id={`BookModal-${item._id}`} tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5 text-dark">Booking Details : {item?.bookingId}</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="user-data-form">
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Guest Name</label>
                                            <input type="text" className="form-control" value={item?.user?.username} readOnly />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Guest Email</label>
                                            <input type="text" className="form-control" value={item?.user?.email} readOnly />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Guest Contact Number</label>
                                            <input type="text" className="form-control" value={item?.user?.phone} readOnly />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Guest Gender</label>
                                            <input type="text" className="form-control" value={item?.user?.gender} readOnly />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Check-in</label>
                                            <input type="date" className="form-control" value={item?.checkIn ? new Date(item.checkIn).toISOString().split('T')[0] : ''} readOnly />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Check-out</label>
                                            <input type="date" className="form-control" value={item?.checkOut ? new Date(item.checkOut).toISOString().split('T')[0] : ''} readOnly />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Total Price ({currency})</label>
                                            <input type="text" className="form-control" value={formatPrice(item?.totalPrice)} readOnly />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="form-label fw-bold text-white">Status</label>
                                            <input type="text" className="form-control" value={item?.status} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-outline-secondary" data-bs-dismiss="modal" onClick={() => handleStatus(item._id, 'cancelled')} disabled={item?.status === 'cancelled'}>Cancel</button>
                                {item?.status === 'pending' && (
                                    <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={() => handleStatus(item._id, 'confirmed')}>Confirm</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
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

        </>
    )
}

export default ListingBooking;
