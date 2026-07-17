import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Style.css';

function Notifications() {
    const [notifications, setNotifications] = useState(null);

    useEffect(() => {
        try {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/notification/get`, { withCredentials: true }).then((res) => {
                setNotifications(res.data.notifications);
                console.log(res.data.notifications);
            }).catch((err) => {
                toast.error("Failed to fetch notifications");
            });
        } catch (error) {
            toast.error("Failed to fetch notifications");
        }
    }, []);

    const getDaysAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);

        const diffInTime = now - past;
        const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

        return diffInDays;
    };

    const markAsRead = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/notification/read-all`, {}, { withCredentials: true }).then((res) => {
                toast.success(res.data.message);
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }).catch((err) => {
                toast.error("Failed to mark all notifications as read");
            });
        } catch (error) {
            toast.error("Failed to mark all notifications as read");
        }
    };
    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className='text-white fw-bold m-0'>Notifications</h2>
                <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={markAsRead}>Mark all as read</button>
            </div>

            <div className="row g-3">
                {notifications?.length > 0 ? notifications.map((item) => {
                    return (
                        <div className="col-12 col-md-6" key={item?._id}>
                            <div className={`card bg-dark rounded-4 shadow-sm p-4 position-relative overflow-hidden notification-card h-100 ${!item?.isRead ? 'unread-notification' : 'border-0'}`}>
                                <div className="d-flex flex-column z-1">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="mb-0 text-white fw-medium">{item?.title}</h5>
                                        <small className="text-white opacity-50">{getDaysAgo(item?.createdAt)} days ago</small>
                                    </div>
                                    <p className="mb-0 text-white opacity-75">{item?.message}</p>
                                </div>
                            </div>
                        </div>
                    )
                }) : <p className='text-white'>No notifications</p>}
            </div>
        </div>
    );
}

export default Notifications;