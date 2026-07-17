function Newsletter() {
    return (
        <div className="container my-5 pb-5">
            <div className="row align-items-center newsletter rounded-5 mx-2 mx-md-0">
                <div className="col-12 col-md-6 p-4 p-md-5">
                    <h1 className="fw-bold mb-3">Join the Inner Circle</h1>
                    <p className="text-18">Receive exclusive early access to new listings, seasonal promotions, and travel guides curated by our experts.</p>
                </div>
                <div className="col-12 col-md-6 p-4 p-md-5">
                    <form action="">
                        <div className="d-flex newsletter-input-wrapper">
                            <input type="text" className="form-control p-3 bg-transparent border-0 shadow-none text-white" name="" id="" placeholder="Enter your email address" />
                            <button className="subscribe-btn text-nowrap d-flex align-items-center" type="button">Subscribe<i className="fa-regular fa-envelope ms-1"></i></button>
                        </div>
                    </form>
                    <p className="text-12 mt-2">By subscribing, you agree to our Privacy Policy and Terms of Service.</p>
                </div>
            </div>
        </div>
    )
}

export default Newsletter;