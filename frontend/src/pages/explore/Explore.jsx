import { useEffect, useState } from "react";
import "../Style.css";
import axios from "axios";
import { NavLink, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';
import LazyImage from "../../components/LazyImage";
import { useCurrency } from "../../context/CurrencyContext";

function Explore() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        setLoading(true);
        const params = {};
        const location = searchParams.get('location') || searchParams.get('city');
        const type = searchParams.get('type');
        const priceRange = searchParams.get('priceRange');
        const amenities = searchParams.get('amenities');

        if (location) params.location = location;
        if (type) params.type = type;
        if (priceRange) params.priceRange = priceRange;
        if (amenities) params.amenities = amenities;

        const endpoint = `${import.meta.env.VITE_BACKEND_URL}/listing/explore`;

        axios.get(endpoint, { params, withCredentials: true }).then((res) => {
            setListings(res.data.listings || res.data.listing || []);
            setLoading(false);
        }).catch((err) => {
            toast.error('Error while fetching data');
            setLoading(false);
        });
    }, [searchParams]);



    function getDaysAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);

        const diffInTime = now - past;
        const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

        return diffInDays;
    }

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(listings, 12);
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 px-5 pb-5">
                    <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-4 mt-5">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <div className="card px-0 border-0 listing-card explore-card" key={index}>
                                    <div className="skeleton skeleton-img"></div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <div className="skeleton skeleton-text w-75"></div>
                                            <div className="skeleton skeleton-text w-25 ms-3"></div>
                                        </div>
                                        <div className="skeleton skeleton-text w-100"></div>
                                        <div className="skeleton skeleton-text w-75 mb-3"></div>

                                        <div className="border-top pt-3 d-flex justify-content-between">
                                            <div className="skeleton skeleton-text w-25"></div>
                                            <div className="skeleton skeleton-text w-25"></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : currentItems.length === 0 ? (
                            <div className="col-12 text-center py-5 mt-5">
                                <h3 className="text-white">No listings found</h3>
                                <p className="text-secondary mt-2">Try adjusting your filters or searching for a different destination.</p>
                            </div>
                        ) : (
                            currentItems.map((listing) => {
                                return (
                                    <NavLink className="card px-0 border-0 listing-card explore-card" key={listing._id} to={`/listing/${listing._id}`}>
                                        <LazyImage src={listing?.images?.mainImage?.startsWith?.('http') ? listing.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing?.images?.mainImage}`} className="card-img-top" alt="listing image" />
                                        <div className="card-img-overlay d-flex flex-column">
                                            <div className="d-flex justify-content-end">
                                                <div className="favorite-btn text-white">
                                                    <i className="fa-regular fa-heart"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <h5 className="text-18 w-75">{listing?.title}</h5>
                                                <p><i className="fa-regular fa-star me-1"></i>{(listing?.avgRating || 0).toFixed(1)}</p>
                                            </div>
                                            <p className="text-14 text-ellipsis-2">{listing?.description}</p>
                                            <div className="border-top pt-3 d-flex justify-content-between">
                                                <div>
                                                    <p className="text-12 mb-0">Starting from</p>
                                                    <p className="style-p">{formatPrice(listing?.pricing?.price)}<span className="text-12">/ night</span></p>
                                                </div>
                                                <p className="text-12 mb-0 pt-2">Listed {getDaysAgo(listing?.createdAt)} days ago</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                )
                            })
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
        </div>
    )
}

export default Explore;