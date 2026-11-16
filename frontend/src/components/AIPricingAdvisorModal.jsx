import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../pages/Style.css";

function AIPricingAdvisorModal({ show, onClose, onApply, propertyData = {} }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [customPrice, setCustomPrice] = useState("");
    const [customCleaningFee, setCustomCleaningFee] = useState("");
    const [customServiceFee, setCustomServiceFee] = useState("");

    useEffect(() => {
        if (!show) {
            setResult(null);
            setCustomPrice("");
            setCustomCleaningFee("");
            setCustomServiceFee("");
        }
    }, [show]);

    if (!show) return null;

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/listing/ai-suggest-pricing`,
                {
                    propertyType: propertyData.propertyType || "house",
                    city: propertyData.city || "",
                    country: propertyData.country || "",
                    bedrooms: propertyData.bedrooms || 1,
                    bathrooms: propertyData.bathrooms || 1,
                    personsPerRoom: propertyData.personsPerRoom || 2,
                    amenities: propertyData.amenities || []
                },
                { withCredentials: true }
            );

            if (res.data?.success && res.data?.pricing) {
                const pricing = res.data.pricing;
                setResult(pricing);
                setCustomPrice(pricing.suggestedPrice || "");
                setCustomCleaningFee(pricing.cleaningFee || "");
                setCustomServiceFee(pricing.serviceFee || "");
                toast.success("Optimal dynamic pricing calculated!");
            } else {
                toast.error(res.data?.message || "Failed to calculate pricing");
            }
        } catch (err) {
            console.error("AI Pricing error:", err);
            toast.error(err.response?.data?.message || "Failed to calculate dynamic pricing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!customPrice) {
            toast.warning("Please calculate or enter a nightly price.");
            return;
        }

        onApply({
            price: Number(customPrice) || 0,
            cleaningFee: Number(customCleaningFee) || 0,
            serviceFee: Number(customServiceFee) || 0
        });
        toast.success("Applied AI pricing to listing form!");
        onClose();
    };

    const locationLabel = [propertyData.city, propertyData.country].filter(Boolean).join(", ") || "Location not set";
    const amenitiesCount = Array.isArray(propertyData.amenities) ? propertyData.amenities.length : 0;
    const capacityLabel = `${propertyData.bedrooms || 1} Bed • ${propertyData.bathrooms || 1} Bath • ${propertyData.personsPerRoom || 2} Guests/room`;

    return (
        <div className="modal show d-block ai-search-backdrop" tabIndex="-1" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg ai-pricing-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content ai-search-modal-content">
                    {/* Header */}
                    <div className="modal-header ai-pricing-modal-header p-4 pb-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge px-3 py-2 text-white ai-pricing-badge">
                                <i className="fa-solid fa-chart-line me-1"></i> AI Dynamic Pricing
                            </span>
                            <h5 className="modal-title text-white fw-bold mb-0">Smart Revenue & Rate Advisor</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4 ai-pricing-modal-body">
                        {/* Context strip */}
                        <div className="ai-pricing-context-strip mb-4">
                            <div className="ai-pricing-context-item">
                                <i className="fa-solid fa-house me-2 text-info"></i>
                                <span><strong>Type:</strong> {propertyData.propertyType || "Stay"}</span>
                            </div>
                            <div className="ai-pricing-context-item">
                                <i className="fa-solid fa-location-dot me-2 text-primary"></i>
                                <span><strong>Location:</strong> {locationLabel}</span>
                            </div>
                            <div className="ai-pricing-context-item">
                                <i className="fa-solid fa-users me-2 text-warning"></i>
                                <span>{capacityLabel}</span>
                            </div>
                            <div className="ai-pricing-context-item">
                                <i className="fa-solid fa-bell-concierge me-2 text-success"></i>
                                <span>{amenitiesCount} Amenities</span>
                            </div>
                        </div>

                        {/* Initial Call to Action when not calculated yet */}
                        {!result && !loading && (
                            <div className="ai-pricing-intro-card text-center py-5 px-4 mb-3">
                                <div className="ai-pricing-intro-icon-circle mb-3">
                                    <i className="fa-solid fa-coins"></i>
                                </div>
                                <h5 className="text-white fw-bold mb-2">Maximize Occupancy & Earnings</h5>
                                <p className="text-secondary small mb-4 ai-pricing-intro-subtext">
                                    Our AI compares your location, capacity tier, and amenities against market benchmarks to find the sweet spot between high booking conversion and maximum revenue.
                                </p>
                                <button
                                    type="button"
                                    className="btn ai-pricing-calc-btn px-4 py-2"
                                    onClick={handleCalculate}
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles me-2"></i> Calculate Optimal Pricing
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-info mb-3" role="status"></div>
                                <h6 className="text-white fw-semibold mb-1">AI Revenue Advisor is analyzing market rates...</h6>
                                <p className="text-secondary small mb-0">Benchmarking seasonal rates, occupancy projections, and fair fees</p>
                            </div>
                        )}

                        {/* Calculated Results */}
                        {!loading && result && (
                            <div className="ai-pricing-results-container">
                                {/* Hero Card: Nightly Rate */}
                                <div className="ai-pricing-hero-card mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <span className="ai-pricing-hero-sublabel">RECOMMENDED BASE RATE</span>
                                            <div className="d-flex align-items-center gap-2 mt-1">
                                                <span className="ai-pricing-currency-symbol">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control ai-pricing-hero-input"
                                                    value={customPrice}
                                                    onChange={(e) => setCustomPrice(e.target.value)}
                                                />
                                                <span className="text-secondary fs-6">/ night</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-info ai-pricing-recalc-btn"
                                            onClick={handleCalculate}
                                            title="Recalculate with fresh market data"
                                        >
                                            <i className="fa-solid fa-arrows-rotate me-1"></i> Recalculate
                                        </button>
                                    </div>

                                    {/* Seasonal Range Bar */}
                                    {result.priceRange && (
                                        <div className="ai-pricing-range-wrapper pt-3 border-top border-secondary border-opacity-25">
                                            <div className="d-flex justify-content-between text-12 mb-1">
                                                <span className="text-secondary">
                                                    <i className="fa-solid fa-cloud-sun me-1 text-info"></i> Low Season: <strong>₹{result.priceRange.minPrice}</strong>
                                                </span>
                                                <span className="text-secondary">
                                                    <i className="fa-solid fa-fire me-1 text-danger"></i> Peak / Weekends: <strong>₹{result.priceRange.maxPrice}</strong>
                                                </span>
                                            </div>
                                            <div className="progress ai-pricing-range-progress">
                                                <div
                                                    className="progress-bar ai-pricing-range-fill"
                                                    role="progressbar"
                                                    style={{ width: "100%" }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Fees Breakdown (Cleaning & Service Fee) */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="ai-fee-card">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="ai-fee-label mb-0">
                                                    <i className="fa-solid fa-broom me-1 text-info"></i> Cleaning Fee (INR)
                                                </label>
                                                <span className="badge bg-dark text-secondary">One-time</span>
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text ai-fee-addon">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control ai-fee-input"
                                                    value={customCleaningFee}
                                                    onChange={(e) => setCustomCleaningFee(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="ai-fee-card">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="ai-fee-label mb-0">
                                                    <i className="fa-solid fa-receipt me-1 text-primary"></i> Service Fee (INR)
                                                </label>
                                                <span className="badge bg-dark text-secondary">Standard</span>
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text ai-fee-addon">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control ai-fee-input"
                                                    value={customServiceFee}
                                                    onChange={(e) => setCustomServiceFee(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Reasoning Box */}
                                {result.marketInsight && (
                                    <div className="ai-market-insight-card mb-4">
                                        <div className="d-flex align-items-start gap-2">
                                            <i className="fa-solid fa-lightbulb text-warning fs-5 mt-1"></i>
                                            <div>
                                                <h6 className="text-white fw-bold mb-1">Market Benchmark Reasoning</h6>
                                                <p className="ai-market-insight-text mb-0">{result.marketInsight}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Revenue & Occupancy Tips */}
                                {result.revenueTips && result.revenueTips.length > 0 && (
                                    <div className="mb-2">
                                        <label className="ai-pricing-section-title mb-2">
                                            <i className="fa-solid fa-arrow-trend-up me-1 text-success"></i> Revenue Optimization Strategies
                                        </label>
                                        <div className="d-flex flex-column gap-2">
                                            {result.revenueTips.map((tip, i) => (
                                                <div key={i} className="ai-revenue-tip-item">
                                                    <i className="fa-solid fa-circle-check text-info mt-1 me-2 flex-shrink-0"></i>
                                                    <span>{tip}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer ai-pricing-modal-footer p-4 pt-3 d-flex justify-content-between align-items-center">
                        <button type="button" className="btn btn-outline-secondary px-4 ai-copy-cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        {result && (
                            <button
                                type="button"
                                className="btn ai-pricing-apply-btn px-4"
                                onClick={handleApply}
                            >
                                <i className="fa-solid fa-check-double me-2"></i> Apply Pricing to Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIPricingAdvisorModal;

