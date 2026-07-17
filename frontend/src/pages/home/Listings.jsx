import { NavLink } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from 'react-toastify';
import LazyImage from "../../components/LazyImage";
import { useCurrency } from "../../context/CurrencyContext";

function Listings({ listings, loading }) {
    const { user, setUser } = useContext(AuthContext);
    const { formatPrice } = useCurrency();
    function getDaysAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);

        const diffInTime = now - past;
        const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

        return diffInDays;
    }
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
                toast.error(res.data.message || "Something went wrong");
            }
        }).catch((err) => {
            toast.error("Error updating favorites");
            console.log(err);
        });
    };
    return (
        <div className="container mt-5 pt-5 pb-5">
            <div className="text-center">
                <h2 className="fw-bold text-36 mb-3 text-white">Recent Listings</h2>
                <p className="style-text-16 w-100 w-md-50 mx-auto">Stay ahead of the trend. Browse our newest additions to the Sanctuary collection, handpicked for exceptional quality.</p>
            </div>
            <div className="row g-4 mt-4">
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
                ) : (
                    listings?.slice(0, 8).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((item) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item._id}>
                            <NavLink className="text-decoration-none text-reset d-block h-100" to={`/listing/${item._id}`}>
                                <div className="card px-0 border-0 listing-card h-100">
                                    <LazyImage src={item?.images?.mainImage?.startsWith?.('http') ? item.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item?.images?.mainImage}`} className="card-img-top" alt="listings image" />
                                    <div className="card-img-overlay d-flex flex-column">
                                        <div className="d-flex justify-content-end">
                                            <div className="favorite-btn text-white" role="button" aria-label="Toggle Favorite" onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                addToFav(item._id);
                                            }}>
                                                <i className={user?.favorites?.some(fav => (typeof fav === 'string' ? fav : fav._id) === item._id) ? "fa-solid fa-heart text-danger" : "fa-regular fa-heart"}></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <h5 className="text-18 w-75">{item?.title}</h5>
                                            <p><i className="fa-regular fa-star me-1"></i>{item?.avgRating}</p>
                                        </div>
                                        <p className="text-14 text-ellipsis-2">{item?.description}</p>
                                        <div className="border-top pt-3 d-flex justify-content-between">
                                            <div>
                                                <p className="text-12 mb-0">Starting from</p>
                                                <p className="style-p">{formatPrice(item?.pricing?.price)}<span className="text-12">/ night</span></p>
                                            </div>
                                            <p className="text-12 mb-0 pt-2">Listed {getDaysAgo(item?.createdAt)} days ago</p>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    ))
                )}
            </div>
        </div >
    )
}

export default Listings;