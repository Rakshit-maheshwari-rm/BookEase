import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from 'react-toastify';
import '../Style.css';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, form,
                { withCredentials: true }
            );
            if (res.data.success) {
                setUser(res.data.user);
                toast.success("Login Successful!");

                if (res.data.user?.role === "user") {
                    navigate("/");
                }
                else if (res.data.user?.role === "host") {
                    navigate("/dashboard");
                }
                else if (res.data.user?.role === "admin") {
                    navigate("/admin-dashboard");
                }
            } else {
                toast.error(res.data.message || res.data.error || "Login failed. Please try again.");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Login failed. Please try again.");
        }
    };
    return (
        <div className="auth min-vh-100 d-flex justify-content-center align-items-center py-5">
            <div className="row w-100 auth-card auth-split-card rounded-5 overflow-hidden">

                <div className="col-12 col-lg-6 d-flex flex-column justify-content-center p-4 p-lg-5 order-2 order-lg-1">
                    <div className="w-100 mx-auto auth-form-container">
                        <h2 className="mb-2">Welcome Back</h2>
                        <p className="mb-4">Enter your details to sign in to your account</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input type="email" name="email" placeholder="name@example.com" className="form-control"
                                    required onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Password</label>
                                <input type="password" name="password" placeholder="*********"
                                    className="form-control" required onChange={handleChange} />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 py-2">
                                Sign In
                            </button>
                            <p className="text-center mt-4 mb-0">
                                Don't have an account?
                                <Link to="/signup" className="ms-2 auth-link">Create Account</Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className="col-12 col-lg-6 d-block p-0 position-relative auth-image-side order-1 order-lg-2">
                    <div className="position-absolute bottom-0 start-0 w-100 p-4 p-lg-5 auth-image-overlay">
                        <h2 className="text-white fw-bold mb-3 auth-heading">
                            Discover Your <br /><span className="auth-highlight">Perfect Stay.</span>
                        </h2>
                        <p className="text-white-50 auth-subtitle">
                            Experience luxury, comfort, and the world's most breathtaking destinations curated just for you.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;