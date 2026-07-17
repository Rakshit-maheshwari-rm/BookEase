import axios from "axios";
import { useEffect, useRef, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "../../context/AuthContext";
import LazyImage from "../../components/LazyImage";
import { useCurrency } from "../../context/CurrencyContext";

function ListingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const today = new Date();
    const defaultCheckOut = new Date(today);
    defaultCheckOut.setDate(today.getDate() + 2);
    const [checkIn, setCheckIn] = useState(today.toISOString().slice(0, 10));
    const [checkOut, setCheckOut] = useState(defaultCheckOut.toISOString().slice(0, 10));
    const [guest, setGuest] = useState(1);
    const [listing, setListing] = useState();
    const { user, setUser } = useContext(AuthContext);
    const { formatPrice } = useCurrency();
    const [form, setForm] = useState({
        message: "",
        rating: "0"
    });

    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);
    const checkGuest = useRef(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/${id}`).then((res) => {
            setListing(res.data);
        }).catch((err) => {
            toast.error('Error while fetching data');
        });
    }, [id]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Select date';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const triggerPicker = (ref) => {
        if (ref.current && ref.current.showPicker) ref.current.showPicker();
    };

    function getTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);

        const seconds = Math.floor((now - past) / 1000);

        const intervals = [
            { label: "year", seconds: 31536000 },
            { label: "month", seconds: 2592000 },
            { label: "day", seconds: 86400 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 },
            { label: "second", seconds: 1 }
        ];

        for (let i = 0; i < intervals.length; i++) {
            const interval = intervals[i];
            const count = Math.floor(seconds / interval.seconds);

            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? "s" : ""}`;
            }
        }

        return "just now";
    }

    const getAmenityIcon = (amenityName) => {
        if (!amenityName) return "fa-solid fa-circle";
        const lower = amenityName.toLowerCase().trim();
        if (lower.includes("wifi")) return "fa-solid fa-wifi";
        if (lower.includes("kitchen") || lower.includes("dining") || lower.includes("breakfast")) return "fa-solid fa-utensils";
        if (lower.includes("balcony")) return "fa-solid fa-building";
        if (lower.includes("parking")) return "fa-solid fa-car";
        if (lower.includes("ac") || lower.includes("air conditioning")) return "fa-solid fa-snowflake";
        if (lower.includes("pool") && !lower.includes("table")) return "fa-solid fa-person-swimming";
        if (lower.includes("spa") || lower.includes("wellness")) return "fa-solid fa-spa";
        if (lower.includes("beach")) return "fa-solid fa-umbrella-beach";
        if (lower.includes("gym")) return "fa-solid fa-dumbbell";
        if (lower.includes("tv")) return "fa-solid fa-tv";
        if (lower.includes("heat") || lower.includes("fire")) return "fa-solid fa-fire";
        if (lower.includes("wash") || lower === "washer") return "fa-solid fa-shirt";
        if (lower.includes("dry")) return "fa-solid fa-wind";
        if (lower.includes("coffee")) return "fa-solid fa-mug-hot";
        if (lower.includes("pet")) return "fa-solid fa-paw";
        if (lower.includes("workspace")) return "fa-solid fa-laptop";
        if (lower.includes("bbq") || lower.includes("grill")) return "fa-solid fa-fire-burner";
        if (lower.includes("hot tub") || lower.includes("jacuzzi") || lower.includes("sauna")) return "fa-solid fa-hot-tub-person";
        if (lower.includes("view") && lower.includes("ocean")) return "fa-solid fa-water";
        if (lower.includes("view") && lower.includes("mountain")) return "fa-solid fa-mountain";
        if (lower.includes("view") && lower.includes("city")) return "fa-solid fa-city";
        if (lower.includes("camera") || lower.includes("security")) return "fa-solid fa-video";
        if (lower.includes("bar")) return "fa-solid fa-martini-glass";
        if (lower.includes("garden")) return "fa-brands fa-pagelines";
        if (lower.includes("patio")) return "fa-solid fa-umbrella-beach";
        if (lower.includes("ev charger") || lower.includes("charging")) return "fa-solid fa-charging-station";
        if (lower.includes("first aid")) return "fa-solid fa-kit-medical";
        if (lower.includes("extinguisher")) return "fa-solid fa-fire-extinguisher";
        if (lower.includes("smoke alarm") || lower.includes("carbon monoxide") || lower.includes("alarm")) return "fa-solid fa-bell";
        if (lower.includes("refrigerator") || lower.includes("fridge")) return "fa-solid fa-snowflake";
        if (lower.includes("dishwasher")) return "fa-solid fa-sink";
        if (lower.includes("microwave") || lower.includes("oven") || lower.includes("stove")) return "fa-solid fa-fire-burner";
        if (lower.includes("ski")) return "fa-solid fa-person-skiing";
        if (lower.includes("hammock")) return "fa-solid fa-bed";
        if (lower.includes("shower")) return "fa-solid fa-shower";
        if (lower.includes("theater") || lower.includes("cinema") || lower.includes("theatre")) return "fa-solid fa-film";
        if (lower.includes("pool table") || lower.includes("billiard")) return "fa-solid fa-bowling-ball";
        if (lower.includes("foosball")) return "fa-solid fa-futbol";
        if (lower.includes("ping pong") || lower.includes("tennis")) return "fa-solid fa-table-tennis-paddle-ball";
        if (lower.includes("basketball")) return "fa-solid fa-basketball";
        if (lower.includes("volleyball")) return "fa-solid fa-volleyball";

        return "fa-solid fa-circle";
    };

    function formatReviewDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date)) return "";
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }
    const totalRatings = listing?.reviews?.length || 0;
    const avgRating = useMemo(() => {
        return totalRatings > 0
            ? (listing.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalRatings).toFixed(1)
            : 0;
    }, [listing?.reviews, totalRatings]);

    const addToFav = async (id) => {
        if (!user) {
            toast.error("Please login to manage favorites");
            return;
        }
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/add-to-fav/${id}`, {}, { withCredentials: true }).then((res) => {
            if (res.data.success) {
                const isFav = user.favorites?.some(fav => (typeof fav === 'string' ? fav : fav._id) === id);
                if (isFav) {
                    setUser({ ...user, favorites: user.favorites.filter(fav => (typeof fav === 'string' ? fav : fav._id) !== id) });
                } else {
                    setUser({ ...user, favorites: [...(user.favorites || []), id] });
                }
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        }).catch((err) => {
            toast.error("Error updating favorites");
            console.log(err);
        });
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        } catch (error) {
            toast.error('Error while copying');
        }
    };

    const handleReview = async (e) => {
        if (e) e.preventDefault();
        try {
            if (!user) {
                toast.error("Please login to post a review");
                return;
            }
            if (!form.rating || form.rating === "0" || form.rating === 0) {
                toast.error("Please select a rating");
                return;
            }
            if (!form.message) {
                toast.error("Please write a review message");
                return;
            }

            axios.post(`${import.meta.env.VITE_BACKEND_URL}/rating/${id}/post`, {
                post: { rating: Number(form.rating), message: form.message }
            }, { withCredentials: true }).then((res) => {
                if (res.data.success) {
                    toast.success('Review posted successfully');
                    setForm({ message: "", rating: "0" })
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/${id}`).then((res) => {
                        setListing(res.data);
                    });
                } else {
                    toast.error(res.data.message || 'Failed to post review');
                }
            }).catch((err) => {
                toast.error('Failed to post review');
            });
        } catch (error) {
            toast.error('Failed to post review');
        }
    };

    const booking = (e) => {
        e.preventDefault();
        if (!checkIn || !checkOut || !guest) {
            toast.error("Please fill all the fields");
            return;
        }

        navigate(`/checkout/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guest=${guest}`);
    };

    return (
        <div className="container my-5 pb-5 mb-5 mb-lg-0">
            <div className="row">
                <div className="col-lg-8">
                    <LazyImage
                        src={listing?.result?.images?.mainImage?.startsWith?.('http') ? listing.result.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing?.result?.images?.mainImage}`}
                        alt="listing main image"
                        className="listing-main-image w-100"
                    />
                </div>
                <div className="col-lg-4 d-flex flex-wrap gap-2 ps-lg-0 mt-3 mt-lg-0">
                    <LazyImage src={listing?.result?.images?.gallery?.[0]?.startsWith?.('http') ? listing.result.images.gallery[0] : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing?.result?.images?.gallery?.[0]}`} alt="listing gallery image" className="listing-image" />
                    <LazyImage src={listing?.result?.images?.gallery?.[1]?.startsWith?.('http') ? listing.result.images.gallery[1] : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing?.result?.images?.gallery?.[1] || listing?.result?.images?.gallery?.[0]}`} alt="listing gallery image" className="listing-image" />
                    <LazyImage src={listing?.result?.images?.gallery?.[2]?.startsWith?.('http') ? listing.result.images.gallery[2] : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing?.result?.images?.gallery?.[2] || listing?.result?.images?.gallery?.[0]}`} alt="listing gallery image" className="listing-image" />
                    <LazyImage src={listing?.result?.images?.gallery?.[3]?.startsWith?.('http') ? listing.result.images.gallery[3] : `${import.meta.env.VITE_BACKEND_URL}/uploads/${listing?.result?.images?.gallery?.[3] || listing?.result?.images?.gallery?.[0]}`} alt="listing gallery image" className="listing-image" />
                </div>
            </div>
            <div className="row mt-5">
                <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mt-5">
                        <h2 className="fw-bold text-36 text-white mb-4">{listing?.result?.title}</h2>
                        <div className="d-flex gap-4">
                            <a href="#" className="text-white opacity-75" aria-label="Share" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShare();
                            }}><i className="fa-solid fa-share-nodes"></i></a>
                            <a href="#" className="text-white opacity-75" aria-label="Toggle Favorite" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToFav(listing?.result?._id);
                            }}><i className={user?.favorites?.some(fav => (typeof fav === 'string' ? fav : fav._id) === listing?.result?._id) ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart"}></i></a>
                        </div>
                    </div>

                    <p className="finder-p"><i className="fa-solid fa-location-dot me-1 text-primary"></i>{listing?.result?.address}, {listing?.result?.city}, {listing?.result?.state}, {listing?.result?.country}</p>
                    <h4 className="mt-5">About this sanctuary</h4>
                    <p className="finder-p mt-4 text-18">{listing?.result?.description}</p>
                    <div className="pt-4 d-flex flex-column flex-md-row justify-content-between gap-4 gap-md-0">
                        <div className="d-flex gap-2">
                            <div className="details-box align-items-center d-flex justify-content-center">
                                <i className="fa-solid fa-circle-info text-primary"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-14 text-white fw-bold">Hosted by {listing?.result?.owner?.username}</p>
                                <p className="text-12 mb-0">Superhost • {getTimeAgo(listing?.result?.createdAt)} hosting</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <div className="details-box align-items-center d-flex justify-content-center">
                                <i className="fa-regular fa-star text-primary"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-14 text-white fw-bold">Reviews</p>
                                <p className="text-12 mb-0">{avgRating} ({totalRatings}) reviews</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <div className="details-box align-items-center d-flex justify-content-center">
                                <i className="fa-solid fa-user-check text-primary"></i>
                            </div>
                            <div>
                                <p className="mb-0 text-14 text-white fw-bold">Enhanced Security</p>
                                <p className="text-12 mb-0">24/7 Concierge and secure grounds</p>
                            </div>
                        </div>
                    </div>
                    <h4 className="mt-5">What this place offers</h4>
                    <div className="row g-2 g-sm-3 mt-4">
                        {listing?.result?.amenities?.slice(0, 7)?.map((amenity, index) => (
                            <div className="col-6 col-md-4 col-lg-3" key={index}>
                                <div className="d-flex gap-2 ps-2 ps-sm-3 align-items-center amenities-card w-100">
                                    <i className={`${getAmenityIcon(amenity)} text-primary flex-shrink-0`}></i>
                                    <p className="text-14 mb-0 text-white fw-medium text-truncate" title={amenity}>{amenity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="all-amenities-btn mt-3 fw-medium" data-bs-toggle="modal" data-bs-target="#amenitiesModal">View all {listing?.result?.amenities?.length} amenities</button>
                    <div className="modal fade" id="amenitiesModal" tabIndex="-1" aria-labelledby="amenitiesModal" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="amenitiesModal">What this place offers</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        {listing?.result?.amenities?.map((amenity, index) => (
                                            <div className="col-12 col-md-4" key={index}>
                                                <div className="d-flex gap-3 align-items-center amenities-card h-100 m-0">
                                                    <i className={`${getAmenityIcon(amenity)} text-primary fs-5`}></i>
                                                    <p className="text-16 mb-0 text-white fw-medium text-truncate" title={amenity}>{amenity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-top mt-4 pt-5">
                        <h4>Reviews ({totalRatings} reviews)</h4>
                        <div className="row g-3 pt-3">
                            {listing?.reviews?.map((review, index) => {
                                return (
                                    <div className="col-12 col-md-6" key={index}>
                                        <div className="listing-review-card h-100 rounded-4 border-bottom">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex gap-3 pt-3">
                                                    <img src={review?.owner?.image?.startsWith?.('http') ? review.owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${review?.owner?.image}`} alt="" className="rounded-circle" />
                                                    <div>
                                                        <p className="mb-0 text-white fw-bold text-14">{review?.owner?.username}</p>
                                                        <p className="text-start text-12 opacity-75">{formatReviewDate(review?.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <i
                                                            key={star}
                                                            className={`fa-solid fa-star text-12 ${(review?.rating || 0) >= star ? 'text-primary' : ''}`}
                                                        ></i>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="mb-0 text-14 text-start lh-lg mt-3">{review?.message}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {totalRatings > 0 && (
                            <button className="all-amenities-btn mt-4 fw-medium" data-bs-toggle="modal" data-bs-target="#reviewsModal">Show all {totalRatings} reviews</button>
                        )}
                        <div className="modal fade" id="reviewsModal" tabIndex="-1" aria-labelledby="reviewModal" aria-hidden="true">
                            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                                <div className="modal-content">
                                    <div className="modal-header border-bottom border-secondary pb-3">
                                        <h1 className="modal-title fs-5 text-white fw-bold" id="reviewModal">All Reviews ({totalRatings})</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row g-4">
                                            {listing?.reviews?.map((review, index) => (
                                                <div className="col-12 col-md-6" key={index}>
                                                    <div className="review-modal-card h-100 p-4 rounded-4">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img
                                                                    src={review?.owner?.image?.startsWith?.('http') ? review.owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${review?.owner?.image}`}
                                                                    alt={review?.owner?.username}
                                                                    className="rounded-circle object-fit-cover shadow-sm"
                                                                    style={{ width: '50px', height: '50px', border: '2px solid #256af5' }}
                                                                />
                                                                <div>
                                                                    <p className="mb-0 text-white fw-bold text-16">{review?.owner?.username}</p>
                                                                    <p className="mb-0 text-12 opacity-75">{formatReviewDate(review?.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <i
                                                                        key={star}
                                                                        className={`fa-solid fa-star text-12 ${(review?.rating || 0) >= star ? 'text-primary' : ''}`}
                                                                    ></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="mb-0 text-14 lh-lg">
                                                            {review?.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {user &&
                        <div className="mt-5">
                            <h4 className="fw-bold text-white mb-4 pt-3">Share your experience</h4>
                            <form className='user-data-form' onSubmit={handleReview}>
                                <div className="row">
                                    <div className="col-6 mb-4">
                                        <label className="form-label">Rate your experience</label>
                                        <div className="d-flex gap-2 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={`fa-${form.rating >= star ? 'solid' : 'regular'} fa-star text-primary fs-5 cursor-pointer`}
                                                    value={form.rating}
                                                    onClick={() => setForm({ ...form, rating: star })}
                                                ></i>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <label htmlFor="message" className="form-label">Your review</label>
                                        <textarea name="message" id="message" className="form-control" rows="4" placeholder="Tell others about your stay..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-3">Submit Review</button>
                            </form>
                        </div>
                    }


                </div>
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="price-card px-4 py-3 mx-0 mx-lg-3" id="booking-card">
                        <form onSubmit={booking}>
                            <div className="d-flex justify-content-between align-items-center">
                                <p className="fs-3 fw-bold">{formatPrice(listing?.result?.pricing?.price)} <span className="opacity-75 text-14">/ night</span></p>
                                <p className="text-14"> <span className="text-primary"><i className="fa-regular fa-star me-1"></i></span> <span className="text-white fw-bold">{avgRating} </span> ({totalRatings})</p>
                            </div>
                            <div className="mt-2">
                                <div className="d-flex date-selection-container mt-2">
                                    <div className="w-50 p-2 check-in position-relative" onClick={() => triggerPicker(checkInRef)}>
                                        <label className="date-label">CHECK-IN</label>
                                        <div className="date-value text-white fw-bold">{formatDate(checkIn)}</div>
                                        <input
                                            ref={checkInRef}
                                            type="date"
                                            className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-50 p-2 check-out position-relative" onClick={() => triggerPicker(checkOutRef)}>
                                        <label className="date-label">CHECK-OUT</label>
                                        <div className="date-value text-white fw-bold">{formatDate(checkOut)}</div>
                                        <input
                                            ref={checkOutRef}
                                            type="date"
                                            className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="guests p-3 mt-4 position-relative">
                                <label className="date-label">GUESTS</label>
                                <div className="text-white fw-bold">{guest} Guest{guest > 1 ? 's' : ''}</div>
                                <select
                                    ref={checkGuest}
                                    value={guest}
                                    onChange={(e) => setGuest(Number(e.target.value))}
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1} Guest{i > 0 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn btn-primary book-btn mt-4 py-2">Book Now</button>
                            {(() => {
                                const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
                                const price = listing?.result?.pricing?.price || 0;
                                const cleaningFee = listing?.result?.pricing?.cleaningFee || 0;
                                const serviceFee = listing?.result?.pricing?.serviceFee || 0;
                                const subtotal = nights * price;
                                const total = subtotal + cleaningFee + serviceFee;
                                return (
                                    <>
                                        <div className="d-flex justify-content-between mt-4">
                                            <p className="opacity-75 text-decoration-underline">{nights} night{nights !== 1 ? 's' : ''} x {formatPrice(price)}</p>
                                            <p className="text-white fw-bold">{formatPrice(subtotal)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="opacity-75 text-decoration-underline">Cleaning fee</p>
                                            <p className="text-white fw-bold">{formatPrice(cleaningFee)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <p className="opacity-75 text-decoration-underline">Service fee</p>
                                            <p className="text-white fw-bold">{formatPrice(serviceFee)}</p>
                                        </div>
                                        <div className="d-flex justify-content-between border-top pt-3">
                                            <p className="fw-bold text-white text-18">Total</p>
                                            <p className="text-white fw-bold text-18">{formatPrice(total)}</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </form>
                    </div>
                    <div className="remark-card px-4 py-3 mx-3 mt-3">
                        <p className="text-12 mb-0"><i className="fa-regular fa-calendar text-primary me-2"></i>Bookings can be canceled as long as the status is <span className="fw-medium text-white">"Pending"</span>. Once a booking is <span className="fw-medium text-white">"Confirmed"</span>, it cannot be canceled.</p>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default ListingPage;