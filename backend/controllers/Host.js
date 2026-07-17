const Host = require("../models/Host");
const User = require("../models/User");

module.exports.create = async (req, res) => {
    try {
        let { form } = req.body;

        if (typeof form === 'string') {
            form = JSON.parse(form);
        }

        let user = await User.findOne({ email: form.email });

        if (user) {
            const { user: authUser } = await User.authenticate()(form.email, form.password);
            if (!authUser) {
                return res.json({
                    success: false,
                    message: "An account with this email already exists."
                });
            }
        } else {
            const newUsername = form.email.split('@')[0] + Math.floor(Math.random() * 10000);
            const newUser = new User({
                email: form.email,
                username: newUsername,
                role: "user",
                phone: form.phone,
                dob: form.dob,
                idType: form.idType,
                idNumber: form.idNumber,
                language: form.language
            });
            await User.register(newUser, form.password);
        }

        const idImageFilename = req.file ? (req.file.path || req.file.filename) : form.idImage;

        const newHost = new Host({
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            dob: form.dob,
            residentialAddress: form.residentialAddress,
            idType: form.idType,
            idNumber: form.idNumber,
            idImage: idImageFilename,
            language: form.language,
            hasHostedBefore: form.hasHostedBefore,
            motivation: form.motivation,
            bankDetails: {
                accountHolderName: form.accountHolderName,
                bankName: form.bankName,
                accountNumber: form.accountNumber,
                routingNumber: form.routingNumber,
            },
            agreedToTerms: form.agreedToTerms,
        });
        const hostUser = await newHost.save();
        return res.json({
            success: true,
            message: "Host application submitted successfully",
            hostUser
        });
    } catch (error) {
        console.error("Error creating host:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create new host user",
        })
    }
};

module.exports.check = async (req, res) => {
    try {
        const { checkForm } = req.body;
        const hostUser = await Host.findOne({ email: checkForm.email });
        if (!hostUser) {
            return res.json({
                success: false,
                message: "Host application not found",
            });
        }

        const user = await User.findOne({ email: checkForm.email });
        if (!user) {
            return res.json({
                success: false,
                message: "No user account found for this email",
            });
        }

        const { user: authenticatedUser, error: passwordError } = await user.authenticate(checkForm.password);

        if (passwordError || !authenticatedUser) {
            return res.json({
                success: false,
                message: "Incorrect password",
            });
        }

        return res.json({
            success: true,
            email: hostUser.email,
            verifiedUser: hostUser.verificationStatus
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to check status",
        })
    }
};

module.exports.adminGetAll = async (req, res) => {
    try {
        const requests = await Host.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch host requests"
        });
    }
};

module.exports.adminApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const hostRequest = await Host.findById(id);
        if (!hostRequest) {
            return res.json({
                success: false,
                message: "Host request not found"
            });
        }

        hostRequest.verificationStatus = "approved";
        await hostRequest.save();

        const user = await User.findOne({ email: hostRequest.email });
        if (user) {
            user.role = "host";
            await user.save();
        }

        res.json({
            success: true,
            message: "Host request approved successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to approve host request"
        });
    }
};

module.exports.adminReject = async (req, res) => {
    try {
        const { id } = req.params;
        const hostRequest = await Host.findById(id);
        if (!hostRequest) {
            return res.json({
                success: false
                , message: "Host request not found"
            });
        }

        hostRequest.verificationStatus = "rejected";
        await hostRequest.save();

        res.json({
            success: true,
            message: "Host request rejected successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to reject host request"
        });
    }
};