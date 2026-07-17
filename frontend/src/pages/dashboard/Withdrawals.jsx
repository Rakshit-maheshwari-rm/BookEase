import { useEffect, useState } from 'react';
import { useCurrency } from "../../context/CurrencyContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';

function Withdrawals() {
    const { currency, formatPrice } = useCurrency();
    const [withdrawals, setWithdrawals] = useState([]);
    const [form, setForm] = useState({
        amount: "",
        holderName: '',
        bankName: '',
        accountNumber: '',
        ifsc: ''
    });

    useEffect(() => {
        try {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/withdrawal/get`, { withCredentials: true }).then((res) => {
                setWithdrawals(res.data.withdrawal);
            }).catch((err) => {
                toast.error('Failed to get details');
            });
        } catch (error) {
            toast.error('Failed to get details');
        }
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            axios.post(`${import.meta.env.VITE_BACKEND_URL}/withdrawal/post`, form, { withCredentials: true }).then((res) => {
                if (res.data.success) {
                    toast.success('Withdrawal request sent');
                    setForm({
                        amount: "",
                        holderName: '',
                        bankName: '',
                        accountNumber: '',
                        ifsc: ''
                    });
                    setWithdrawals(prev => [res.data.withdrawal, ...prev]);
                } else {
                    toast.error(res.data.message);
                }
            }).catch((err) => {
                toast.error(err.response.data.message);
            });
        } catch (error) {
            toast.error('Failed to get details');
        }
    };

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(withdrawals, 10);
    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="auth-card p-5 rounded-4 mb-4">
                        <div className="text-center mb-5">
                            <span className="host-badge mb-3">PAYOUTS</span>
                            <h2 className="display-5 fw-bold text-white mt-2">Request Withdrawal</h2>
                            <p className="text-midwhite">Transfer your earnings to your bank account.</p>
                        </div>
                        <form className="user-data-form" onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label className="form-label">Amount to Withdraw (in {currency})</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="e.g. 500"
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <label className="form-label">Account Holder Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.holderName}
                                        onChange={(e) => setForm({ ...form, holderName: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Bank Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.bankName}
                                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                        placeholder="e.g. Chase Bank"
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Account Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.accountNumber}
                                        onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                                        placeholder="Enter account number"
                                        required
                                    />
                                </div>
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Routing / IFSC Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.ifsc}
                                        onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                                        placeholder="Routing or IFSC"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-pill">Submit Request</button>
                            </div>
                        </form>
                    </div>

                    <div className="auth-card p-5 rounded-4">
                        <div className="text-center mb-5">
                            <span className="host-badge mb-3">HISTORY</span>
                            <h2 className="display-5 fw-bold text-white mt-2">Past Withdrawals</h2>
                            <p className="text-midwhite">View your previous withdrawal requests.</p>
                        </div>
                        <div className="table-responsive d-none d-xl-block">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Bank Name</th>
                                        <th scope="col">Account No</th>
                                        <th scope="col">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? currentItems.map(item => (
                                        <tr key={item._id}>
                                            <th scope="row">{item?.withdrawalId}</th>
                                            <td className="booking-date">{item?.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'N/A'}</td>
                                            <td>{formatPrice(item?.amount)}</td>
                                            <td><span className="booking-property-name text-12">{item?.bankName}</span></td>
                                            <td>{item?.accountNumber}</td>
                                            <td><span className={`status-badge status-${item?.status}`}>{item?.status}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center text-white py-3">No withdrawals yet!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                        </div>
                        <div className="d-block d-xl-none mt-4">
                            {currentItems.length > 0 ? currentItems.map((item) => (
                                <div key={item._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <h6 className="text-white mb-1">{item?.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'N/A'}</h6>
                                                <p className="text-secondary small mb-0">{item?.withdrawalId}</p>
                                            </div>
                                            <span className={`status-badge status-${item?.status?.toLowerCase()}`}>{item?.status}</span>
                                        </div>
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <small className="text-secondary">Bank Name</small>
                                                <p className="text-white mb-0">{item?.bankName}</p>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-secondary">Account No</small>
                                                <p className="text-white mb-0">{item?.accountNumber}</p>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-secondary">Amount</small>
                                                <h5 className="text-white mb-0">{formatPrice(item?.amount)}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-5">
                                    <i className="fa-solid fa-receipt fs-1 text-secondary mb-3"></i>
                                    <h5 className="text-white">No withdrawals yet</h5>
                                    <p className="text-secondary">Your withdrawals will appear here.</p>
                                </div>
                            )}
                        </div>
                        {withdrawals.length > itemsPerPage && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination
                                    activePage={activePage}
                                    itemsCountPerPage={itemsPerPage}
                                    totalItemsCount={totalItems}
                                    pageRangeDisplayed={1}
                                    onChange={handlePageChange}
                                    itemClass="page-item"
                                    linkClass="page-link"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Withdrawals;
