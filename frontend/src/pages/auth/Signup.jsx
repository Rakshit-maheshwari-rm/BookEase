import { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from 'react-toastify';
import '../Style.css';

function Signup() {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/signup`,
                form,
                {
                    withCredentials: true
                }
            );

            setUser(res.data.user);
            navigate("/");
            toast.success("Signup Successful!");

        } catch (error) {
            toast.error("Signup failed. Please try again.");
            console.log(error);
        }
    };

    return (
        <div className="auth min-vh-100 d-flex justify-content-center align-items-center py-5">
            <div className="row w-100 auth-card auth-split-card rounded-5 overflow-hidden">
                <div className="col-12 col-lg-6 d-flex flex-column justify-content-center p-4 p-lg-5 order-2 order-lg-1">
                    <div className="w-100 mx-auto auth-form-container">
                        <h2 className="text-center mb-3">Join Us Today</h2>
                        <p className="text-center">Create your account and start your journey.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    className="form-control"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="form-control"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="form-control"
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100">
                                Signup
                            </button>

                            <p className="text-center mt-4 mb-0">
                                Already have an account?
                                <Link to="/login" className="ms-2 auth-link">Login</Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className="col-12 col-lg-6 d-block p-0 position-relative auth-image-side order-1 order-lg-2">
                    <div className="position-absolute bottom-0 start-0 w-100 auth-image-overlay p-4 p-lg-5">
                        <h2 className="text-white fw-bold mb-3 auth-heading">
                            Create Your <br /><span className="auth-highlight">Account.</span>
                        </h2>
                        <p className="text-white-50 auth-subtitle">
                            Join our community and start your journey today.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;