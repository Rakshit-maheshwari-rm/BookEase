import { Navigate, NavLink, useNavigate, Link } from "react-router-dom";
import "./Style.css"
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import LazyImage from "../components/LazyImage";
import { useCurrency } from "../context/CurrencyContext";
import AISearchModal from "../components/AISearchModal";

const categories = [
    "Luxury Villa", "Beachfront", "Mountain Cabin", "Urban Apartment",
    "Countryside Cottage", "Boutique Hotel", "Treehouse", "Farmhouse",
    "Chalet", "Houseboat", "Mansion", "Castle", "Glamping", "Tiny Home",
    "Camper/RV", "Yurt", "Barn", "Windmill", "Lighthouse", "Cave",
    "Igloo", "Riad", "Trullo", "Ryokan", "Shepherd's Hut", "Tent",
    "Dome", "Earthhouse", "House", "Apartment", "Villa", "Hotel",
    "Cottage", "Resort", "Cabin", "Guest House"
];

function Navbar() {
    const { user, setUser } = useContext(AuthContext);
    const { currency, setCurrency, availableCurrencies, formatPrice } = useCurrency();
    const [form, setForm] = useState({
        location: "",
        type: "",
        priceRange: "",
        minGuests: ""
    });
    const [result, setResult] = useState(null);
    const navigate = useNavigate();
    const [showAiModal, setShowAiModal] = useState(false);
    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/logout`, {}, { withCredentials: true });
            setUser(null);
            toast.success('Logout Successfully');
            navigate('/login');
        } catch (err) {
            toast.error('Failed to logout');
        }
    }
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/search`, { params: form, withCredentials: true }).then((res) => {
            setResult(res.data.listings);
        }).catch((err) => {
            toast.error('Failed to search');
        });
    }
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
        <nav className="navbar navbar-expand-lg custom-navbar border-bottom">
            <div className="container">
                <a className="navbar-brand custom-brand" href="/">Book<span className="brand-highlight">Ease</span></a>
                <button className="navbar-toggler custom-toggler border-0 shadow-none px-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <i className="fa-solid fa-bars text-white fs-2"></i>
                </button>

                <div className="offcanvas offcanvas-end text-bg-dark" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                    <div className="offcanvas-header border-bottom border-secondary border-opacity-25">
                        <h5 className="offcanvas-title fw-bold" id="offcanvasNavbarLabel">BookEase</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body d-flex flex-column flex-lg-row align-items-lg-center">
                        <ul className="navbar-nav me-auto ms-lg-5 gap-0 gap-lg-4 mb-2 mb-lg-0 mt-3 mt-lg-0 fs-5 fs-lg-6">
                            <li className="nav-item mb-2 mb-lg-0">
                                <NavLink className="nav-link custom-link" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item mb-2 mb-lg-0">
                                <NavLink className="nav-link custom-link" to="/explore">Explore</NavLink>
                            </li>
                            {user?.role !== 'host' &&
                                <li className="nav-item mb-2 mb-lg-0 d-lg-none">
                                    <NavLink className="nav-link custom-link text-info" to="/become-host">Become a host</NavLink>
                                </li>
                            }
                        </ul>

                        <form className="d-none d-lg-flex position-relative align-items-center my-3 my-lg-0" role="search">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input className="form-control me-lg-2 custom-input w-100" type="search" placeholder="Search destinations..." aria-label="Search destinations..." data-bs-toggle="modal" data-bs-target="#searchModal" readOnly />
                        </form>

                        <ul className="navbar-nav ms-lg-auto d-none d-lg-flex gap-3 mb-2 mb-lg-0 mt-3 mt-lg-0 align-items-center">
                            {!user && (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link custom-link" to="/login">Login</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link custom-link" to="/signup">Signup</NavLink>
                                    </li>
                                </>
                            )}
                            {user?.role !== 'host' &&
                                <li className="nav-item">
                                    <NavLink className="nav-link custom-link" to="/become-host">Become a host</NavLink>
                                </li>
                            }
                            <li className="nav-item d-flex align-items-center dropdown">
                                <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {currency}
                                </a>
                                <ul className="dropdown-menu custom-dropdown dropdown-menu-end">
                                    {availableCurrencies.map(c => (
                                        <li key={c}>
                                            <a className={`dropdown-item ${currency === c ? 'active bg-primary text-white' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setCurrency(c); }}>{c}</a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            {user && (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {user?.image ? <img src={user?.image?.startsWith?.('http') ? user.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${user?.image}`} alt="profile" className="profile-img" /> : <i className="fa-solid fa-circle-user profile-icon"></i>}
                                    </a>
                                    <ul className="dropdown-menu custom-dropdown dropdown-menu-end">
                                        {user?.role === 'host' &&
                                            <li><Link className="dropdown-item" to="/dashboard">Dashboard</Link></li>
                                        }
                                        {user?.role === 'admin' &&
                                            <li><Link className="dropdown-item" to="/admin-dashboard">Admin Dashboard</Link></li>
                                        }
                                        <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                                        <li><Link className="dropdown-item" to="/bookings">Bookings</Link></li>
                                        <li><Link className="dropdown-item" to="/reviews">Reviews</Link></li>
                                        <li><Link className="dropdown-item" to="/favorites">Favorites</Link></li>
                                        <li><Link className="dropdown-item" to="/notifications">Notifications</Link></li>
                                        <li><a className="dropdown-item" href="#" onClick={logout}>Logout</a></li>
                                    </ul>
                                </li>
                            )}
                        </ul>

                        <div className="d-lg-none mt-4 pt-4 border-top border-secondary border-opacity-25 w-100 pb-5">
                            <h6 className="text-secondary mb-3 text-uppercase fw-bold small tracking-wide">Account</h6>
                            <ul className="navbar-nav flex-column gap-0 fs-5">
                                {user ? (
                                    <>
                                        <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/profile"><i className="fa-regular fa-user fa-fw me-3 text-secondary"></i> Profile</Link></li>
                                        <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/bookings"><i className="fa-solid fa-suitcase-rolling fa-fw me-3 text-secondary"></i> Bookings</Link></li>
                                        {user.role === 'host' && <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/dashboard"><i className="fa-solid fa-chart-pie fa-fw me-3 text-secondary"></i> Dashboard</Link></li>}
                                        {user.role === 'admin' && <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/admin-dashboard"><i className="fa-solid fa-screwdriver-wrench fa-fw me-3 text-secondary"></i> Admin Dashboard</Link></li>}
                                        <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/reviews"><i className="fa-regular fa-star fa-fw me-3 text-secondary"></i> Reviews</Link></li>
                                        <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/favorites"><i className="fa-regular fa-heart fa-fw me-3 text-secondary"></i> Favorites</Link></li>
                                        <li className="nav-item mb-2"><Link className="nav-link custom-link d-flex align-items-center" to="/notifications"><i className="fa-regular fa-bell fa-fw me-3 text-secondary"></i> Notifications</Link></li>
                                        <li className="nav-item mt-3 pt-3 border-top border-secondary border-opacity-25"><a className="nav-link text-danger d-flex align-items-center" href="#" onClick={logout}><i className="fa-solid fa-arrow-right-from-bracket fa-fw me-3"></i> Logout</a></li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item mb-2"><NavLink className="nav-link custom-link d-flex align-items-center" to="/login"><i className="fa-solid fa-arrow-right-to-bracket fa-fw me-3 text-secondary"></i> Login</NavLink></li>
                                        <li className="nav-item mb-2"><NavLink className="nav-link custom-link d-flex align-items-center" to="/signup"><i className="fa-solid fa-user-plus fa-fw me-3 text-secondary"></i> Signup</NavLink></li>
                                    </>
                                )}
                            </ul>

                            <h6 className="text-secondary mt-5 pt-2 mb-3 text-uppercase fw-bold small tracking-wide">Settings</h6>
                            <div className="d-flex align-items-center rounded-3 mb-4">
                                <i className="fa-solid fa-coins fa-fw text-secondary me-3 fs-5"></i>
                                <span className="text-white me-auto fs-5">Currency</span>
                                <div className="dropdown">
                                    <button className="btn btn-dark border-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {currency}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end custom-dropdown shadow">
                                        {availableCurrencies.map(c => (
                                            <li key={c}>
                                                <a className={`dropdown-item ${currency === c ? 'active bg-primary text-white' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setCurrency(c); }}>{c}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="examplesearchModalModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable custom-search-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="searchModal">Where to next?</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="ai-modal-promo-banner d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <i className="fa-solid fa-wand-magic-sparkles ai-modal-promo-icon"></i>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h6 className="text-white mb-0 fw-semibold">Try AI Vibe Matcher</h6>
                                            <span className="badge ai-vibe-badge ai-promo-badge text-white">NEW</span>
                                        </div>
                                        <p className="text-secondary small mb-0 mt-1">
                                            Describe your dream stay in plain English
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm text-white px-3 py-2 fw-semibold ai-vibe-btn text-nowrap"
                                    data-bs-dismiss="modal"
                                    onClick={() => setShowAiModal(true)}>Ask AI <i className="fa-solid fa-arrow-right ms-1"></i>
                                </button>
                            </div>

                            <div className="ai-modal-divider">
                                <span>or search with filters</span>
                            </div>

                            <form className="user-data-form mt-3" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-6 mb-4">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input type="text" className="form-control" name="location" id="location" placeholder="Enter Location..." value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-md-6 mb-4">
                                        <label htmlFor="type" className="form-label">Property Type</label>
                                        <select name="type" className="form-control" id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                            <option value="">Select Type</option>
                                            {categories.map(cat => <option key={cat} value={cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 col-md-6 mb-4">
                                        <label htmlFor="priceRange" className="form-label">Price range</label>
                                        <select name="priceRange" id="priceRange" className="form-control" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })}>
                                            <option value="">Select Price Range</option>
                                            <option value="below1000">Below {formatPrice(1000)}</option>
                                            <option value="1000-5000">{formatPrice(1000)} - {formatPrice(5000)}</option>
                                            <option value="5001-10000">{formatPrice(5001)} - {formatPrice(10000)}</option>
                                            <option value="10001-20000">{formatPrice(10001)} - {formatPrice(20000)}</option>
                                            <option value="above20001">Above {formatPrice(20001)}</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6 mb-4">
                                        <label htmlFor="minGuests" className="form-label">Min Guests</label>
                                        <input type="number" name="minGuests" id="minGuests" className="form-control" placeholder="Enter your minimun guests..." value={form.minGuests} onChange={(e) => setForm({ ...form, minGuests: e.target.value })} />
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-center">
                                    <button type="submit" className="btn btn-primary book-btn mt-4 py-2 w-100 w-md-25" >
                                        Search
                                    </button>
                                </div>
                            </form>
                            {result !== null && (
                                result.length > 0 ? (
                                    <div className="row g-4 mt-4">
                                        {result?.map((item) => (
                                            <div className="col-12 col-sm-6 col-md-4 col-xl-3" key={item._id}>
                                                <a className="text-decoration-none text-reset h-100 d-block" href={`/listing/${item._id}`}>
                                                    <div className="card px-0 border-0 listing-card custom-list-card h-100">
                                                    <LazyImage src={item?.images?.mainImage?.startsWith?.('http') ? item.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item?.images?.mainImage}`} className="card-img-top" alt="listings image" />
                                                    <div className="card-img-overlay d-flex flex-column">
                                                        <div className="d-flex justify-content-end">
                                                            <div className="favorite-btn text-white" onClick={(e) => {
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
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div>
                                    <h4 className="text-white text-center mt-5">No destinations found matching your criteria. Try adjusting your search!</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AISearchModal show={showAiModal} onClose={() => setShowAiModal(false)} />
        </nav>
    )
}

export default Navbar;