import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import LazyImage from "../../components/LazyImage";
import { useCurrency } from "../../context/CurrencyContext";


function Favorites() {
    const [user, setUser] = useState();
    const { formatPrice } = useCurrency();
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/check-user`, { withCredentials: true }).then((res) => {
            setUser(res.data.user);
        }).catch((err) => {

        });
    }, []);

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
        <div className="container my-4">
            <h2 className="text-white fw-bold mb-4">My Favorites</h2>
            <div className="d-flex flex-wrap gap-4 mt-5">
                {user?.favorites?.length > 0 ? (
                    user.favorites.map((item) => {
                        return (
                            <NavLink className="text-decoration-none text-reset" key={item._id} to={`/listing/${item._id}`}>
                                <div className="card px-0 border-0 listing-card">
                                    <LazyImage src={item?.images?.mainImage?.startsWith?.('http') ? item.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item?.images?.mainImage}`} className="card-img-top" alt="listing image" />
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
                                                <p className="style-p">{formatPrice(item?.pricing?.price)} <span className="text-12">/ night</span></p>
                                            </div>
                                            <p className="text-12 mb-0 pt-2">Listed {getDaysAgo(item?.createdAt)} days ago</p>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        )
                    })
                ) : (
                    <p className="text-white text-18">You haven't added any favorites yet!</p>
                )}
            </div>
        </div>
    )
}

export default Favorites;