import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from "../../components/Pagination";
import { usePagination } from '../../hooks/usePagination';

function AdminUsers() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/users`, { withCredentials: true });
            if (res.data.success) {
                setUsers(res.data.users);
            } else {
                toast.error(res.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${id}/status`, { status: newStatus }, { withCredentials: true });
            if (res.data.success) {
                toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`);
                fetchUsers();
            } else {
                toast.error(res.data.message || 'Failed to update user status');
            }
        } catch (error) {
            toast.error('Something went wrong while updating status');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/admin/users/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success('User deleted successfully');
                fetchUsers();
            } else {
                toast.error(res.data.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error('Something went wrong while deleting user');
        }
    };

    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status !== 'banned').length;
    const bannedUsers = users.filter(user => user.status === 'banned').length;

    const { activePage, currentItems, handlePageChange, totalItems, itemsPerPage } = usePagination(users, 10);
    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Users Management</h3>
                    <p className="text-secondary mb-0">View and manage all registered users.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-users"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">TOTAL USERS</p>
                        <h2 className="text-white fw-bold mb-0">{totalUsers}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-user-check"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">ACTIVE USERS</p>
                        <h2 className="text-white fw-bold mb-0">{activeUsers}</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-user-xmark"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">BANNED USERS</p>
                        <h2 className="text-white fw-bold mb-0">{bannedUsers}</h2>
                    </div>
                </div>
            </div>

            <div className="auth-card p-4 rounded-4">
                <div className="table-responsive d-none d-xl-block">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-white py-4">No users to display</td>
                                </tr>
                            ) : (
                                currentItems?.map(user => (
                                    <tr key={user?._id}>
                                        <td>{user?._id.substring(0, 8)}...</td>
                                        <td>{user?.username}</td>
                                        <td>{user?.email}</td>
                                        <td className="text-capitalize">{user?.role}</td>
                                        <td>{new Date(user?.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${user?.status === 'banned' ? 'bg-danger' : 'bg-success'}`}>
                                                {user?.status === 'banned' ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(user?._id, user?.status)}
                                                    className={`btn btn-sm ${user?.status === 'banned' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                                                    title={user?.status === 'banned' ? 'Unban User' : 'Ban User'}
                                                >
                                                    <i className={`fa-solid ${user?.status === 'banned' ? 'fa-unlock' : 'fa-ban'}`}></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user?._id)}
                                                    className="btn btn-sm btn-outline-danger" title="Delete User">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-block d-xl-none mt-4">
                    {currentItems.length > 0 ? currentItems.map((user) => (
                        <div key={user._id} className="card bg-transparent border border-secondary mb-3 rounded-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h6 className="text-white mb-1">{user?.username}</h6>
                                        <p className="text-secondary small mb-0">{user?.email}</p>
                                    </div>
                                    <span className={`badge ${user?.status === 'banned' ? 'bg-danger' : 'bg-success'}`}>
                                        {user?.status === 'banned' ? 'Banned' : 'Active'}
                                    </span>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <small className="text-secondary">Role</small>
                                        <p className="text-white mb-0 text-capitalize">{user?.role}</p>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-secondary">Joined Date</small>
                                        <p className="text-white mb-0">{new Date(user?.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end align-items-center mt-3 pt-3 border-top border-secondary">
                                    <div className="d-flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange(user?._id, user?.status)}
                                            className={`btn btn-sm ${user?.status === 'banned' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                                            title={user?.status === 'banned' ? 'Unban User' : 'Ban User'}
                                        >
                                            <i className={`fa-solid ${user?.status === 'banned' ? 'fa-unlock' : 'fa-ban'}`}></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user?._id)}
                                            className="btn btn-sm btn-outline-danger" title="Delete User">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-users-slash fs-1 text-secondary mb-3"></i>
                            <h5 className="text-white">No users yet</h5>
                        </div>
                    )}
                </div>
                {users?.length > itemsPerPage && (
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

export default AdminUsers;
