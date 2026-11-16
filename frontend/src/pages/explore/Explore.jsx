import { useEffect, useState } from "react";
import "../Style.css";
import axios from "axios";
import { NavLink, useSearchParams, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import LazyImage from "../../components/LazyImage";
import { useCurrency } from "../../context/CurrencyContext";

function Explore() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 12;
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [aiMeta, setAiMeta] = useState(null);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        setPage(1);
    }, [searchParams]);

    useEffect(() => {
        if (location.state?.aiSearchData) {
            setListings(location.state.aiSearchData.listings || []);
            setTotalCount(location.state.aiSearchData.listings?.length || 0);
            setAiMeta(location.state.aiSearchData);
            setLoading(false);
            return;
        }

        setLoading(true);
        setAiMeta(null);
        const params = { page, limit: itemsPerPage };
        const loc = searchParams.get('location') || searchParams.get('city');
        const type = searchParams.get('type');
        const priceRange = searchParams.get('priceRange');
        const amenities = searchParams.get('amenities');

        if (loc) params.location = loc;
        if (type) params.type = type;
        if (priceRange) params.priceRange = priceRange;
        if (amenities) params.amenities = amenities;

        const endpoint = `${import.meta.env.VITE_BACKEND_URL}/listing/explore`;

        axios.get(endpoint, { params, withCredentials: true }).then((res) => {
            setListings(res.data.listings || res.data.listing || []);
            if (res.data.pagination) {
                setTotalCount(res.data.pagination.totalCount);
            } else {
                setTotalCount((res.data.listings || res.data.listing || []).length);
            }
            setLoading(false);
        }).catch((err) => {
            toast.error('Error while fetching data');
            setLoading(false);
        });
    }, [searchParams, page, location.state]);



    function getDaysAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);

        const diffInTime = now - past;
        const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

        return diffInDays;
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 px-5 pb-5">
                    {aiMeta && (
                        <div className="alert d-flex flex-wrap align-items-center justify-content-between p-3 mt-4 mb-0 ai-explore-banner">
                            <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                                <span className="badge px-3 py-2 text-white ai-vibe-badge">
                                    <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Vibe Match
                                </span>
                                <span className="text-white fw-medium">
                                    {aiMeta.query}
                                </span>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                onClick={() => {
                                    setAiMeta(null);
                                    window.history.replaceState({}, document.title);
                                    setLoading(true);
                                    const endpoint = `${import.meta.env.VITE_BACKEND_URL}/listing/explore`;
                                    axios.get(endpoint, { params: { page: 1, limit: itemsPerPage }, withCredentials: true }).then((res) => {
                                        setListings(res.data.listings || res.data.listing || []);
                                        setTotalCount(res.data.pagination?.totalCount || (res.data.listings || []).length);
                                        setLoading(false);
                                    });
                                }}
                            >
                                Clear AI Filter
                            </button>
                        </div>
                    )}
                    <div className="row g-4 mt-3">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                                    <div className="card px-0 border-0 listing-card h-100">
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
                                </div>
                            ))
                        ) : listings.length === 0 ? (
                            <div className="col-12 text-center py-5 mt-5">
                                <h3 className="text-white">No listings found</h3>
                                <p className="text-secondary mt-2">Try adjusting your filters or searching for a different destination.</p>
                            </div>
                        ) : (
                            listings.map((listing) => {
                                return (
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={listing._id}>
                                        <NavLink className="card px-0 border-0 listing-card h-100" to={`/listing/${listing._id}`}>
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
                                    </div>
                                )
                            })
                        )}
                    </div>
                    {totalCount > itemsPerPage && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination
                                activePage={page}
                                itemsCountPerPage={itemsPerPage}
                                totalItemsCount={totalCount}
                                pageRangeDisplayed={1}
                                onChange={(newPage) => {
                                    setPage(newPage);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
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
