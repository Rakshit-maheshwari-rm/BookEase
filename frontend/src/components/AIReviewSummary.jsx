import { useState, useEffect } from "react";
import axios from "axios";
import "../pages/Style.css";

function AIReviewSummary({ listingId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!listingId) return;
        setLoading(true);

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/rating/${listingId}/ai-summary`).then((res) => {
            if (res.data?.success && res.data?.hasReviews) {
                setData(res.data);
            } else {
                setData(null);
            }
        }).catch(() => {
            setData(null);
        }).finally(() => {
            setLoading(false);
        });
    }, [listingId]);

    if (loading) {
        return (
            <div className="card p-3 mb-4 border-0 ai-review-loading">
                <div className="d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm text-info" role="status"></span>
                    <span className="text-secondary small">AI is analyzing verified guest reviews...</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="card p-4 mb-4 border-0 position-relative overflow-hidden ai-review-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge px-3 py-2 text-white fw-semibold ai-review-badge-insights">
                        <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Insights
                    </span>
                    <h5 className="mb-0 text-white fw-bold ai-review-title">
                        Guest Consensus
                    </h5>
                </div>

                <div className="d-flex gap-2 align-items-center flex-wrap">
                    {data.positivityScore !== undefined && (
                        <span className="badge px-3 py-2 ai-review-badge-positive">
                            <i className="fa-solid fa-thumbs-up me-1"></i>
                            {data.positivityScore}% Positive
                        </span>
                    )}
                    {data.guestVibe && (
                        <span className="badge px-3 py-2 ai-review-badge-vibe">
                            <i className="fa-solid fa-compass me-1 text-primary"></i>
                            {data.guestVibe}
                        </span>
                    )}
                </div>
            </div>
            <div className="my-3 p-3 ai-review-quote">
                <p className="mb-0 ai-review-quote-text">
                    {data.summary}
                </p>
            </div>
            <div className="row g-3 mt-1">
                <div className="col-12 col-md-6">
                    <div className="p-3 h-100 ai-review-subcard">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 ai-review-subcard-title-pros">
                            <i className="fa-solid fa-circle-check"></i>
                            <span>What Guests Loved</span>
                        </h6>
                        <ul className="list-unstyled mb-0 ai-review-list">
                            {data.pros?.map((pro, idx) => (
                                <li key={idx} className="mb-2 d-flex align-items-start gap-2 ai-review-list-item">
                                    <span className="ai-review-bullet-pros">✓</span>
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="p-3 h-100 ai-review-subcard">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 ai-review-subcard-title-cons">
                            <i className="fa-solid fa-circle-info"></i>
                            <span>Things to Keep in Mind</span>
                        </h6>
                        <ul className="list-unstyled mb-0 ai-review-list">
                            {data.cons?.map((con, idx) => (
                                <li key={idx} className="mb-2 d-flex align-items-start gap-2 ai-review-list-item">
                                    <span className="ai-review-bullet-cons">•</span>
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mt-3 pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2 ai-review-footer">
                <span className="text-secondary ai-review-footer-text">
                    <i className="fa-solid fa-shield-halved me-1 text-primary"></i> Verified Guest Sentiment
                </span>
                {data.totalReviewsAnalyzed && (
                    <span className="text-secondary opacity-75 ai-review-footer-text">
                        Synthesized from {data.totalReviewsAnalyzed} reviews • Refreshed hourly
                    </span>
                )}
            </div>
        </div>
    );
}

export default AIReviewSummary;
