function Footer() {
    return (
        <div className="container-fluid footer p-5">
            <div className="row">
                <div className="col-12 col-md-6 col-lg-3 mb-5 mb-lg-0">
                    <div className="d-flex align-items-center mb-3">
                        <h5 className="fw-bold mb-0 text-white">BookEase</h5>
                    </div>
                    <p className="opacity-75 fs-6 colour-menu pe-4">
                        Curating the world's most exceptional stays for the modern explorer. Experience luxury redefined with every booking.
                    </p>
                    <div className="d-flex gap-4 mt-4 fs-5 opacity-75">
                        <a href="#" className="text-decoration-none text-white"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#" className="text-decoration-none text-white"><i className="fa-brands fa-twitter"></i></a>
                        <a href="#" className="text-decoration-none text-white"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="#" className="text-decoration-none text-white"><i className="fa-brands fa-linkedin-in"></i></a>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3 ps-md-4 ps-lg-5 mb-5 mb-lg-0">
                    <h6 className="mb-4 fw-bold style-p text-uppercase">Company</h6>
                    <ul className="list-unstyled opacity-75">
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">About Us</a></li>
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Careers</a></li>
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Journal</a></li>
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Gift Cards</a></li>
                    </ul>
                </div>
                <div className="col-12 col-md-6 col-lg-3 ps-lg-5 mb-5 mb-lg-0">
                    <h6 className="mb-4 fw-bold style-p text-uppercase">Support</h6>
                    <ul className="list-unstyled opacity-75">
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Help Center</a></li>
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Cancellation Options</a></li>
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Safety Information</a></li>
                        <li className="mb-3"><a href="#" className="text-decoration-none text-white">Contact Us</a></li>
                    </ul>
                </div>
                <div className="col-12 col-md-6 col-lg-3 ps-md-4 ps-lg-5 mb-5 mb-lg-0">
                    <h6 className="mb-4 fw-bold style-p text-uppercase">Contact</h6>
                    <div className="d-flex align-items-center mb-3 opacity-75 text-white">
                        <i className="fa-solid fa-location-dot text-primary me-3"></i>
                        <span>123 Luxury Lane, London, UK</span>
                    </div>
                    <div className="d-flex align-items-center mb-4 opacity-75 text-white text-truncate">
                        <i className="fa-regular fa-envelope text-primary me-3"></i>
                        <span>concierge@sanctuarystays.com</span>
                    </div>
                    <p className="fw-bold text-white mb-0">Available 24/7 for our members</p>
                </div>
            </div>
        </div>
    )
}

export default Footer;