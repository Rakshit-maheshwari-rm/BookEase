import { useEffect, useState, useContext } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import LazyImage from "../../components/LazyImage";
import "../Style.css";

function Checkout() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { currency, formatPrice } = useCurrency();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("razorpay");

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guest = parseInt(searchParams.get("guest")) || 1;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));

    useEffect(() => {
        if (!checkIn || !checkOut) {
            toast.error("Invalid stay dates. Redirecting...");
            navigate(`/listing/${id}`);
            return;
        }

        axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/${id}`).then((res) => {
            setListing(res.data);
            setLoading(false);
        }).catch(() => {
            toast.error("Failed to load listing details");
            navigate("/explore");
        });
    }, [id, checkIn, checkOut, navigate]);

    if (loading || !listing?.result) {
        return (
            <div className="container py-5 text-center text-white">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const item = listing.result;
    const price = item.pricing?.price || 0;
    const cleaningFee = item.pricing?.cleaningFee || 0;
    const serviceFee = item.pricing?.serviceFee || 0;
    const subtotal = nights * price;
    const total = subtotal + cleaningFee + serviceFee;

    const handlePay = async () => {
        setPaying(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/booking/make-booking`,
                {
                    listingId: id,
                    checkIn,
                    checkOut,
                    guest,
                    paymentMethod
                },
                { withCredentials: true }
            );

            if (res.data.success) {
                if (paymentMethod === "pay-at-site") {
                    toast.success(res.data.message || " Booking confirmed! You will pay at the property.");
                    navigate("/bookings");
                    return;
                }

                const { order, booking: bookingData } = res.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "Pay",
                    description: `Stay at ${item.title}`,
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            const verifyRes = await axios.post(
                                `${import.meta.env.VITE_BACKEND_URL}/booking/verify-payment`,
                                {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    bookingId: bookingData._id
                                },
                                { withCredentials: true }
                            );

                            if (verifyRes.data.success) {
                                toast.success("Payment successful! Your booking is now confirmed.");
                                navigate("/bookings");
                            } else {
                                toast.error(verifyRes.data.message || "Payment verification failed");
                            }
                        } catch (err) {
                            console.error(err);
                            toast.error("Error verifying payment signature");
                        }
                    },
                    prefill: {
                        name: user?.username || "",
                        email: user?.email || "",
                        contact: user?.phone || ""
                    },
                    theme: {
                        color: "#256af5"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on("payment.failed", function (response) {
                    toast.error("Payment failed: " + response.error.description);
                });
                rzp.open();
            } else {
                toast.error(res.data.message || "Booking creation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Checkout initialization failed");
        } finally {
            setPaying(false);
        }
    };

    const formatDateStr = (date) => {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div className="container my-4 py-3">
            <div className="d-flex align-items-center mb-5 gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center checkout-back-btn"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h2 className="fw-bold text-white mb-0 fs-3">Confirm and Pay</h2>
            </div>

            <div className="row g-5">
                <div className="col-lg-7 order-2 order-lg-1">
                    <div className="pe-lg-4">
                        <div className="mb-5 pb-4 border-bottom">
                            <h4 className="fw-bold text-white mb-4">Your trip</h4>

                            <div className="row">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <p className="fw-bold text-white mb-1">Dates</p>
                                    <p className="text-14 mb-0 text-secondary">
                                        {formatDateStr(checkInDate)} – {formatDateStr(checkOutDate)} ({nights} night{nights > 1 ? 's' : ''})
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <p className="fw-bold text-white mb-1">Guests</p>
                                    <p className="text-14 mb-0 text-secondary">
                                        {guest} guest{guest > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-5 pb-4 border-bottom">
                            <h4 className="fw-bold text-white mb-4">Payment Method</h4>

                            <div className="d-flex flex-column gap-3">
                                <div
                                    onClick={() => setPaymentMethod("razorpay")}
                                    className="p-3 rounded-4 d-flex align-items-center justify-content-between cursor-pointer checkout-payment-box transition-all"
                                    style={{ border: paymentMethod === "razorpay" ? "2px solid #256af5" : "1px solid rgba(255,255,255,0.05)" }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 checkout-card-icon-wrapper">
                                            <i className="fa-solid fa-credit-card fs-5"></i>
                                        </div>
                                        <div>
                                            <p className="fw-bold text-white mb-0">Razorpay Secure Checkout</p>
                                            <p className="text-12 mb-0">Pay online via Cards, UPI, Netbanking or Wallets</p>
                                        </div>
                                    </div>
                                    <div className="form-check m-0">
                                        <input
                                            className="form-check-input custom-radio"
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "razorpay"}
                                            onChange={() => setPaymentMethod("razorpay")}
                                        />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setPaymentMethod("pay-at-site")}
                                    className="p-3 rounded-4 d-flex align-items-center justify-content-between cursor-pointer checkout-payment-box transition-all"
                                    style={{ border: paymentMethod === "pay-at-site" ? "2px solid #256af5" : "1px solid rgba(255,255,255,0.05)" }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-3 checkout-card-icon-wrapper">
                                            <i className="fa-solid fa-house-user fs-5"></i>
                                        </div>
                                        <div>
                                            <p className="fw-bold text-white mb-0">Pay at Site</p>
                                            <p className="text-12 mb-0">Reserve now and pay directly at the property during stay</p>
                                        </div>
                                    </div>
                                    <div className="form-check m-0">
                                        <input
                                            className="form-check-input custom-radio"
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "pay-at-site"}
                                            onChange={() => setPaymentMethod("pay-at-site")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-5">
                            <h4 className="fw-bold text-white mb-3">Ground rules</h4>
                            <p className="text-14 text-secondary">We ask every guest to remember a few simple things about what makes a great guest:</p>
                            <ul className="text-14 text-secondary ps-3 lh-lg">
                                <li>Follow the house rules specified by the host.</li>
                                <li>Treat the accommodation with respect as if it were your own home.</li>
                                <li>Keep the host informed about any issues or unexpected changes.</li>
                            </ul>
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={paying}
                            className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow-lg checkout-btn-pay"
                        >
                            {paying ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {paymentMethod === "razorpay" ? "Redirecting to secure gateway..." : "Confirming your reservation..."}
                                </>
                            ) : (
                                "Confirm and Pay"
                            )}
                        </button>
                    </div>
                </div>

                <div className="col-lg-5 order-1 order-lg-2">
                    <div className="p-4 rounded-4 sticky-top checkout-summary-panel">
                        <div className="d-flex gap-3 mb-4 pb-4 border-bottom">
                            <div className="checkout-thumb-wrapper">
                                <LazyImage
                                    src={item?.images?.mainImage?.startsWith?.('http') ? item.images.mainImage : `${import.meta.env.VITE_BACKEND_URL}/uploads/${item.images?.mainImage}`}
                                    alt={item.title}
                                    className="w-100 h-100"
                                />
                            </div>
                            <div className="d-flex flex-column justify-content-center py-1">
                                <div>
                                    <span className="text-12 text-primary fw-bold text-uppercase">{item.type}</span>
                                    <h5 className="fw-bold text-white mb-0 mt-1 checkout-item-title">{item.title}</h5>
                                </div>
                            </div>
                        </div>

                        <h5 className="fw-bold text-white mb-3">Price details</h5>

                        <div className="d-flex justify-content-between mb-3 text-14">
                            <span className="text-secondary">{formatPrice(price)} x {nights} night{nights > 1 ? 's' : ''}</span>
                            <span className="text-white fw-bold">{formatPrice(subtotal)}</span>
                        </div>

                        <div className="d-flex justify-content-between mb-3 text-14">
                            <span className="text-secondary">Cleaning fee</span>
                            <span className="text-white fw-bold">{formatPrice(cleaningFee)}</span>
                        </div>

                        <div className="d-flex justify-content-between mb-4 text-14">
                            <span className="text-secondary">Service fee</span>
                            <span className="text-white fw-bold">{formatPrice(serviceFee)}</span>
                        </div>

                        <div className="d-flex justify-content-between border-top pt-3 text-white">
                            <span className="fw-bold fs-5">Total ({currency})</span>
                            <span className="fw-bold fs-5">{formatPrice(total)}</span>
                        </div>

                        <div className="mt-4 p-3 rounded-3 text-12 d-flex gap-3 align-items-center checkout-security-card">
                            <i className="fa-solid fa-shield-halved fs-5"></i>
                            <div>
                                <strong className="d-block mb-1">Secure Checkout Verified</strong>
                                <span className="opacity-75">Your credentials and transfers are protected with end-to-end industry standard SSL protocols.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
