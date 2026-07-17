import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const navLinks = [
    { icon: "fa-solid fa-chart-line", label: "Overview", path: "/admin-dashboard" },
    { icon: "fa-solid fa-users", label: "Users", path: "/admin-dashboard/users" },
    { icon: "fa-solid fa-house", label: "All Listings", path: "/admin-dashboard/listings" },
    { icon: "fa-solid fa-calendar-check", label: "All Bookings", path: "/admin-dashboard/bookings" },
    { icon: "fa-solid fa-star", label: "All Reviews", path: "/admin-dashboard/reviews" },
    { icon: "fa-solid fa-money-bill-transfer", label: "Withdrawals", path: "/admin-dashboard/withdrawals" },
    { icon: "fa-solid fa-sack-dollar", label: "Revenue", path: "/admin-dashboard/revenue" },
    { icon: "fa-solid fa-user-plus", label: "Host Requests", path: "/admin-dashboard/host-requests" },
    { icon: "fa-solid fa-gear", label: "Settings", path: "/admin-dashboard/settings" }
];

function AdminDashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="dashboard-wrapper">
            {sidebarOpen && (
                <div
                    className="dashboard-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`dashboard-sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
                <div className="sidebar-brand p-3">
                    <h2 className="sidebar-brand-name mx-auto fw-bold">Admin Panel</h2>
                    <button
                        className="sidebar-close-btn d-lg-none"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <p className="sidebar-section-label">MAIN MENU</p>

                <nav className="sidebar-nav">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`sidebar-nav-item${isActive ? " active" : ""}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <i className={`${link.icon} sidebar-nav-icon`}></i>
                                <span>{link.label}</span>
                                {isActive && <span className="sidebar-active-dot ms-auto"></span>}
                            </Link>
                        );
                    })}
                </nav>
                <div className="text-center mb-3">
                    <a href="/" className="text-decoration-none"><i className="fa-solid fa-arrow-left me-1"></i>Back To Home</a>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="dashboard-mobile-header d-lg-none d-flex align-items-center p-3">
                    <button
                        className="btn btn-outline-light border-0 px-2 py-1 me-3"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <i className="fa-solid fa-bars fs-4"></i>
                    </button>
                    <h5 className="text-white mb-0 fw-bold">Admin Panel</h5>
                </div>

                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminDashboardPage;