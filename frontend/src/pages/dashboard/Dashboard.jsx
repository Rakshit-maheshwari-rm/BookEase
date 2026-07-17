import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Revenue & Bookings',
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'Revenue ($)' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Bookings' },
      grid: { drawOnChartArea: false }
    }
  }
};

function Dashboard() {
  const [stats, setStats] = useState();
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: []
  });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/dashboard-stats`, { withCredentials: true }).then((res) => {
      setStats(res.data);
    }).catch((err) => {
      toast.error('Failed to get stats');
    });

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/booking/all-booking`, { withCredentials: true }).then((res) => {
      if (res.data.success) {
        const bookings = res.data.bookings || [];
        const monthlyRevenue = new Array(12).fill(0);
        const monthlyBookings = new Array(12).fill(0);

        bookings.forEach(b => {
          if (b.status !== 'cancelled') {
            const month = new Date(b.createdAt).getMonth();
            monthlyBookings[month] += 1;
            monthlyRevenue[month] += b.totalPrice || 0;
          }
        });

        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Revenue ($)',
              data: monthlyRevenue,
              backgroundColor: 'rgba(53, 162, 235, 0.7)',
              yAxisID: 'y',
            },
            {
              label: 'Bookings Count',
              data: monthlyBookings,
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              yAxisID: 'y1',
            }
          ]
        });
      }
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-white mb-1">Dashboard Overview</h3>
          <p className="text-secondary mb-0">Welcome back! Here's what's happening with your listings.</p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="overview-stat-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon-wrapper icon-revenue">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
            </div>
            <p className="text-secondary small mb-1">Total Revenue</p>
            <h2 className="text-white fw-bold mb-0">${stats?.totalRevenue || 0}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="overview-stat-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon-wrapper icon-listings">
                <i className="fa-solid fa-house"></i>
              </div>
            </div>
            <p className="text-secondary small mb-1">Active Listings</p>
            <h2 className="text-white fw-bold mb-0">{stats?.activeListing || 0}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="overview-stat-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon-wrapper icon-bookings">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
            </div>
            <p className="text-secondary small mb-1">Total Bookings</p>
            <h2 className="text-white fw-bold mb-0">{stats?.totalBooking || 0}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="overview-stat-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="stat-icon-wrapper icon-reviews">
                <i className="fa-solid fa-heart"></i>
              </div>
            </div>
            <p className="text-secondary small mb-1">Total Reviews</p>
            <h2 className="text-white fw-bold mb-0">{stats?.totalRating || 0}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-4 shadow-sm" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}

export default Dashboard;