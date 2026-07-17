import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from "../../context/AuthContext";
import LazyImage from "../../components/LazyImage";

function ListingReview() {
    const { user } = useContext(AuthContext);
    const [review, setReview] = useState([]);

    useEffect(() => {
        if (!user || !user.id) return;

        try {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/rating/all/${user.id}`).then((res) => {
                setReview(res.data.allRatings);
            }).catch((err) => {
                toast.error('Failed to get reviews');
            });
        } catch (error) {
            toast.error('Failed to get reviews');
        }
    }, [user]);
    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="auth-card p-5 rounded-4">
                        <div className="text-center mb-5">
                            <span className="host-badge mb-3">LISTINGS OVERVIEW</span>
                            <h2 className="display-5 fw-bold text-white mt-2">Review Your Listings</h2>
                            <p className="text-midwhite">Manage and read all feedback left on your listings.</p>
                        </div>
                        <div className="row g-4">
                            {review?.length > 0 ? review.map((item, index) => {
                                return (
                                    <div className="col-12 col-md-6" key={index}>
                                        <div className="user-review-card rounded-4 h-100">
                                            <div
                                                className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 pt-2">
                                                <div className="d-flex gap-3">
                                                    <LazyImage src={item?.owner?.image?.startsWith?.('http') ? item.owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item?.owner?.image}`} className="user-review-img" alt="User" />
                                                    <div>
                                                        <p className="mb-1 text-white fs-5 fw-bold">{item?.listing?.title}</p>
                                                        <div className="d-flex flex-wrap gap-2 align-items-center text-14">
                                                            <div className="text-warning text-nowrap">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <i key={i} className={`fa-solid fa-star ${i < item?.rating ? "" : "fa-regular text-secondary"}`}></i>
                                                                ))}
                                                            </div>
                                                            <p className="mb-0 text-secondary">
                                                                {item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                                                                <span className="ms-2">by {item?.owner?.username}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex">
                                                <p className="mb-0 text-light lh-lg">
                                                    "{item?.message}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : <div className="col-12">
                                <div className="user-review-card rounded-4">
                                    <div
                                        className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3 pt-2">
                                        <div className="d-flex gap-3">
                                            <p className="mb-1 text-white fs-5 fw-bold">No reviews yet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListingReview;
