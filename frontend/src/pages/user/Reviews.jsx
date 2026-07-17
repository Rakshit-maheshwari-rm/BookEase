import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from 'react-toastify';

function Reviews() {
    const [rating, getRating] = useState([]);
    const { user } = useContext(AuthContext);
    const [ratingNum, setRatingNum] = useState(0);
    const [editMessage, setEditMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/rating/user/${userId}`, { withCredentials: true }).then((res) => {
            getRating(res.data.message || []);
        }).catch((err) => {
            toast.error("Failed to get reviews");
            console.error(err);
        });
    }, [userId]);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/rating/delete/${id}`, { withCredentials: true });
            if (res.data.success) {
                getRating(prev => prev.filter(r => r._id !== id));
                toast.success("Review deleted successfully");
            } else {
                toast.error(res.data.message || "Failed to delete review");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete review");
        }
    };

    const openEditModal = (rev) => {
        setEditingId(rev._id);
        setRatingNum(rev.rating);
        setEditMessage(rev.message);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/rating/update/${editingId}`,
                { message: editMessage, rating: ratingNum },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success("Review updated successfully");
                getRating(prev => prev.map(r => r._id === editingId ? { ...r, message: editMessage, rating: ratingNum } : r));
                setEditingId(null);
                setEditMessage("");
                setRatingNum(0);
            } else {
                toast.error(res.data.message || "Failed to update review");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update review");
        }
    };
    return (
        <div className="container my-4">
            <h2 className='text-white fw-bold mb-4'>My Reviews</h2>
            <div className="row g-4">
                {rating.length > 0 ? (
                    rating.map((rev) => (
                        <div className="col-6" key={rev._id}>
                            <div className="user-review-card rounded-4 h-100">
                                <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 pt-2">
                                    <div className="d-flex gap-3">
                                        <img
                                            src={rev?.listing?.images?.mainImage?.startsWith?.('http') ? rev.listing.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${rev?.listing?.images?.mainImage}`}
                                            className="user-review-img"
                                            alt="Property"
                                        />
                                        <div>
                                            <p className="mb-1 text-white fs-5 fw-bold">{rev?.listing?.title || "Property"}</p>
                                            <div className="d-flex gap-3 align-items-center text-14">
                                                <div className="text-warning">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={i < rev.rating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                                    ))}
                                                </div>
                                                <p className="mb-0 text-secondary">
                                                    {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="Edit Review" data-bs-toggle="modal" data-bs-target="#reviewModal" onClick={() => openEditModal(rev)}>
                                            <i className="fa-regular fa-pen-to-square"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="Delete Review" onClick={() => handleDelete(rev?._id)}>
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <p className="mb-0 text-light lh-lg">
                                        "{rev.message}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <p className="text-white">You haven't posted any reviews yet.</p>
                    </div>
                )
                }
            </div >
            <div className="modal fade" id="reviewModal" tabIndex="-1" aria-labelledby="reviewModal" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="reviewModal">Edit Review</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form className='user-data-form' onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-6 mb-4">
                                        <label className="form-label text-white">Rate your experience</label>
                                        <div className="d-flex gap-2 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={`fa-${ratingNum >= star ? 'solid' : 'regular'} fa-star text-primary fs-5 cursor-pointer`}
                                                    onClick={() => setRatingNum(star)}
                                                ></i>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 mb-4">
                                        <label htmlFor="review" className="form-label text-white">Your review</label>
                                        <textarea
                                            name=""
                                            id="review"
                                            className="form-control"
                                            rows="4"
                                            placeholder="Tell others about your stay..."
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-3" data-bs-dismiss="modal">Submit Review</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Reviews;