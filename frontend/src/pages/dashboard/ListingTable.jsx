import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import { useCurrency } from "../../context/CurrencyContext";

function ListingTable() {
    const [listing, setListing] = useState([]);
    const { currency, formatPrice } = useCurrency();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/host-listings`, { withCredentials: true }).then((res) => {
            setListing(res.data.listing);
        }).catch((err) => {
            toast.error('Failed to get data');
            console.log(err);
        })
    }, []);

    const deleteListing = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/listing/host-delete/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message || 'Listing deleted successfully');
                setListing(prevListings => prevListings.filter(item => item._id !== id));
            } else {
                toast.error(res.data.message || 'Failed to delete listing');
            }
        } catch (error) {
            toast.error('Failed to delete listing');
            console.log(error);
        }
    };

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(listing, 10);
    return (
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
                                    <th>ID</th>
                                    <th>Property Name</th>
                                    <th>Location</th>
                                    <th>Price/Night ({currency})</th>
                                    <th>Guests</th>
                                    <th>Bedrooms</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? currentItems.map((item, index) => {
                                    return (
                                        <tr key={item._id}>
                                            <th>{index + 1}</th>
                                            <td><span className="booking-property-name">{item?.title}</span></td>
                                            <td>{item?.city}</td>
                                            <td>{formatPrice(item?.pricing?.price)}</td>
                                            <td>{item?.personsPerRoom}</td>
                                            <td>{item?.bedrooms}</td>
                                            <td><span className="status-badge status-confirmed">{item?.isActive === true ? "Active" : "Inactive"}</span></td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Link to={`/listing/edit/${item?._id}`} className="btn btn-sm btn-outline-info rounded-pill px-3">Edit</Link>
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => deleteListing(item?._id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-white py-3">No listing yet</td>
                                    </tr>
                                )
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="d-block d-xl-none mt-4">
                        {currentItems.length > 0 ? currentItems.map((item, index) => (
                            <div key={item._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title text-white mb-0 me-2">{item?.title}</h5>
                                        <span className="status-badge status-confirmed text-nowrap">{item?.isActive === true ? "Active" : "Inactive"}</span>
                                    </div>
                                    <p className="card-text text-secondary mb-3">
                                        <i className="fa-solid fa-location-dot me-2"></i>{item?.city}
                                    </p>
                                    <div className="d-flex justify-content-between bg-dark p-3 rounded-3 mb-3">
                                        <div>
                                            <small className="text-secondary d-block mb-1">Guests</small>
                                            <span className="text-white">{item?.personsPerRoom}</span>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-secondary d-block mb-1">Bedrooms</small>
                                            <span className="text-white">{item?.bedrooms}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                                        <span className="fw-bold fs-5 text-white">{formatPrice(item?.pricing?.price)}</span>
                                        <div className="d-flex gap-2">
                                            <Link to={`/listing/edit/${item?._id}`} className="btn btn-sm btn-outline-info rounded-pill px-3">Edit</Link>
                                            <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => deleteListing(item?._id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-white py-4 border border-secondary rounded-4">No listings yet!</div>
                        )}
                    </div>
                    {listing.length > itemsPerPage && (
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
    )
}

export default ListingTable;