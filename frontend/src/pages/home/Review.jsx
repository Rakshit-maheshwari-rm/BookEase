import { useState, useEffect } from "react";
import axios from "axios";

const formatGuestName = (rawName) => {
    if (!rawName) return "Verified Guest";
    return String(rawName).replace(/([a-z])([A-Z])/g, (match, p1, p2) => `${p1} ${p2}`);
};

function Review() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/rating/top-reviews`)
            .then((res) => {
                if (isMounted && res.data?.success && Array.isArray(res.data.reviews)) {
                    setReviews(res.data.reviews);
                }
            })
            .catch((err) => {
                console.error("Failed to load reviews:", err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!loading && reviews.length === 0) {
        return null;
    }

    const displayList = reviews.slice(0, 3);

    return (
        <div className="container mt-5 pt-5 pb-5">
            <div className="text-center mb-5">
                <span className="badge rounded-pill px-3 py-2 text-uppercase mb-2 review-badge">
                    Verified Guest Experiences
                </span>
                <h2 className="text-36 fw-bold text-white mb-2">What Our Guests Say</h2>
                <p className="style-text-16 w-100 w-md-50 mx-auto">
                    Real, verified feedback from travelers who booked and stayed through BookEase.
                </p>
            </div>

            <div className="row g-4 text-start">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div className="col-12 col-md-6 col-lg-4" key={i}>
                            <div className="guest-review-card rounded-4 h-100 d-flex flex-column">
                                <div className="skeleton skeleton-text w-25 mb-3"></div>
                                <div className="skeleton skeleton-text w-100 mb-2"></div>
                                <div className="skeleton skeleton-text w-75 mb-4"></div>
                                <div className="d-flex align-items-center gap-3 pt-3 mt-auto border-top border-secondary border-opacity-25">
                                    <div className="skeleton rounded-circle review-skeleton-avatar"></div>
                                    <div className="flex-grow-1">
                                        <div className="skeleton skeleton-text w-50 mb-1"></div>
                                        <div className="skeleton skeleton-text w-75"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    displayList.map((item) => {
                        const avatarUrl = item?.owner?.image?.startsWith("http")
                            ? item.owner.image
                            : (item?.owner?.image
                                ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${item.owner.image}`
                                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80");

                        const stayTitle = item?.listing?.title
                            ? `Stayed at ${item.listing.title}`
                            : (item?.listing?.city ? `Stay in ${item.listing.city}` : "Verified BookEase Stay");

                        return (
                            <div className="col-12 col-md-6 col-lg-4" key={item._id}>
                                <div className="guest-review-card rounded-4 h-100 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex gap-1 text-warning">
                                            {Array.from({ length: Number(item?.rating) || 5 }).map((_, i) => (
                                                <i key={i} className="fa-solid fa-star fs-6"></i>
                                            ))}
                                        </div>
                                        <i className="fa-solid fa-quote-right fs-4 opacity-50 review-quote-icon"></i>
                                    </div>

                                    <p className="flex-grow-1 mb-4 review-quote-text">
                                        "{item?.message}"
                                    </p>

                                    <div className="d-flex align-items-center gap-3 pt-3 mt-auto border-top border-secondary border-opacity-25">
                                        <img
                                            src={avatarUrl}
                                            alt={formatGuestName(item?.owner?.username)}
                                            className="rounded-circle object-fit-cover review-avatar"
                                        />
                                        <div className="overflow-hidden">
                                            <h6 className="mb-0 text-white fw-bold text-truncate fs-6">
                                                {formatGuestName(item?.owner?.username)}
                                            </h6>
                                            <small className="text-secondary text-truncate d-block">
                                                {stayTitle}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default Review;
