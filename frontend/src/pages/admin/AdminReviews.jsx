import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import "../Style.css";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rating/admin/all`, { withCredentials: true });
            if (res.data.success) {
                setReviews(res.data.ratings);
            } else {
                toast.error(res.data.message || 'Failed to fetch reviews');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching reviews');
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/rating/admin/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success('Review deleted successfully');
                fetchReviews();
            } else {
                toast.error(res.data.message || 'Failed to delete review');
            }
        } catch (error) {
            toast.error('Something went wrong while deleting review');
        }
    };

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1) : 0;
    const fiveStarReviews = reviews.filter(rev => rev.rating === 5).length;

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(reviews, 10);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">All Reviews</h3>
                    <p className="text-secondary mb-0">Monitor what users are saying about listings.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-regular fa-comments"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">TOTAL REVIEWS</p>
                        <h2 className="text-white fw-bold mb-0">{totalReviews}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-regular fa-star-half-stroke"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">AVERAGE RATING</p>
                        <h2 className="text-white fw-bold mb-0">{avgRating} <span className="fs-6 text-secondary">/ 5.0</span></h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-star"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">5-STAR REVIEWS</p>
                        <h2 className="text-white fw-bold mb-0">{fiveStarReviews}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Listing</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-white py-4">No reviews to display</td>
                                </tr>
                            ) : (
                                currentItems.map((review, index) => (
                                    <tr key={review._id}>
                                        <td>{(activePage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <span className="text-truncate d-inline-block">
                                                {review.listing?.title}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {review.owner?.image && (
                                                    <img
                                                        src={review.owner.image?.startsWith?.('http') ? review.owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${review.owner.image}`}
                                                        alt={review.owner.username}
                                                        className="rounded-circle admin-user" />
                                                )}
                                                <span>{review.owner?.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-warning">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fa-${i < review.rating ? 'solid' : 'regular'} fa-star small`}></i>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-truncate d-inline-block admin-max" title={review.message}>
                                                {review.message}
                                            </span>
                                        </td>
                                        <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Delete Review"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-block d-xl-none mt-4">
                    {currentItems.length > 0 ? currentItems.map((review) => (
                        <div key={review._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        {review.owner?.image && (
                                            <img
                                                src={review.owner.image?.startsWith?.('http') ? review.owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${review.owner.image}`}
                                                alt={review.owner.username}
                                                className="rounded-circle"
                                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <div>
                                            <h6 className="text-white mb-0">{review.owner?.username}</h6>
                                            <small className="text-secondary">{new Date(review.createdAt).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <div className="text-warning">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fa-${i < review.rating ? 'solid' : 'regular'} fa-star small`}></i>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-secondary d-block mb-1">Listing: {review.listing?.title}</small>
                                    <p className="text-white mb-0 fst-italic">"{review.message}"</p>
                                </div>
                                <div className="d-flex justify-content-end align-items-center mt-3 pt-3 border-top border-secondary">
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="btn btn-sm btn-outline-danger"
                                        title="Delete Review"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-regular fa-comments fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No reviews yet</h5>
                        </div>
                    )}
                </div>

                {reviews.length > itemsPerPage && (
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

export default AdminReviews;
