import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";

const categories = [
    "Luxury Villa", "Beachfront", "Mountain Cabin", "Urban Apartment",
    "Countryside Cottage", "Boutique Hotel", "Treehouse", "Farmhouse",
    "Chalet", "Houseboat", "Mansion", "Castle", "Glamping", "Tiny Home",
    "Camper/RV", "Yurt", "Barn", "Windmill", "Lighthouse", "Cave",
    "Igloo", "Riad", "Trullo", "Ryokan", "Shepherd's Hut", "Tent",
    "Dome", "Earthhouse", "House", "Apartment", "Villa", "Hotel", 
    "Cottage", "Resort", "Cabin", "Guest House"
];

function Hero() {
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [form, setForm] = useState({
        location: "",
        type: "",
        priceRange: "",
    });

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        
        const queryParams = new URLSearchParams();
        if (form.location) queryParams.append('location', form.location);
        if (form.type) queryParams.append('type', form.type);
        if (form.priceRange) queryParams.append('priceRange', form.priceRange);
        
        navigate(`/explore?${queryParams.toString()}`);
    };

    return (
        <div className="container mt-5 pt-5 pb-5">
            <div className="text-center">
                <p className="luxury-redefined rounded-pill px-4 py-2 mb-2">Luxury Redefined</p>
                <h1 className="hero-title">Find Your <span className="hero-highlight">Sanctuary</span></h1>
                <p className="hero-subtitle">Discover the world's most exclusive stays, curated for the modern traveler who seeks tranquility and elegance.</p>
                <form onSubmit={handleSubmit}>
                    <div className="hero-container rounded-4 mt-5 d-flex flex-column flex-md-row justify-content-center px-4 py-3 position-relative gap-3 gap-md-0">

                        <div className="flex-fill w-100">
                            <p className="text-start mb-1 style-p"><i className="fa-solid fa-location-dot me-1"></i>Location</p>
                            <input type="text" name="location" id="location" className="form-control custom-hero-input" placeholder="Enter location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div className="divider mx-3 d-none d-md-block"></div>
                        <div className="flex-fill w-100">
                            <p className="text-start mb-1 style-p"><i className="fa-solid fa-coins me-1"></i>Price Range</p>
                            <select name="priceRange" id="priceRange" className="form-control custom-hero-dropdown" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })}>
                                <option value="">Select Price Range</option>
                                <option value="below1000">Below {formatPrice(1000)}</option>
                                <option value="1000-5000">{formatPrice(1000)} - {formatPrice(5000)}</option>
                                <option value="5001-10000">{formatPrice(5001)} - {formatPrice(10000)}</option>
                                <option value="10001-20000">{formatPrice(10001)} - {formatPrice(20000)}</option>
                                <option value="above20001">Above {formatPrice(20001)}</option>
                            </select>
                        </div>
                        <div className="divider mx-3 d-none d-md-block"></div>
                        <div className="flex-fill w-100">
                            <p className="text-start mb-1 style-p"><i className="fa-solid fa-building me-1"></i>Stay Type</p>
                            <select name="type" id="type" className="form-control custom-hero-dropdown" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option value="">Select Type</option>
                                {categories.map(cat => <option key={cat} value={cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{cat}</option>)}
                            </select>
                        </div>

                        <button className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center hero-search-btn">
                            <i className="fa-solid fa-magnifying-glass text-white"></i>
                        </button>

                    </div>
                </form>
                <p className="mt-5 finder-p">Not sure where to go? <a href="/destination-finder" className="text-decoration-none"><span className="style-p">Try our destination finder<i className="fa-solid fa-arrow-right ms-1"></i></span></a></p>
            </div>
        </div>
    );
}

export default Hero;