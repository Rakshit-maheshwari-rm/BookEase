import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../pages/Style.css";

function AICopywriterModal({ show, onClose, onApply, initialData = {} }) {
    const [notes, setNotes] = useState("");
    const [propertyType, setPropertyType] = useState(initialData.propertyType || "");
    const [city, setCity] = useState(initialData.city || "");
    const [country, setCountry] = useState(initialData.country || "");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState("");
    const [editedDescription, setEditedDescription] = useState("");

    useEffect(() => {
        if (show) {
            setPropertyType(initialData.propertyType || "House");
            setCity(initialData.city || "");
            setCountry(initialData.country || "");
        }
    }, [show, initialData.propertyType, initialData.city, initialData.country]);

    if (!show) return null;

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/listing/ai-generate-copy`,
                {
                    propertyType: propertyType || initialData.propertyType || "House",
                    city: city || initialData.city || "",
                    country: country || initialData.country || "",
                    amenities: initialData.amenities || [],
                    notes: notes.trim()
                },
                { withCredentials: true }
            );

            if (res.data?.success && res.data?.copy) {
                const copy = res.data.copy;
                setResult(copy);
                if (copy.titles && copy.titles.length > 0) {
                    setSelectedTitle(copy.titles[0]);
                }
                setEditedDescription(copy.description || "");
                toast.success("Listing copy generated!");
            } else {
                toast.error(res.data?.message || "Failed to generate copy");
            }
        } catch (err) {
            console.error("AI Copywriter error:", err);
            toast.error(err.response?.data?.message || "Failed to generate copy. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!selectedTitle && !editedDescription) {
            toast.warning("Please generate copy first.");
            return;
        }

        onApply({
            title: selectedTitle,
            description: editedDescription
        });
        toast.success("Applied AI title & description to listing!");
        onClose();
    };

    const locationLabel = [city || initialData.city, country || initialData.country].filter(Boolean).join(", ") || "Location not set";
    const amenitiesCount = Array.isArray(initialData.amenities) ? initialData.amenities.length : 0;

    return (
        <div className="modal show d-block ai-search-backdrop" tabIndex="-1" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg ai-copy-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content ai-search-modal-content">
                    {/* Modal Header */}
                    <div className="modal-header ai-copy-modal-header p-4 pb-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge px-3 py-2 text-white ai-copy-badge">
                                <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Copywriter
                            </span>
                            <h5 className="modal-title text-white fw-bold mb-0">Magic Listing Title & Description</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-4 ai-copy-modal-body">
                        {/* Context summary strip */}
                        <div className="ai-copy-context-strip mb-4">
                            <div className="ai-copy-context-item">
                                <i className="fa-solid fa-house-chimney me-2 text-info"></i>
                                <span><strong>Type:</strong> {propertyType || "Stay"}</span>
                            </div>
                            <div className="ai-copy-context-item">
                                <i className="fa-solid fa-location-dot me-2 text-primary"></i>
                                <span><strong>Location:</strong> {locationLabel}</span>
                            </div>
                            <div className="ai-copy-context-item">
                                <i className="fa-solid fa-bell-concierge me-2 text-warning"></i>
                                <span><strong>Amenities:</strong> {amenitiesCount} Selected</span>
                            </div>
                        </div>

                        {/* Host highlights input */}
                        <div className="ai-copy-prompt-card mb-4">
                            <label className="ai-copy-label mb-2">
                                <i className="fa-solid fa-lightbulb me-1 text-warning"></i> Host Highlights & Special Notes (Optional)
                            </label>
                            <textarea
                                className="form-control ai-copy-notes-textarea"
                                rows="2"
                                placeholder="e.g. 5-min walk to Baga beach, private plunge pool, stunning sunset balcony, ultra-fast WiFi..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <span className="ai-copy-help-text">
                                    Our AI uses your location, amenities, and notes to craft high-converting titles & descriptions.
                                </span>
                                <button
                                    type="button"
                                    className="btn ai-copy-generate-btn"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-wand-magic-sparkles me-1"></i>
                                            {result ? "Regenerate Copy" : "Generate Magic Copy"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-info mb-3" role="status"></div>
                                <h6 className="text-white fw-semibold mb-1">AI Copywriter is crafting your listing...</h6>
                                <p className="text-secondary small mb-0">Optimizing titles and storytelling for maximum guest bookings</p>
                            </div>
                        )}

                        {/* Generated Result View */}
                        {!loading && result && (
                            <div className="ai-copy-results-container">
                                {/* Title Selection */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="ai-copy-section-title mb-0">
                                            <i className="fa-solid fa-heading me-1 text-info"></i> Choose Your Title
                                        </label>
                                        <span className="ai-copy-help-text">Click a title to select</span>
                                    </div>
                                    <div className="ai-copy-titles-grid">
                                        {result.titles?.map((titleOption, idx) => {
                                            const isSelected = selectedTitle === titleOption;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`ai-copy-title-card ${isSelected ? "selected" : ""}`}
                                                    onClick={() => setSelectedTitle(titleOption)}
                                                >
                                                    <div className="ai-copy-radio-indicator">
                                                        <i className={`fa-solid ${isSelected ? "fa-circle-check text-info" : "fa-circle text-secondary"}`}></i>
                                                    </div>
                                                    <div className="ai-copy-title-text">{titleOption}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Tagline */}
                                {result.tagline && (
                                    <div className="ai-copy-tagline-box mb-4">
                                        <i className="fa-solid fa-quote-left me-2 text-info"></i>
                                        <span>{result.tagline}</span>
                                    </div>
                                )}

                                {/* Key Highlights */}
                                {result.keyHighlights && result.keyHighlights.length > 0 && (
                                    <div className="mb-4">
                                        <label className="ai-copy-section-title mb-2">
                                            <i className="fa-solid fa-star me-1 text-warning"></i> Key Highlights
                                        </label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {result.keyHighlights.map((hl, i) => (
                                                <span key={i} className="ai-copy-highlight-chip">
                                                    <i className="fa-solid fa-check text-info"></i> {hl}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description Editor */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="ai-copy-section-title mb-0">
                                            <i className="fa-solid fa-align-left me-1 text-primary"></i> Listing Description (Editable)
                                        </label>
                                        <span className="ai-copy-help-text">You can tweak this before applying</span>
                                    </div>
                                    <textarea
                                        className="form-control ai-copy-desc-box"
                                        rows="6"
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer ai-copy-modal-footer p-4 pt-3 d-flex justify-content-between align-items-center">
                        <button type="button" className="btn btn-outline-secondary px-4 ai-copy-cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        {result && (
                            <button
                                type="button"
                                className="btn ai-copy-apply-btn px-4"
                                onClick={handleApply}
                            >
                                <i className="fa-solid fa-check-double me-2"></i> Apply to Listing
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AICopywriterModal;

