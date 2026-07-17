import LazyImage from "../../components/LazyImage";

function Collections({ listings, loading }) {
    const cityData = listings?.reduce((acc, listing) => {
        const city = listing?.city;
        if (city) {
            if (!acc[city]) {
                acc[city] = { count: 0, image: listing?.images?.mainImage };
            }
            acc[city].count += 1;
        }
        return acc;
    }, {});
    const topCities = Object.entries(cityData || {}).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    return (
        <div className="container mt-5 pt-5 pb-5">
            <p className="style-p mb-1"><i className="fa-solid fa-location-dot me-1"></i>GLOBAL COLLECTIONS</p>
            <h2 className="fw-bold text-white">Explore Top Cities</h2>
            <div className="row g-4 mt-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg" key={index}>
                            <div className="card collection-card px-0">
                                <div className="skeleton skeleton-img card-img-top rounded-4"></div>
                                <div className="card-body text-white px-0">
                                    <div className="skeleton skeleton-text w-75 mb-2"></div>
                                    <div className="skeleton skeleton-text w-50"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    topCities.map(([cityName, data], index) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg" key={index}>
                            <a href={`/explore?city=${cityName}`} className="text-decoration-none collection-link d-block w-100">
                                <div className="card collection-card px-0">
                                    <LazyImage src={data.image?.startsWith?.('http') ? data.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${data.image}`} className="card-img-top rounded-4" alt={`${cityName} collection`} />
                                    <div className="card-body text-white px-0">
                                        <h5 className="card-title collection-title fw-bold">{cityName}</h5>
                                        <p className="card-text style-text">{data.count} Stays</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Collections;