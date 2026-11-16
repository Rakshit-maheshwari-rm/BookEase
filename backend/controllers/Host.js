const Host = require("../models/Host");
const User = require("../models/User");
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = crypto.scryptSync(process.env.SECRET || "bookease-super-secret-key-32b!", "bookease-salt", 32);
const IV_LENGTH = 16;

function encrypt(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(String(text), "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(text) {
    if (!text || typeof text !== "string" || !text.includes(":")) return text;
    try {
        const [ivHex, encryptedHex] = text.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch {
        return text;
    }
}

function mask(text) {
    if (!text) return "";
    const str = String(text);
    return str.length > 4 ? `****${str.slice(-4)}` : "****";
}

module.exports.create = async (req, res) => {
    try {
        let { form } = req.body;

        if (typeof form === 'string') {
            form = JSON.parse(form);
        }

        const existingHost = await Host.findOne({ email: form.email });
        if (existingHost) {
            return res.json({
                success: false,
                message: "A host application for this email has already been submitted."
            });
        }

        let user = await User.findOne({ email: form.email });

        if (user) {
            const { user: authUser, error: authError } = await user.authenticate(form.password);
            if (authError || !authUser) {
                return res.json({
                    success: false,
                    message: "An account with this email already exists. Invalid password provided."
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
                accountNumber: encrypt(form.accountNumber),
                routingNumber: encrypt(form.routingNumber),
            },
            agreedToTerms: form.agreedToTerms,
        });

        const hostUser = await newHost.save();

        const safeHostUser = hostUser.toObject();
        if (safeHostUser.bankDetails) {
            safeHostUser.bankDetails.accountNumber = mask(form.accountNumber);
            safeHostUser.bankDetails.routingNumber = mask(form.routingNumber);
        }

        return res.json({
            success: true,
            message: "Host application submitted successfully",
            hostUser: safeHostUser
        });
    } catch (error) {
        console.error("Error creating host:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create new host user",
        });
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
        });
    }
};

module.exports.adminGetAll = async (req, res) => {
    try {
        const requests = await Host.find({}).sort({ createdAt: -1 }).lean();
        const safeRequests = requests.map(request => {
            if (request.bankDetails) {
                if (request.bankDetails.accountNumber) {
                    request.bankDetails.accountNumber = mask(decrypt(request.bankDetails.accountNumber));
                }
                if (request.bankDetails.routingNumber) {
                    request.bankDetails.routingNumber = mask(decrypt(request.bankDetails.routingNumber));
                }
            }
            return request;
        });
        res.json({
            success: true,
            requests: safeRequests
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
                success: false,
                message: "Host request not found"
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
