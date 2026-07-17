function Review({ review }) {
    return (
        <div className="container mt-5 pt-5 pb-5">
            <h1 className="text-36 fw-bold text-center text-white">What Our Guests Say</h1>
            <div className="row g-4 text-start pt-5">
                {review?.sort((a, b) => b.avgRating - a.avgRating)?.slice(0, 3)?.map((item) => {
                    return (
                        <div className="col-12 col-md-6 col-lg-4" key={item._id}>
                            <div className="review-card rounded-4 h-100">
                                <div className="d-flex">
                                    <p>"{item?.reviews[0]?.message}"</p>
                                    <i className="fa-solid fa-quote-right text-primary fs-3 ms-1"></i>
                                </div>
                                <div className="d-flex align-items-center gap-3 pt-3 mt-auto">
                                    <img
                                        src={item?.reviews[0]?.owner?.image?.startsWith?.('http') ? item.reviews[0].owner.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item?.reviews[0]?.owner?.image}`}
                                        alt="user"
                                        className="rounded-circle" />
                                    <div>
                                        <p className="mb-0 text-white fw-bold">{item?.reviews[0]?.owner?.username}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Review;