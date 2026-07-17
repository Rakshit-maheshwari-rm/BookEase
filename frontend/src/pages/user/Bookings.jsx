import { useEffect, useState } from 'react';
import '../Style.css';
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import { useCurrency } from '../../context/CurrencyContext';

function Bookings() {
    const [booking, setBooking] = useState([]);
    const { formatPrice } = useCurrency();
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/get-booking`, { withCredentials: true }).then((res) => {
            setBooking(res.data.booking)
        }).catch((err) => {
            toast.error('Failed to fetch bookings!');
        });
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/booking/${id}`, { status: 'cancelled' }, { withCredentials: true });
            if (res.data.success) {
                setBooking(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
                toast.success('Booking cancelled successfully');
            } else {
                toast.error(res.data.message || 'Failed to cancel booking');
            }
        } catch (err) {
            toast.error("Failed to cancel booking");
        }
    };

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(booking, 10);

    return (
        <div className="container my-4">
            <h2 className='text-white fw-bold mb-4'>My Bookings</h2>
            <div className="table-responsive">
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
                        {currentItems.length > 0 ? currentItems.map((book) => {
                            return (
                                <tr key={book?._id}>
                                    <th scope="row">{book?.bookingId}</th>
                                    <td><span className="booking-property-name">{book?.listing?.title}</span></td>
                                    <td className="booking-date">{book?.listing?.city}</td>
                                    <td className="booking-date">{book?.checkIn?.split("T")[0]}</td>
                                    <td className="booking-date">{book?.checkOut?.split("T")[0]}</td>
                                    <td>{formatPrice(book?.totalPrice)}</td>
                                    <td>
                                        <span className={`status-badge status-${book?.status?.toLowerCase()}`}>
                                            {book?.status ? book.status.charAt(0).toUpperCase() + book.status.slice(1).toLowerCase() : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Link to={`/listing/${book?.listing?._id}`} className="btn btn-sm btn-outline-info rounded-pill px-3">View</Link>
                                            <button
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                                onClick={() => handleCancel(book?._id)}
                                                disabled={book?.status !== 'pending'}>
                                                Cancel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }) :
                            <tr>
                                <td colSpan="8" className="text-center text-white py-3">No bookings found</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>

            {booking?.length > itemsPerPage && (
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

            <div className="mt-5 p-4 rounded booking-rule">
                <h5 className="text-white fw-bold mb-3">Booking Policies & Rules</h5>
                <ul className="style-midwhite mb-0 lh-lg" >
                    <li><strong className="text-white">Check-in & Check-out:</strong> Standard check-in time is 3:00 PM, and check-out is by 11:00 AM local time.</li>
                    <li><strong className="text-white">Cancellation Policy:</strong> Bookings can be canceled as long as the status is "Pending". Once a booking is "Confirmed", it cannot be canceled.</li>
                    <li><strong className="text-white">Property Damages:</strong> Any damages to the property during your stay will be charged to the payment method on file.</li>
                    <li><strong className="text-white">Support:</strong> For immediate assistance or special requests, please contact our 24/7 customer support via the Help Center.</li>
                </ul>
            </div>
        </div>
    )
}

export default Bookings;