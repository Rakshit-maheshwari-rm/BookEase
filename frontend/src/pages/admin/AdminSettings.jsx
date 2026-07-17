import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function AdminSettings() {
    const [settings, setSettings] = useState({
        platformCommission: 10,
        minWithdrawalAmount: 50,
        supportEmail: 'support@bookease.com',
        maintenanceMode: false,
        appVersion: 'v1.0.0'
    });



    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/setting/admin`, { withCredentials: true });
            if (res.data.success && res.data.settings) {
                setSettings(res.data.settings);
            }
        } catch (error) {
            toast.error('Failed to fetch settings');
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFinancialSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/setting/admin/financial`, {
                platformCommission: settings.platformCommission,
                minWithdrawalAmount: settings.minWithdrawalAmount
            }, { withCredentials: true });
            if (res.data.success) {
                toast.success('Financial settings updated successfully');
            } else {
                toast.error(res.data.message || 'Failed to update financial settings');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const handleSystemSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/setting/admin/system`, {
                supportEmail: settings.supportEmail,
                maintenanceMode: settings.maintenanceMode
            }, { withCredentials: true });
            if (res.data.success) {
                toast.success('System settings updated successfully');
            } else {
                toast.error(res.data.message || 'Failed to update system settings');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };



    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-white mb-1">Platform Settings</h3>
                    <p className="text-secondary mb-0">Configure global platform variables and settings.</p>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-revenue">
                                <i className="fa-solid fa-server"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">SYSTEM STATUS</p>
                        <h2 className={`fw-bold mb-0 ${settings.maintenanceMode ? 'text-warning' : 'text-success'}`}>
                            {settings.maintenanceMode ? 'MAINTENANCE' : 'ONLINE'}
                        </h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-listings">
                                <i className="fa-solid fa-percent"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">PLATFORM COMMISSION</p>
                        <h2 className="text-white fw-bold mb-0">{settings.platformCommission}%</h2>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="overview-stat-card p-4 h-100">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="stat-icon-wrapper icon-bookings">
                                <i className="fa-solid fa-code-branch"></i>
                            </div>
                        </div>
                        <p className="text-secondary small mb-1">APP VERSION</p>
                        <h2 className="text-white fw-bold mb-0">{settings.appVersion}</h2>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-6 mb-4">
                    <div className="auth-card p-4 rounded-4 h-100">
                        <h5 className="text-white mb-4">Financial Settings</h5>
                        <form onSubmit={handleFinancialSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-midwhite">Platform Commission Fee (%)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    name="platformCommission"
                                    value={settings.platformCommission}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    required
                                />
                                <div className="form-text text-secondary">The percentage cut taken from every successful booking.</div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-midwhite">Minimum Withdrawal Amount</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    name="minWithdrawalAmount"
                                    value={settings.minWithdrawalAmount}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill mt-3">Save Financial Settings</button>
                        </form>
                    </div>
                </div>
                
                <div className="col-lg-6 mb-4">
                    <div className="auth-card p-4 rounded-4 h-100">
                        <h5 className="text-white mb-4">System Settings</h5>
                        <form onSubmit={handleSystemSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-midwhite">Support Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4 form-check form-switch">
                                <input 
                                    className="form-control form-check-input admin-switch" 
                                    type="checkbox" 
                                    role="switch" 
                                    id="maintenanceMode" 
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label text-midwhite ms-2 mt-1 admin-switch-label" htmlFor="maintenanceMode">
                                    Enable Maintenance Mode
                                </label>
                                <div className="form-text text-secondary">If enabled, users will see a maintenance screen.</div>
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill mt-3">Save System Settings</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSettings;
