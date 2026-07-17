import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCurrency } from "../../context/CurrencyContext";
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import "../Style.css";

function AdminListings() {
    const { currency, formatPrice } = useCurrency();
    const [listings, setListings] = useState([]);

    const fetchListings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/admin/all`, { withCredentials: true });
            if (res.data.success) {
                setListings(res.data.listings);
            } else {
                toast.error(res.data.message || 'Failed to fetch listings');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching listings');
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/listing/admin/${id}/status`, { isActive: newStatus }, { withCredentials: true });
            if (res.data.success) {
                toast.success(`Listing status updated to ${newStatus ? 'Active' : 'Inactive'}`);
                fetchListings();
            } else {
                toast.error(res.data.message || 'Failed to update listing status');
            }
        } catch (error) {
            toast.error('Something went wrong while updating status');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/listing/admin/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success('Listing deleted successfully');
                fetchListings();
            } else {
                toast.error(res.data.message || 'Failed to delete listing');
            }
        } catch (error) {
            toast.error('Something went wrong while deleting listing');
        }
    };

    const totalListings = listings.length;
    const activeListings = listings.filter(listing => listing.isActive).length;
    const inactiveListings = listings.filter(listing => !listing.isActive).length;

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(listings, 10);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">All Listings</h3>
                    <p className="text-secondary mb-0">Monitor and manage all properties on the platform.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-house"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">TOTAL LISTINGS</p>
                        <h2 className="text-white fw-bold mb-0">{totalListings}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-house-circle-check"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">ACTIVE LISTINGS</p>
                        <h2 className="text-white fw-bold mb-0">{activeListings}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-house-circle-xmark"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">INACTIVE LISTINGS</p>
                        <h2 className="text-white fw-bold mb-0">{inactiveListings}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Title</th>
                                <th>Host</th>
                                <th>Location</th>
                                <th>Price ({currency})</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-white py-4">No listings to display</td>
                                </tr>
                            ) : (
                                currentItems.map((listing, index) => (
                                    <tr key={listing?._id}>
                                        <td>{(activePage - 1) * itemsPerPage + index + 1}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <img
                                                    src={listing.images?.mainImage?.startsWith?.('http') ? listing.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing.images?.mainImage}`}
                                                    alt={listing?.title}
                                                    className="admin-listing"
                                                />
                                                <span className="text-truncate">
                                                    {listing?.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{listing.owner?.username}</td>
                                        <td>{listing?.city}, {listing?.country}</td>
                                        <td>{listing?.pricing?.price}</td>
                                        <td>
                                            <span className={`badge ${listing?.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {listing?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(listing?._id, listing?.isActive)}
                                                    className={`btn btn-sm ${listing?.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                    title={listing?.isActive ? 'Deactivate Listing' : 'Activate Listing'}
                                                >
                                                    <i className={`fa-solid ${listing?.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing?._id)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Listing"
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
                    {currentItems.length > 0 ? currentItems.map((listing) => (
                        <div key={listing._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                                        {listing?.images?.mainImage && (
                                            <img
                                                src={listing.images.mainImage?.startsWith?.('http') ? listing.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing.images.mainImage}`}
                                                alt={listing?.title}
                                                className="admin-listing rounded admin-listing-sm flex-shrink-0"
                                            />
                                        )}
                                        <div className="overflow-hidden">
                                            <h6 className="text-white mb-1 text-truncate">{listing?.title}</h6>
                                            <p className="text-secondary small mb-0 text-truncate">{listing?.owner?.username}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${listing?.isActive ? 'bg-success' : 'bg-danger'} ms-2 flex-shrink-0`}>
                                        {listing?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-12">
                                        <small className="text-secondary">Location</small>
                                        <p className="text-white mb-0">{listing?.city}, {listing?.country}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-secondary">Price / night</small>
                                        <h5 className="text-white mb-0">{formatPrice(listing?.pricing?.price)}</h5>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange(listing?._id, listing?.isActive)}
                                            className={`btn btn-sm ${listing?.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                            title={listing?.isActive ? 'Deactivate Listing' : 'Activate Listing'}
                                        >
                                            <i className={`fa-solid ${listing?.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(listing?._id)}
                                            className="btn btn-sm btn-outline-danger" title="Delete Listing">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-house-circle-xmark fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No listings yet</h5>
                        </div>
                    )}
                </div>

                    {listings.length > itemsPerPage && (
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

export default AdminListings;
