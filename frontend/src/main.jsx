import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import ProtectedRoute from "./context/ProtectedRoute";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import HomePage from './pages/home/HomePage';
import Profile from './pages/user/Profile';
import Reviews from './pages/user/Reviews';
import Bookings from './pages/user/Bookings';
import Navbar from './Layout/Navbar';
import Footer from './Layout/Footer';
import Favorites from './pages/user/Favorites';
import Notifications from './pages/user/Notifications';
import Explore from './pages/explore/Explore';
import BecomeHost from './pages/host/BecomeHost';
import ListingPage from './pages/listing/ListingPage';
import Checkout from './pages/listing/Checkout';
import ListingCreate from './pages/dashboard/ListingCreate';
import DashboardPage from './pages/dashboard/DashboardPage';
import Dashboard from './pages/dashboard/Dashboard';
import ListingTable from './pages/dashboard/ListingTable';
import ListingReview from './pages/dashboard/ListingReview';
import ListingBooking from './pages/dashboard/ListingBooking';
import Destination from './pages/home/Destination';
import ListingEdit from './pages/dashboard/ListingEdit';
import Calendar from './pages/dashboard/Calendar';
import Earnings from './pages/dashboard/Earnings';
import Withdrawals from './pages/dashboard/Withdrawals';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBookings from './pages/admin/AdminBookings';
import AdminHostRequests from './pages/admin/AdminHostRequests';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminSettings from './pages/admin/AdminSettings';
import NotFound from './pages/NotFound';

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <CurrencyProvider>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <BrowserRouter>
                <Routes>
                    <Route element={<><Navbar /><Outlet /><Footer /></>}>
                        <Route path="/" element={<HomePage />} />
                        <Route path='/login' element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/bookings" element={<Bookings />} />
                            <Route path="/reviews" element={<Reviews />} />
                            <Route path='/favorites' element={<Favorites />} />
                            <Route path='/notifications' element={<Notifications />} />
                            <Route path='/checkout/:id' element={<Checkout />} />
                        </Route>
                        <Route path='/become-host' element={<BecomeHost />} />
                        <Route path='/explore' element={<Explore />} />
                        <Route path='/listing/:id' element={<ListingPage />} />
                        <Route path='/destination-finder' element={<Destination />}></Route>
                    </Route>

                    <Route element={<ProtectedRoute role="host"><DashboardPage /></ProtectedRoute>}>
                        <Route path='/dashboard' element={<Dashboard />} />
                        <Route path='/listing/create' element={<ListingCreate />} />
                        <Route path='/dashboard/listings' element={<ListingTable />} />
                        <Route path='/listing/review-all' element={<ListingReview />}></Route>
                        <Route path='/listing/bookings-all' element={<ListingBooking />}></Route>
                        <Route path='/dashboard/calendar' element={<Calendar />}></Route>
                        <Route path='/dashboard/earnings' element={<Earnings />}></Route>
                        <Route path='/dashboard/withdrawals' element={<Withdrawals />}></Route>
                        <Route path='/listing/edit/:id' element={<ListingEdit />}></Route>
                    </Route>

                    <Route element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>}>
                        <Route path='/admin-dashboard' element={<AdminDashboard />} />
                        <Route path='/admin-dashboard/users' element={<AdminUsers />} />
                        <Route path='/admin-dashboard/listings' element={<AdminListings />} />
                        <Route path='/admin-dashboard/withdrawals' element={<AdminWithdrawals />} />
                        <Route path='/admin-dashboard/reviews' element={<AdminReviews />} />
                        <Route path='/admin-dashboard/bookings' element={<AdminBookings />} />
                        <Route path='/admin-dashboard/host-requests' element={<AdminHostRequests />} />
                        <Route path='/admin-dashboard/revenue' element={<AdminRevenue />} />
                        <Route path='/admin-dashboard/settings' element={<AdminSettings />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </CurrencyProvider>
    </AuthProvider>
)