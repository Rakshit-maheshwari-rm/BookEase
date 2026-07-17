const Setting = require("../models/Setting");

module.exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch settings"
        });
    }
};

module.exports.updateFinancialSettings = async (req, res) => {
    try {
        const { platformCommission, minWithdrawalAmount } = req.body;
        let settings = await Setting.findOne();
        if (!settings) settings = await Setting.create({});

        if (platformCommission !== undefined) settings.platformCommission = Number(platformCommission);
        if (minWithdrawalAmount !== undefined) settings.minWithdrawalAmount = Number(minWithdrawalAmount);

        await settings.save();

        res.json({
            success: true,
            message: "Financial settings updated", settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update financial settings"
        });
    }
};

module.exports.updateSystemSettings = async (req, res) => {
    try {
        const { supportEmail, maintenanceMode } = req.body;
        let settings = await Setting.findOne();
        if (!settings) settings = await Setting.create({});

        if (supportEmail !== undefined) settings.supportEmail = supportEmail;
        if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);

        await settings.save();

        res.json({
            success: true,
            message: "System settings updated", settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update system settings"
        });
    }
};
