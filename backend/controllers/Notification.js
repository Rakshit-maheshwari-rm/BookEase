const Notification = require("../models/Notification");

module.exports.get = async(req,res) =>{
    try {
        const id = req.user.id;
        if(!id){
            return res.json({
                success:false,
                message:"User not found"
            });
        }
        const notifications = await Notification.find({user:id}).sort({ createdAt: -1 });;
        if(!notifications){
            return res.json({
                success:false,
                message:"Notifications not found"
            });           
        }
        res.json({
            success:true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Failed to get notifications"
        });
    }
};

module.exports.markAsRead = async(req,res) => {
    try {
        const id = req.user.id;
        const result = await Notification.updateMany(
            { user: id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({
            success:true,
            message:"Mark all notifications as read",
            result
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Failed to mark all notifications as read"
        });
    }
};