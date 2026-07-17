import { useEffect, useState, useContext } from 'react';
import '../Style.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import LazyImage from '../../components/LazyImage';
import { AuthContext } from '../../context/AuthContext';

function Profile() {
    const { user, setUser } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (user) {
            setData(user);
        }
    }, [user]);

    const getFirstName = () => {
        if (!data?.username) return "";
        const parts = data.username.split(" ");
        return parts[0] || "";
    };

    const getLastName = () => {
        if (!data?.username) return "";
        const parts = data.username.split(" ");
        return parts.slice(1).join(" ") || "";
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { id, value } = e.target;
        setData(prev => ({
            ...prev,
            address: {
                ...prev?.address,
                [id]: value
            }
        }));
    };

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let updatePayload = { ...data };

        if (passwords.newPassword || passwords.confirmPassword || passwords.currentPassword) {
            if (!passwords.currentPassword) {
                toast.error("Please enter your current password");
                return;
            }
            if (passwords.newPassword !== passwords.confirmPassword) {
                toast.error("New password and confirm password do not match");
                return;
            }
            updatePayload.password = passwords.newPassword;
        }

        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/profile-update`, updatePayload, { withCredentials: true });
            if (res.data.success) {
                toast.success("Profile updated successfully");
                setData(res.data.user);
                setUser(res.data.user);
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                toast.error(res.data.message || "Failed to update profile");
            }
        } catch (err) {
            toast.error("An error occurred while updating profile");
        }
    };


    return (
        <div className="container my-5 pb-5">
            <div className='d-flex flex-wrap justify-content-between'>
                <div className='d-flex flex-wrap gap-4'>
                    <div>
                        <LazyImage src={data?.image?.startsWith?.('http') ? data.image : `${import.meta.env.VITE_BACKEND_URL}/uploads/${data?.image}`} alt="profile photo" className="profile-img" />
                    </div>
                    <div>
                        <h3 className='fw-bold'>{data?.username}</h3>
                        <p className='mb-1 style-midwhite'>{data?.description}</p>
                        <p className='text-12'>Member since {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</p>
                    </div>
                </div>
                <div className='d-flex flex-wrap gap-3'>
                    <div className="profile-card d-flex justify-content-start align-items-center gap-3 px-4">
                        <div className='static-card d-flex justify-content-center align-items-center'>
                            <i className="fa-solid fa-briefcase icon"></i>
                        </div>
                        <div>
                            <h4 className='mb-0 fw-bold'>{data?.totalBookings}</h4>
                            <p className='mb-0 text-12'>BOOKINGS</p>
                        </div>
                    </div>
                    <div className="profile-card d-flex justify-content-start align-items-center gap-3 px-4">
                        <div className='static-card d-flex justify-content-center align-items-center'>
                            <i className="fa-solid fa-heart icon"></i>
                        </div>
                        <div>
                            <h4 className='mb-0 fw-bold'>{data?.favorites?.length}</h4>
                            <p className='mb-0 text-12'>FAVORITES</p>
                        </div>
                    </div>
                    <div className="profile-card d-flex justify-content-start align-items-center gap-3 px-4">
                        <div className='static-card d-flex justify-content-center align-items-center'>
                            <i className="fa-solid fa-star icon"></i>
                        </div>
                        <div>
                            <h4 className='mb-0 fw-bold'>{data?.totalReviews}</h4>
                            <p className='mb-0 text-12'>REVIEWS</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-5 pt-3'>
                <form className='user-data-form' onSubmit={handleSubmit}>
                    <h3 className="mb-4">Basic Personal Information</h3>
                    <div className="row">
                        <div className="col-4 mb-4">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="firstName"
                                placeholder='Enter your first name'
                                value={getFirstName()}
                                onChange={(e) => {
                                    const fn = e.target.value;
                                    const ln = getLastName();
                                    setData({ ...data, username: `${fn} ${ln}`.trim() });
                                }}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="lastName"
                                placeholder='Enter your last name'
                                value={getLastName()}
                                onChange={(e) => {
                                    const ln = e.target.value;
                                    const fn = getFirstName();
                                    setData({ ...data, username: `${fn} ${ln}`.trim() });
                                }}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder='Enter your email address'
                                value={data?.email || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4 mb-4">
                            <label htmlFor="dob" className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                className="form-control"
                                id="dob"
                                value={data?.dob ? new Date(data.dob).toISOString().slice(0, 10) : ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="gender" className="form-label">Gender</label>
                            <select
                                name="gender"
                                id="gender"
                                className='form-control'
                                value={data?.gender || "male"}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                placeholder='Enter your phone number'
                                value={data?.phone || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <h3 className="mt-5 mb-4">Address / Location Details</h3>
                    <div className="row">
                        <div className="col-8 mb-4">
                            <label htmlFor="street" className="form-label">Street Address</label>
                            <input
                                type="text"
                                className="form-control"
                                id="street"
                                placeholder='Enter your street address'
                                value={data?.address?.street || ""}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="city" className="form-label">City</label>
                            <input
                                type="text"
                                className='form-control'
                                id='city'
                                placeholder='Enter your city'
                                value={data?.address?.city || ""}
                                onChange={handleAddressChange}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4 mb-4">
                            <label htmlFor="state" className="form-label">State / Province</label>
                            <input
                                type="text"
                                className="form-control"
                                id="state"
                                placeholder='Enter your state'
                                value={data?.address?.state || ""}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="country" className="form-label">Country</label>
                            <input
                                type="text"
                                className="form-control"
                                id="country"
                                placeholder='Enter your country'
                                value={data?.address?.country || ""}
                                onChange={handleAddressChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="pinCode" className="form-label">Postal Code</label>
                            <input
                                type="text"
                                className='form-control'
                                id='pinCode'
                                placeholder='Enter your postal code'
                                value={data?.address?.pinCode || ""}
                                onChange={handleAddressChange}
                            />
                        </div>
                    </div>

                    <h3 className="mt-5 mb-4">Emergency Contact</h3>
                    <div className="row">
                        <div className="col-4 mb-4">
                            <label htmlFor="emergencyName" className="form-label">Contact Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="emergencyName"
                                placeholder='Emergency contact name'
                                value={data?.emergencyName || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="emergencyRelation" className="form-label">Relationship</label>
                            <input
                                type="text"
                                className="form-control"
                                id="emergencyRelation"
                                placeholder='e.g., Parent, Spouse'
                                value={data?.emergencyRelation || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="emergencyPhone" className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="emergencyPhone"
                                placeholder='Emergency phone number'
                                value={data?.emergencyPhone || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <h3 className="mt-5 mb-4">Travel Preferences & Bio</h3>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <label htmlFor="bio" className="form-label">About Me</label>
                            <textarea
                                className="form-control"
                                id="bio"
                                rows="3"
                                placeholder="Tell hosts and guests a little about yourself..."
                                value={data?.bio || ""}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-4 mb-4">
                            <label htmlFor="language" className="form-label">Preferred Language</label>
                            <select
                                className="form-control"
                                id="language"
                                value={data?.language || "english"}
                                onChange={handleChange}
                            >
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="french">French</option>
                            </select>
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="currency" className="form-label">Preferred Currency</label>
                            <select
                                className="form-control"
                                id="currency"
                                value={data?.currency || "inr"}
                                onChange={handleChange}>
                                <option value="inr">INR (₹)</option>
                                <option value="usd">USD ($)</option>
                                <option value="eur">EUR (€)</option>
                                <option value="gbp">GBP (£)</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="mt-5 mb-4">Identity & Security</h3>
                    <div className="row mb-4">
                        <div className="col-4 mb-4">
                            <label htmlFor="idType" className="form-label">Government ID Type</label>
                            <select
                                className="form-control"
                                id="idType"
                                value={data?.idType || "aadhaar"}
                                onChange={handleChange}
                            >
                                <option value="aadhaar">Aadhaar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="passport">Passport</option>
                                <option value="driving_license">Driving License</option>
                                <option value="voter_id">Voter ID</option>
                            </select>
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="idNumber" className="form-label">Government ID Number</label>
                            <input
                                type="text"
                                className="form-control"
                                id="idNumber"
                                placeholder="Enter your ID number"
                                value={data?.idNumber || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12 mt-3">
                            <h5 className="mb-4">Change Password</h5>
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="currentPassword" className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="currentPassword"
                                placeholder='Enter current password'
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                placeholder='Enter new password'
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className="col-4 mb-4">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                placeholder='Confirm new password'
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-start mt-4">
                        <button type="submit" className="btn btn-primary px-4 py-2 fw-bold">Save All Changes</button>
                    </div>
                </form>
            </div>
        </div >
    )
}

export default Profile;