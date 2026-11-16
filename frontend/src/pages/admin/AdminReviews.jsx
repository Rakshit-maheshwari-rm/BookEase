import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import "../Style.css";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rating/admin/all`, { withCredentials: true });
            if (res.data.success) {
                setReviews(res.data.ratings || []);
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
        if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
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

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/rating/admin/${id}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(`Review status updated to ${newStatus}`);
                setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
            } else {
                toast.error(res.data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating review status');
        }
    };

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1) : 0;
    const fiveStarReviews = reviews.filter(rev => rev.rating === 5).length;
    const flaggedReviewsCount = reviews.filter(rev => rev.status === 'flagged' || rev.moderation?.isToxic || rev.moderation?.isSpam).length;

    const filteredReviews = reviews.filter(rev => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'flagged') return rev.status === 'flagged' || rev.moderation?.isToxic || rev.moderation?.isSpam;
        return rev.status === statusFilter;
    });

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(filteredReviews, 10);

    const renderModerationBadge = (review) => {
        const isFlagged = review.status === 'flagged' || review.moderation?.isToxic || review.moderation?.isSpam;
        const isRejected = review.status === 'rejected';

        if (isRejected) {
            return (
                <span className="badge ai-mod-badge-rejected" title={review.moderation?.flagReason || "Rejected by moderation"}>
                    <i className="fa-solid fa-triangle-exclamation me-1"></i> Rejected
                </span>
            );
        }

        if (isFlagged) {
            return (
                <span className="badge ai-mod-badge-flagged" title={review.moderation?.flagReason || "Flagged for suspicious/abusive text"}>
                    <i className="fa-solid fa-flag me-1"></i> Flagged
                </span>
            );
        }

        return (
            <span className="badge ai-mod-badge-clean" title="Passed safety check">
                <i className="fa-solid fa-circle-check me-1"></i> Clean
            </span>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Reviews & AI Moderation</h3>
                    <p className="text-secondary mb-0">Monitor user sentiment and review integrity with automated moderation.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
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

                <div className="col-12 col-sm-6 col-xl-3">
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

                <div className="col-12 col-sm-6 col-xl-3">
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

                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="overview-stat-card p-4 h-100 border-start border-warning border-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper ai-mod-stat-icon">
                                <i className="fa-solid fa-shield-virus text-warning"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">AI FLAGGED REVIEWS</p>
                        <h2 className="text-warning fw-bold mb-0">{flaggedReviewsCount}</h2>
                    </div>
                </div>
            </div>

            <div className="d-flex gap-2 mb-3 ai-mod-tabs-wrapper">
                <button
                    className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('all')}
                >
                    All ({totalReviews})
                </button>
                <button
                    className={`btn btn-sm ${statusFilter === 'flagged' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                    onClick={() => setStatusFilter('flagged')}
                >
                    <i className="fa-solid fa-triangle-exclamation me-1"></i> Flagged ({flaggedReviewsCount})
                </button>
                <button
                    className={`btn btn-sm ${statusFilter === 'approved' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('approved')}
                >
                    Approved
                </button>
                <button
                    className={`btn btn-sm ${statusFilter === 'rejected' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('rejected')}
                >
                    Rejected
                </button>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table admin-reviews-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Listing</th>
                                <th>User</th>
                                <th className="text-nowrap">Rating</th>
                                <th>Comment</th>
                                <th className="text-nowrap">AI Status</th>
                                <th className="text-nowrap">Date</th>
                                <th className="admin-actions-cell pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-white py-4">No reviews match the selected filter</td>
                                </tr>
                            ) : (
                                currentItems.map((review, index) => (
                                    <tr key={review._id}>
                                        <td>{(activePage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <span className="text-truncate admin-listing-col-max" title={review.listing?.title}>
                                                {review.listing?.title || 'Unknown Stay'}
                                            </span>
                                        </td>
                                        <td className="text-nowrap">
                                            <div className="d-flex align-items-center gap-2">
                                                {review.owner?.image && (
                                                    <img
                                                        src={review.owner.image?.startsWith?.('http') ? review.owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${review.owner.image}`}
                                                        alt={review.owner.username}
                                                        className="rounded-circle admin-user"
                                                    />
                                                )}
                                                <span>{review.owner?.username}</span>
                                            </div>
                                        </td>
                                        <td className="text-nowrap">
                                            <div className="text-warning admin-reviews-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fa-${i < review.rating ? 'solid' : 'regular'} fa-star small`}></i>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <span className="text-truncate admin-comment-col-max" title={review.message}>
                                                    {review.message}
                                                </span>
                                                {review.moderation?.flagReason && review.status !== 'approved' && (
                                                    <small className="d-block text-warning text-truncate admin-comment-col-max opacity-75">
                                                        Note: {review.moderation.flagReason}
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-nowrap">{renderModerationBadge(review)}</td>
                                        <td className="text-nowrap">{new Date(review.createdAt).toLocaleDateString()}</td>
                                        <td className="admin-actions-cell pe-3">
                                            <div className="d-inline-flex align-items-center justify-content-end gap-2">
                                                {review.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review._id, 'approved')}
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Approve / Restore Review"
                                                    >
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                                        className="btn btn-sm btn-outline-warning"
                                                        title="Reject / Hide from Public"
                                                    >
                                                        <i className="fa-solid fa-ban"></i>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Permanently Delete"
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
                                    <div>{renderModerationBadge(review)}</div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-secondary d-block mb-1">Listing: {review.listing?.title}</small>
                                    <p className="text-white mb-1 fst-italic">"{review.message}"</p>
                                    {review.moderation?.flagReason && review.status !== 'approved' && (
                                        <small className="text-warning d-block">
                                            AI Note: {review.moderation.flagReason}
                                        </small>
                                    )}
                                </div>
                                <div className="d-flex justify-content-end align-items-center gap-2 mt-3 pt-3 border-top border-secondary">
                                    {review.status !== 'approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(review._id, 'approved')}
                                            className="btn btn-sm btn-outline-success"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                            className="btn btn-sm btn-outline-warning"
                                        >
                                            Reject
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="btn btn-sm btn-outline-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-regular fa-comments fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No reviews found</h5>
                        </div>
                    )}
                </div>

                {filteredReviews.length > itemsPerPage && (
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
    );
}

export default AdminReviews;
