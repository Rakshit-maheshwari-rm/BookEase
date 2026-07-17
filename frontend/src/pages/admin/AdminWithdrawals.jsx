import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCurrency } from "../../context/CurrencyContext";
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';

function AdminWithdrawals() {
    const { currency, formatPrice } = useCurrency();
    const [withdrawals, setWithdrawals] = useState([]);

    const fetchWithdrawals = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/withdrawal/admin/all`, { withCredentials: true });
            if (res.data.success) {
                setWithdrawals(res.data.withdrawals);
            } else {
                toast.error(res.data.message || 'Failed to fetch withdrawals');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching withdrawals');
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        const confirmMsg = status === 'confirmed' ? 'approve' : 'reject';

        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/withdrawal/admin/${id}/status`, { status }, { withCredentials: true });
            if (res.data.success) {
                toast.success(`Withdrawal request ${status}`);
                fetchWithdrawals();
            } else {
                toast.error(res.data.message || 'Failed to update withdrawal status');
            }
        } catch (error) {
            toast.error('Something went wrong while updating status');
        }
    };

    const totalRequests = withdrawals.length;
    const pendingRequests = withdrawals.filter(w => w.status === 'pending').length;
    const approvedRequests = withdrawals.filter(w => w.status === 'confirmed').length;

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(withdrawals, 10);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Withdrawal Requests</h3>
                    <p className="text-secondary mb-0">Approve or reject host withdrawal requests.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">TOTAL REQUESTS</p>
                        <h2 className="text-white fw-bold mb-0">{totalRequests}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-clock-rotate-left"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">PENDING REQUESTS</p>
                        <h2 className="text-white fw-bold mb-0">{pendingRequests}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-check-double"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">APPROVED REQUESTS</p>
                        <h2 className="text-white fw-bold mb-0">{approvedRequests}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Host Name</th>
                                <th>Amount ({currency})</th>
                                <th>Bank Name</th>
                                <th>Account No</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-white py-4">No withdrawal requests</td>
                                </tr>
                            ) : (
                                currentItems.map(request => (
                                    <tr key={request?._id}>
                                        <td>{request?.withdrawalId}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span>{request?.holderName}</span>
                                                <small className="text-secondary">{request?.user?.username}</small>
                                            </div>
                                        </td>
                                        <td className="fw-bold">{request?.amount}</td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span>{request?.bankName}</span>
                                                <small className="text-secondary">IFSC: {request?.ifsc}</small>
                                            </div>
                                        </td>
                                        <td>{request?.accountNumber}</td>
                                        <td>
                                            <span className={`badge ${request?.status === 'confirmed' ? 'bg-success' :
                                                request?.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                                }`}>
                                                {request?.status}
                                            </span>
                                        </td>
                                        <td>
                                            {request.status === 'pending' ? (
                                                <div className="d-flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(request._id, 'confirmed')}
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Approve Request"
                                                    >
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Reject Request"
                                                    >
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-secondary small">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-block d-xl-none mt-4">
                    {currentItems.length > 0 ? currentItems.map((request) => (
                        <div key={request?._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="text-white mb-1">{request?.holderName}</h6>
                                        <p className="text-secondary small mb-0">{request?.user?.username} ({request?.withdrawalId})</p>
                                    </div>
                                    <span className={`badge ${request?.status === 'confirmed' ? 'bg-success' :
                                        request?.status === 'pending' ? 'bg-warning' : 'bg-danger'
                                        }`}>
                                        {request?.status}
                                    </span>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-12">
                                        <small className="text-secondary">Bank Details</small>
                                        <p className="text-white mb-0">{request?.bankName}</p>
                                        <p className="text-secondary small mb-0">Acc: {request?.accountNumber} | IFSC: {request?.ifsc}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small className="text-secondary">Amount</small>
                                        <h5 className="text-white mb-0">{formatPrice(request?.amount)}</h5>
                                    </div>
                                    <div className="d-flex gap-2">
                                        {request.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(request._id, 'confirmed')}
                                                    className="btn btn-sm btn-outline-success"
                                                    title="Approve Request"
                                                >
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Reject Request"
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-secondary small">Processed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-money-bill-transfer fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No withdrawal requests</h5>
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
    )
}

export default AdminWithdrawals;
