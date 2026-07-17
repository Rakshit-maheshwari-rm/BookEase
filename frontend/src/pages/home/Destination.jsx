import { useState, useContext } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import LazyImage from '../../components/LazyImage';
import { useCurrency } from '../../context/CurrencyContext';
import "../Style.css";

function Destination() {
    const { user, setUser } = useContext(AuthContext);
    const { formatPrice } = useCurrency();
    const [formData, setFormData] = useState({
        city: '',
        state: '',
        country: '',
        type: '',
        maxPrice: '',
        minGuests: ''
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const location = formData.city || formData.state || formData.country;
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/destination-finder`, {
                params: {
                    location,
                    type: formData.type,
                    maxPrice: formData.maxPrice,
                    minGuests: formData.minGuests
                },
                withCredentials: true
            });
            if (res.data.success) {
                setResults(res.data.listings || []);
            } else {
                toast.error(res.data.message || 'Failed to find destinations');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching destinations');
        } finally {
            setLoading(false);
        }
    };

    const addToFav = async (id) => {
        if (!user) {
            toast.error("Please login to manage favorites");
            return;
        }
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/add-to-fav/${id}`, {}, { withCredentials: true });
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
        } catch (err) {
            toast.error("Error updating favorites");
            console.error(err);
        }
    };

    function getDaysAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffInTime = now - past;
        return Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    }

    return (
        <div className="container mt-5 pt-4 pb-5">
            <div className="text-center">
                <p className="luxury-redefined rounded-pill px-4 py-2 mb-2">Your Next Journey</p>
                <h1 className="hero-title">Destination  <span className="hero-highlight">Finder</span></h1>
                <p className="hero-subtitle">Tell us what you're looking for, and we'll find your perfect sanctuary.</p>
            </div>
            <form className="user-data-form mt-4 px-3" onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <label htmlFor="city" className="form-label">City</label>
                        <input type="text" className="form-control" name="city" id="city" placeholder="Enter city..." value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <label htmlFor="state" className="form-label">State</label>
                        <input type="text" className="form-control" name="state" id="state" placeholder="Enter state..." value={formData.state} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <label htmlFor="country" className="form-label">Country</label>
                        <input type="text" className="form-control" name="country" id="country" placeholder="Enter country..." value={formData.country} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <label htmlFor="type" className="form-label">Type</label>
                        <select name="type" className="form-control" id="type" value={formData.type} onChange={handleChange}>
                            <option value="">Select Type</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="villa">Villa</option>
                            <option value="hotel">Hotel</option>
                            <option value="cottage">Cottage</option>
                            <option value="resort">Resort</option>
                            <option value="cabin">Cabin</option>
                            <option value="guest-house">Guest House</option>
                            <option value="farmhouse">Farmhouse</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <label htmlFor="maxPrice" className="form-label">Max Budget (Per Night in INR)</label>
                        <input type="number" name="maxPrice" id="maxPrice" className="form-control" placeholder="Enter your maximum budget..." value={formData.maxPrice} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 mb-4">
                        <label htmlFor="minGuests" className="form-label">Min Guests</label>
                        <input type="number" name="minGuests" id="minGuests" className="form-control" placeholder="Enter your minimun guests..." value={formData.minGuests} onChange={handleChange} />
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-center mt-2">
                    <button type="submit" className="btn btn-primary book-btn py-2 w-100 dest-btn" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {searched && (
                <div className="mt-5 pt-4 border-top">
                    <h3 className="text-white fw-bold mb-4">Search Results</h3>
                    {results.length > 0 ? (
                        <div className="row g-4 mt-2">
                            {results.map((item) => (
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item._id}>
                                    <NavLink className="text-decoration-none text-reset d-block h-100" to={`/listing/${item._id}`}>
                                        <div className="card px-0 border-0 listing-card h-100">
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white text-18">No destinations found matching your criteria. Try adjusting your search!</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default Destination;