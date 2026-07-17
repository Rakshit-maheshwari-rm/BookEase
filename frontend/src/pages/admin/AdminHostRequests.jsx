import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';

function AdminHostRequests() {
    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/host/admin/requests`, { withCredentials: true });
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (error) {
            toast.error('Failed to fetch host requests');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/host/admin/requests/${id}/approve`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success('Request approved successfully');
                fetchRequests();
            } else {
                toast.error(res.data.message || 'Failed to approve request');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/host/admin/requests/${id}/reject`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success('Request rejected successfully');
                fetchRequests();
            } else {
                toast.error(res.data.message || 'Failed to reject request');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.verificationStatus === 'pending').length;
    const approvedRequests = requests.filter(r => r.verificationStatus === 'approved').length;

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(requests, 10);

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Host Requests</h3>
                    <p className="text-secondary mb-0">Approve or reject users requesting host privileges.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-file-invoice"></i>
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
                                <i className="fa-solid fa-spinner"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">PENDING</p>
                        <h2 className="text-white fw-bold mb-0">{pendingRequests}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-user-check"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">APPROVED</p>
                        <h2 className="text-white fw-bold mb-0">{approvedRequests}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>ID Type</th>
                                <th>ID Number</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-white py-4">No host requests to display</td>
                                </tr>
                            ) : (
                                currentItems.map(request => (
                                    <tr key={request?._id}>
                                        <td>{request?.firstName} {request?.lastName}</td>
                                        <td>{request?.email}</td>
                                        <td className="text-uppercase">{request?.idType || 'N/A'}</td>
                                        <td>{request?.idNumber || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${request?.verificationStatus === 'approved' ? 'bg-success' : request?.verificationStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                {request?.verificationStatus?.charAt(0).toUpperCase() + request?.verificationStatus?.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {request?.verificationStatus === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request?._id)}
                                                            className="btn btn-sm btn-outline-success"
                                                            title="Approve"
                                                        >
                                                            <i className="fa-solid fa-check"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request?._id)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Reject"
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-secondary small">Processed</span>
                                                )}
                                            </div>
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
                                        <h6 className="text-white mb-1">{request?.firstName} {request?.lastName}</h6>
                                        <p className="text-secondary small mb-0">{request?.email}</p>
                                    </div>
                                    <span className={`badge ${request?.verificationStatus === 'approved' ? 'bg-success' : request?.verificationStatus === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                        {request?.verificationStatus?.charAt(0).toUpperCase() + request?.verificationStatus?.slice(1)}
                                    </span>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <small className="text-secondary">ID Type</small>
                                        <p className="text-white mb-0 text-uppercase">{request?.idType || 'N/A'}</p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary">ID Number</small>
                                        <p className="text-white mb-0">{request?.idNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end align-items-center mt-3 pt-3 border-top border-secondary">
                                    <div className="d-flex gap-2">
                                        {request?.verificationStatus === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(request?._id)}
                                                    className="btn btn-sm btn-outline-success"
                                                    title="Approve"
                                                >
                                                    <i className="fa-solid fa-check"></i> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request?._id)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Reject"
                                                >
                                                    <i className="fa-solid fa-xmark"></i> Reject
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
                            <i className="fa-solid fa-file-invoice fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No host requests to display</h5>
                        </div>
                    )}
                </div>

                {requests.length > itemsPerPage && (
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

export default AdminHostRequests;
