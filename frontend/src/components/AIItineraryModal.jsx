import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../pages/Style.css";

function AIItineraryModal({ show, onClose, bookingId, bookingTitle }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);

    useEffect(() => {
        if (!show || !bookingId) return;

        const fetchItinerary = async () => {
            setLoading(true);
            setError(null);
            setData(null);
            setSelectedDay(0);

            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/itinerary`,
                    { withCredentials: true }
                );

                if (res.data?.success) {
                    setData(res.data);
                } else {
                    setError(res.data?.message || "Failed to load itinerary");
                }
            } catch (err) {
                console.error("Failed to fetch itinerary:", err);
                const msg = err.response?.data?.message || "Failed to load travel itinerary. Please try again.";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchItinerary();
    }, [show, bookingId]);

    if (!show) return null;

    const itinerary = data?.itinerary;
    const days = itinerary?.days || [];
    const activeDay = days[selectedDay] || days[0];

    return (
        <div className="modal show d-block ai-search-backdrop" tabIndex="-1" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg ai-itinerary-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content ai-search-modal-content">
                    <div className="modal-header ai-itinerary-header p-4 pb-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge px-3 py-2 text-white ai-itinerary-badge">
                                <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Travel Concierge
                            </span>
                            <h5 className="modal-title text-white fw-bold mb-0">
                                {itinerary?.tripTitle || `${data?.destination || bookingTitle || "Trip"} Itinerary`}
                            </h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-info mb-3" role="status"></div>
                                <h6 className="text-white fw-semibold mb-1">AI Concierge is designing your itinerary...</h6>
                                <p className="text-secondary small mb-0">
                                    Curating optimal daily activities, regional culinary gems, and packing advice for your stay.
                                </p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="text-center py-5">
                                <i className="fa-solid fa-triangle-exclamation text-warning fs-1 mb-3"></i>
                                <h6 className="text-white fw-semibold mb-2">{error}</h6>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-info rounded-pill px-4"
                                    onClick={() => {
                                        setError(null);
                                        setLoading(true);
                                        axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/${bookingId}/itinerary`, { withCredentials: true })
                                            .then(res => { if (res.data?.success) setData(res.data); })
                                            .catch(() => setError("Retry failed. Please check your connection."))
                                            .finally(() => setLoading(false));
                                    }}
                                >
                                    <i className="fa-solid fa-rotate-right me-1"></i> Retry
                                </button>
                            </div>
                        )}

                        {itinerary && !loading && (
                            <div>
                                <div className="ai-itinerary-subcard mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="fa-solid fa-compass text-info"></i>
                                            <span className="text-white fw-semibold">Destination Overview</span>
                                        </div>
                                        <span className="badge bg-dark border border-secondary text-info rounded-pill px-3 py-1">
                                            {itinerary.daysCount || days.length} Days Planned
                                        </span>
                                    </div>
                                    <p className="text-secondary small mb-0 leading-relaxed">
                                        {itinerary.tripOverview}
                                    </p>
                                </div>

                                {days.length > 0 && (
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-secondary small">
                                            <i className="fa-regular fa-calendar-days text-info"></i>
                                            <span>Daily Schedule:</span>
                                        </div>
                                        <div className="ai-day-tabs-container">
                                            {days.map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`ai-day-tab-btn ${selectedDay === idx ? "active" : ""}`}
                                                    onClick={() => setSelectedDay(idx)}
                                                >
                                                    Day {day.dayNumber}: {day.theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeDay && (
                                    <div className="row g-3 mb-4">
                                        <div className="col-12 col-md-4">
                                            <div className="ai-slot-card">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="fa-solid fa-sun ai-slot-icon-morning"></i>
                                                    <span className="text-white small fw-bold text-uppercase">Morning</span>
                                                </div>
                                                <h6 className="ai-slot-title">{activeDay.morning?.activity}</h6>
                                                <p className="ai-slot-desc">{activeDay.morning?.description}</p>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <div className="ai-slot-card">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="fa-solid fa-cloud-sun ai-slot-icon-afternoon"></i>
                                                    <span className="text-white small fw-bold text-uppercase">Afternoon</span>
                                                </div>
                                                <h6 className="ai-slot-title">{activeDay.afternoon?.activity}</h6>
                                                <p className="ai-slot-desc">{activeDay.afternoon?.description}</p>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <div className="ai-slot-card">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="fa-solid fa-moon ai-slot-icon-evening"></i>
                                                    <span className="text-white small fw-bold text-uppercase">Evening</span>
                                                </div>
                                                <h6 className="ai-slot-title">{activeDay.evening?.activity}</h6>
                                                <p className="ai-slot-desc">{activeDay.evening?.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-7">
                                        <div className="ai-itinerary-subcard h-100">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <i className="fa-solid fa-utensils text-warning"></i>
                                                <h6 className="text-white mb-0 fw-semibold">Authentic Local Flavors</h6>
                                            </div>
                                            <div className="d-flex flex-column gap-2">
                                                {itinerary.localCuisine?.map((food, idx) => (
                                                    <div key={idx} className="ai-dish-card">
                                                        <div className="text-info fw-semibold small mb-1">
                                                            <i className="fa-solid fa-circle-check me-1"></i> {food.dish}
                                                        </div>
                                                        <p className="ai-slot-desc small">{food.whyTry}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-5">
                                        <div className="ai-itinerary-subcard h-100">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <i className="fa-solid fa-suitcase-rolling text-info"></i>
                                                <h6 className="text-white mb-0 fw-semibold">Packing Essentials</h6>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2">
                                                {itinerary.packingTips?.map((tip, idx) => (
                                                    <span key={idx} className="ai-packing-chip">
                                                        <i className="fa-solid fa-check text-info"></i> {tip}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {itinerary.localTip && (
                                    <div className="ai-local-tip-box mb-2">
                                        <div className="d-flex align-items-start gap-2">
                                            <i className="fa-solid fa-lightbulb text-warning mt-1"></i>
                                            <div>
                                                <span className="text-white fw-semibold small d-block mb-1">Local Concierge Tip</span>
                                                <p className="text-secondary small mb-0">{itinerary.localTip}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0 pt-0 px-4 pb-4 d-flex justify-content-between align-items-center">
                        <span className="text-secondary small">
                            {data?.cached ? (
                                <><i className="fa-solid fa-bolt text-warning me-1"></i> Instant cached itinerary</>
                            ) : (
                                <><i className="fa-solid fa-robot text-info me-1"></i> AI-generated plan</>
                            )}
                        </span>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-sm btn-outline-light rounded-pill px-4" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIItineraryModal;