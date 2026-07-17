import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Style.css';

const localizer = momentLocalizer(moment);

function Calendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/all-booking`, { withCredentials: true });
                if (res.data.success || res.data.bookings) {
                    const bookings = res.data.bookings || [];
                    const calendarEvents = bookings.map(booking => ({
                        id: booking._id,
                        title: `${booking?.listing?.title} - ${booking?.user?.username || 'Guest'}`,
                        start: new Date(booking.checkIn),
                        end: new Date(booking.checkOut),
                        status: booking.status,
                        bookingId: booking.bookingId
                    }));
                    setEvents(calendarEvents);
                }
            } catch (error) {
                toast.error('Failed to get calendar bookings');
                console.error(error);
            }
        };

        fetchBookings();
    }, []);

    const eventStyleGetter = (event, start, end, isSelected) => {
        let className = 'rbc-event-confirmed';
        if (event.status === 'pending') {
            className = 'rbc-event-pending';
        } else if (event.status === 'cancelled') {
            className = 'rbc-event-cancelled';
        }
        return { className };
    };

    return (
        <div className="container">
            <div className="row">
                <div className="auth-card p-4 p-md-5 rounded-4 shadow-sm w-100 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <div>
                            <span className="host-badge mb-3 d-inline-block">CALENDAR OVERVIEW</span>
                            <h2 className="fw-bold text-white mb-0">Your Booking Calendar</h2>
                            <p className="text-midwhite mt-2 mb-0">View and manage all your property availability and upcoming guest stays in one place.</p>
                        </div>
                        <div className="d-flex gap-3 text-white text-12">
                            <div className="d-flex align-items-center gap-2">
                                <div className="calendar-legend-box calendar-legend-confirmed"></div> Confirmed
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="calendar-legend-box calendar-legend-pending"></div> Pending
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="calendar-legend-box calendar-legend-cancelled"></div> Cancelled
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-4 shadow-sm h-100 calendar-container-wrapper">
                        <BigCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            className="calendar-component-wrapper"
                            eventPropGetter={eventStyleGetter}
                            views={['month', 'week', 'day', 'agenda']}
                            tooltipAccessor={(event) => `${event.title} (Status: ${event.status})`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Calendar;