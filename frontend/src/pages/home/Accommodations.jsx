import { NavLink } from "react-router-dom";
import LazyImage from "../../components/LazyImage";
import { useCurrency } from "../../context/CurrencyContext";

function Accommodations({ listings, loading }) {
    const { formatPrice } = useCurrency();
    return (
        <div className="container mt-5 pt-5 pb-5">
            <p className="style-p mb-1">PREMIUM ACCOMMODATIONS</p>
            <h1 className="fw-bold accommodation-text text-white">Discover Handpicked Luxury Stays for Your Next Getaway</h1>
            <p className="style-text accommodation-text mb-4 mt-3">Welcome to the internet's most curated collection of high-end vacation rentals and boutique hotels. Whether you're seeking a secluded mountain retreat, a beachfront villa in Bali, or a sophisticated urban loft in the heart of Tokyo, Sanctuary Stays connects discerning travelers with properties that prioritize design, comfort, and unforgettable experiences. Use our intuitive filters to find your perfect match.</p>
            <div className="row g-4 mb-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div className="col-12 col-md-6 col-lg-4" key={index}>
                            <div className="card accommodation-card px-0 border-0">
                                <div className="skeleton skeleton-img card-img rounded-4" style={{ height: '100%' }}></div>
                                <div className="card-img-overlay d-flex flex-column justify-content-end">
                                    <div className="skeleton skeleton-text w-25 mb-2"></div>
                                    <div className="skeleton skeleton-text w-75 mb-2"></div>
                                    <div className="d-flex justify-content-between mt-2">
                                        <div className="skeleton skeleton-text w-25"></div>
                                        <div className="skeleton skeleton-text w-25"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    listings?.sort((a, b) => b.avgRating - a.avgRating)?.slice(0, 3)?.map((item) => {
                        return (
                            <div className="col-12 col-md-6 col-lg-4" key={item._id}>
                                <NavLink className="card accommodation-card px-0 d-block w-100" to={`/listing/${item._id}`}>
                                    <LazyImage src={item?.images?.mainImage?.startsWith?.('http') ? item.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item?.images?.mainImage}`} className="card-img" alt="listing image" />
                                    <div className="card-img-overlay d-flex flex-column justify-content-end">
                                        <span className="badge badge-top-rated mb-2 px-2">TOP RATED</span>
                                        <h5 className="text-white fw-bold mb-2">{item?.title}</h5>
                                        <div className="d-flex justify-content-between">
                                            <p><span className="style-p fw-bold fs-5">{formatPrice(item?.pricing?.price)}</span>  <span className="price">/ night</span></p>
                                            <p className="text-white"><i className="fa-regular fa-star me-1"></i>{item?.avgRating}</p>
                                        </div>
                                    </div>
                                </NavLink>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default Accommodations;