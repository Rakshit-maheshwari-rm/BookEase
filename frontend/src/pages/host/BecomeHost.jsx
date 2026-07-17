import { useState } from 'react';
import '../Style.css'
import { toast } from 'react-toastify';
import axios from 'axios';

function BecomeHost() {
    const [form, setForm] = useState({});
    const [checkForm, setCheckForm] = useState({});
    const [showStatus, setShowStatus] = useState(null);
    const [idImage, setIdImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("form", JSON.stringify(form));
            if (idImage) {
                formData.append("idImage", idImage);
            }

            axios.post(`${import.meta.env.VITE_BACKEND_URL}/host/create`, formData).then((res) => {
                if (res.data.success) {
                    toast.success('Application successfully submited');
                    setForm({});
                    setIdImage(null);
                } else {
                    toast.error(res.data.message || 'Failed to submit application');
                }
            }).catch((err) => {
                toast.error('Failed to submit application');
            });
        } catch (error) {
            toast.error('Failed to submit application');
        }
    };

    const handleCheck = async (e) => {
        e.preventDefault();
        try {
            axios.post(`${import.meta.env.VITE_BACKEND_URL}/host/check-host`, { checkForm }).then((res) => {
                if (res.data.success) {
                    setShowStatus(res.data);
                    toast.success('Application status checked successfully');
                } else {
                    toast.error(res.data.message);
                }
            }).catch((err) => {
                toast.error('Failed to check application status');
            });
        } catch (error) {
            toast.error('Failed to check application status');
        }
    };
    return (
        <div className="container py-5 my-2">
            <div className="host-container rounded-5 position-relative overflow-hidden">
                <div className="host-bg-wrapper">
                    <img src="images/becomehost.jpg" alt="Become Host" className="host-bg-image" />
                    <div className="host-bg-gradient"></div>
                </div>

                <div className="host-content position-relative p-4 p-md-5 d-flex flex-column justify-content-center h-100">

                    <div className="mb-4">
                        <span className="host-badge">JOIN BOOKEASE HOSTING</span>
                    </div>

                    <h1 className="host-title text-white mb-4">
                        Your world is<br />worth <span className="text-cyan">sharing.</span>
                    </h1>

                    <p className="host-description mb-5">
                        Turn your extra space into extra income. Join our<br />
                        exclusive community of premium hosts and start<br />
                        welcoming global travelers today.
                    </p>

                    <div>
                        <button onClick={() => document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' })} className="btn host-btn rounded-pill px-4 py-3 fw-bold d-inline-flex align-items-center gap-2">
                            Get Started Now <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    <div className="host-stats mt-5 d-flex align-items-center gap-3">
                        <div className="stats-text">
                            <div className="text-white fw-bold">10k+ Premium Hosts</div>
                            <div className="text-secondary small">Already joined our community</div>
                        </div>
                    </div>

                </div>
            </div>
            <div className='mt-5 pt-5'>
                <h2 className='text-white fw-bold text-center display-5 mb-5 pb-3'>Why host on BookEase?</h2>
                <div className='row g-4 justify-content-center'>
                    <div className="col-md-4">
                        <div className="benefit-card p-5 text-center rounded-4">
                            <div className="icon-circle mb-4 mx-auto">
                                <i className="fa-solid fa-shield icon-30 text-primary"></i>
                            </div>
                            <h5 className="text-white fw-bold mb-3">Host Protection</h5>
                            <p className="text-secondary small">Top-to-bottom protection for your property and your peace of mind.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="benefit-card p-5 text-center rounded-4">
                            <div className="icon-circle mb-4 mx-auto">
                                <i className="fa-solid fa-headset icon-30 text-cyan"></i>
                            </div>
                            <h5 className="text-white fw-bold mb-3">24/7 Premium Support</h5>
                            <p className="text-secondary small">Our global team is standing by 24/7 to support you and your guests by phone, email, and live chat.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="benefit-card p-5 text-center rounded-4">
                            <div className="icon-circle mb-4 mx-auto">
                                <i className="fa-solid fa-globe icon-30 text-primary"></i>
                            </div>
                            <h5 className="text-white fw-bold mb-3">Global Audience</h5>
                            <p className="text-secondary small">Millions of travelers are seeking a diverse place like yours. Get worldwide visibility instantly.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-5 text-center">
                <h2 className="text-white fw-bold display-5 mb-2">Ready to <span className="text-cyan">Start?</span></h2>
                <p className="text-secondary">Fill out the details below to create your free listing.</p>
            </div>

            <div className="row justify-content-center mt-5">
                <div className="col-lg-10">
                    <form className="user-data-form p-5 rounded-4 mb-5" id='application-form' onSubmit={handleSubmit}>
                        <h6 className="text-white fw-bold mb-4">1. Personal Information</h6>
                        <div className="row g-4 mb-5">
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">First Name</label>
                                <input type="text" className="form-control" name='firstName' id='firstName' placeholder="Enter your first name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Last Name</label>
                                <input type="text" className="form-control" name='lastName' id='lastName' placeholder="Enter your last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Email Address</label>
                                <input type="email" className="form-control" name='email' id='email' placeholder="Enter your email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label className="form-label text-secondary small">Password</label>
                                <input type="password" className="form-control" name='password' id='password' placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Phone Number</label>
                                <input type="tel" className="form-control" name='phone' id='phone' placeholder="Enter your phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Date of Birth</label>
                                <input type="date" className="form-control" name='dob' id='dob' value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Residential Address</label>
                                <input type="text" className="form-control" name='residentialAddress' id='residentialAddress' placeholder="Enter your home address" value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} />
                            </div>
                        </div>
                        <h6 className="text-white fw-bold mb-4">2. Identity Verification</h6>
                        <div className="row g-4 mb-5">
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Government ID Type</label>
                                <select className="form-select" name='idType' id='idType' value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })} >
                                    <option value="">Select ID Type</option>
                                    <option value="aadhaar">Aadhaar Card</option>
                                    <option value="pan">PAN Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="driving_license">Driving License</option>
                                    <option value="voter_id">Voter ID</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">ID Number</label>
                                <input type="text" className="form-control" name='idNumber' id='idNumber' placeholder="Enter ID Number" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
                            </div>
                            <div className="col-12">
                                <label className="form-label text-secondary small">Upload ID Document</label>
                                <div className="upload-area text-center p-5 rounded-3 border-dashed position-relative">
                                    <input
                                        type="file"
                                        name="idImage"
                                        id="idImage"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                        onChange={(e) => setIdImage(e.target.files[0])}
                                    />
                                    <i className="fa-solid fa-file-arrow-up mb-3 icon-40 text-primary"></i>
                                    <span className="text-white fw-bold d-block">
                                        {idImage ? idImage.name : "Click to upload clear photo of your ID"}
                                    </span>
                                    <div className="text-secondary small mt-2">JPG, PNG or PDF (max 5MB)</div>
                                </div>
                            </div>
                        </div>
                        <h6 className="text-white fw-bold mb-4">3. Host Profile & Experience</h6>
                        <div className="row g-4 mb-5">
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Languages Spoken</label>
                                <input type="text" className="form-control" name='language' id='language' placeholder="e.g. English, Spanish, French" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Have you hosted guests before?</label>
                                <select className="form-select" name='hasHostedBefore' id='hasHostedBefore' value={form.hasHostedBefore} onChange={(e) => setForm({ ...form, hasHostedBefore: e.target.value })} >
                                    <option value="0">No, I am a new host here</option>
                                    <option value="1">Yes, I have experience</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label text-secondary small">Why do you want to host on BookEase?</label>
                                <textarea className="form-control" name='motivation' id='motivation' rows="4" placeholder="Tell us a little about your space and your motivation to host" value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} ></textarea>
                            </div>
                        </div>

                        <h6 className="text-white fw-bold mb-4">4. Bank Details (For Payouts)</h6>
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Account Holder Name</label>
                                <input type="text" className="form-control" name='accountHolderName' id='accountHolderName' placeholder="Exactly as it appears on your bank account" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Bank Name</label>
                                <input type="text" className="form-control" name='bankName' id='bankName' placeholder="e.g. Chase, Bank of America" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Account Number</label>
                                <input type="text" className="form-control" name='accountNumber' id='accountNumber' placeholder="Enter Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-secondary small">Routing Number / IFSC Code</label>
                                <input type="text" className="form-control" name='routingNumber' id='routingNumber' placeholder="Bank routing code" value={form.routingNumber} onChange={(e) => setForm({ ...form, routingNumber: e.target.value })} />
                            </div>
                        </div>

                        <div className="mt-5 mb-4 form-check d-flex align-items-center gap-2">
                            <input type="checkbox" className="form-check-input mt-0 custom-checkbox" id="termsCheck" name='agreedToTerms' checked={form.agreedToTerms || false} onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })} />
                            <label className="form-check-label text-secondary small" htmlFor="termsCheck">
                                I certify that the information provided is accurate and agree to the <span className="text-cyan">Host Terms of Service</span> and <span className="text-cyan">Privacy Policy</span>.
                            </label>
                        </div>

                        <button type="submit" className="btn host-btn w-100 rounded-pill py-3 fw-bold">
                            Submit Host Application
                            <i className="fa-solid fa-arrow-right ms-2 icon-20"></i>
                        </button>
                    </form>
                    <div className='user-data-form application-check rounded-4 mb-5 p-4 p-md-5'>
                        <h5 className='text-white fw-bold mb-4'>Check your application status here</h5>
                        <form onSubmit={handleCheck}>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small">Email Address</label>
                                    <input type="email" className="form-control" name='email' id='email' placeholder="Enter your email address" value={checkForm.email} onChange={(e) => setCheckForm({ ...checkForm, email: e.target.value })} />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <label className="form-label text-secondary small">Password</label>
                                    <input type="password" className="form-control" name='password' id='password' placeholder="Enter your password" value={checkForm.password} onChange={(e) => setCheckForm({ ...checkForm, password: e.target.value })} />
                                </div>
                                <button type="submit" className="btn host-btn w-100 rounded-pill py-2 fw-bold">
                                    Check Application Status
                                </button>
                            </div>
                        </form>
                        {showStatus && (
                            <div className="mt-4 p-4 rounded-3">
                                <h6 className='text-white'>Email: {showStatus.email}</h6>
                                <h6 className='text-white'>Status: {showStatus.verifiedUser}</h6>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default BecomeHost;
