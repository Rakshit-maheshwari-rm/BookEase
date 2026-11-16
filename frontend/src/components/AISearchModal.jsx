import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../pages/Style.css";


function AISearchModal({ show, onClose, onResultsFound }) {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const navigate = useNavigate();

    if (!show) return null;

    const handleSearch = async (queryToUse) => {
        const queryText = queryToUse || prompt;
        if (!queryText.trim()) return;

        setLoading(true);
        setExplanation(null);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/listing/ai-search`, {
                query: queryText
            });

            if (res.data?.success) {
                setExplanation(res.data.explanation);
                if (onResultsFound) {
                    onResultsFound(res.data);
                } else {
                    navigate("/explore", { state: { aiSearchData: res.data } });
                    onClose();
                }
            } else {
                toast.error(res.data?.message || "AI Search failed");
            }
        } catch (err) {
            console.error("AI Search failed:", err);
            toast.error(err.response?.data?.message || "AI Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block ai-search-backdrop" tabIndex="-1" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content ai-search-modal-content">
                    <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center pb-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge px-3 py-2 text-white ai-vibe-badge">
                                <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Vibe Matcher
                            </span>
                            <h5 className="modal-title text-white fw-bold mb-0">Search with Natural Language</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
                    </div>

                    <div className="modal-body p-4 pt-3">
                        <p className="text-secondary small mb-4">
                            Describe your ideal stay in your own words. Mention the vibe, location, budget, or must-have amenities.
                        </p>
                        <div className="ai-search-box-wrapper mb-3">
                            <i className="fa-solid fa-magnifying-glass text-secondary me-2 fs-6"></i>
                            <input
                                type="text"
                                className="ai-search-box-input"
                                placeholder="e.g. Romantic villa in Goa with private pool under ₹5000..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="ai-search-btn-action"
                                onClick={() => handleSearch()}
                                disabled={loading || !prompt.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Matching...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-wand-magic-sparkles me-1"></i>
                                        Match Vibe
                                    </>
                                )}
                            </button>
                        </div>

                        {loading && (
                            <div className="d-flex align-items-center gap-2 mt-3 text-info small">
                                <span className="spinner-border spinner-border-sm"></span>
                                <span>AI is finding stays matching your vibe...</span>
                            </div>
                        )}

                        {explanation && (
                            <div className="p-3 mt-3 ai-explanation-box">
                                <p className="mb-0 text-white small">
                                    <i className="fa-solid fa-robot me-1 text-info"></i> {explanation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AISearchModal;
