const userModel = require('../model/userModel');
const planModel = require('../model/planModel');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const moment = require('moment');
const { generateToken } = require('../utils/generateToken');
dotenv.config();

// User registration controller 
module.exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, userType, phone } = req.body;

        // Validate input
        if (!name || !password || !email) {
            return res.status(400).json({
                status: "error",
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "User already exists"
            });
        }
        let plan = await planModel.findOne({ name: 'null' });
        if (!plan) {
            plan = await planModel.create({
                name: 'free',
                price: 0,
                isActive: true,
                billingInterval: 'monthly',
                limits: {
                    download: 15,
                    uploads: 20,
                    analyse: 10,
                    aiPromts: 5,
                    reports: 100,
                    charts: 100,
                    maxUsersPerAccount: 1,
                    dataRetentionDays: 30,
                },
            });
        }

        // 📌 Calculate currentPeriodEnd based on billingInterval
        let currentPeriodEnd = null;
        const now = moment();

        switch (plan.billingInterval) {
            case 'monthly':
                currentPeriodEnd = now.clone().add(1, 'month').toDate();
                break;
            case 'yearly':
                currentPeriodEnd = now.clone().add(1, 'year').toDate();
                break;
            case 'lifetime':
                currentPeriodEnd = null; // No expiration for lifetime plans
                break;
        }
        //    generate token 
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({
            name,
            password: hashedPassword,
            email,
            userType,
            phone,
            role: 'user',
            plan: plan._id,
            subscriptionStatus: 'trialing',
            currentPeriodEnd,
        });

        await newUser.save();
        const token = generateToken(newUser);

        res.cookie("token", token);
        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            user: newUser,
            token,
            plan: plan,

        });
        // res.cookie('token', token, {
        //     httpOnly: true, 
        //     secure: false,  
        //     sameSite: 'strict',
        //     maxAge: 60 * 60 * 1000, 
        // });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}
// User login controller
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Username and password are required"
            });
        }

        // Find user by username
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid password"
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.cookie("token", token);
        // Update last login timestamps
        user.lastLogin.push(new Date());
        await user.save();
        // Return success response  

        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            user: { username: user.username, email: user.email, id: user._id, role: user.role, },
            token,
            user,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

// Get user details controller
module.exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        // Find user by ID
        const user = await userModel.findById(userId).populate('plan');
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            user: {
                id: user._id,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                name: user.name,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                bussinessCategory: user.category,
                username: user.username,
                bussinessType: user.businessType,
                companyName: user.companyName,
                subscriptionStataus: user.subscriptionStatus,
                currentPeriodEnd: user.currentPeriodEnd,
                repoerCount: user.reportCount,
                chartCount: user.chartCount,
                plan: user.plan,

            },
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

module.exports.updateUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        // Spread the userData directly into the update object
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: userData },
            { new: true, runValidators: true } // runValidators ensures schema validation on update
        ).populate('plan');
        // Check if user was found and updatedAt    


        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            Success: "True",
            message: "User details updated successfully",
            user: {
                id: updatedUser._id,
                createdAt: updatedUser.createdAt,
                lastLogin: updatedUser.lastLogin,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                userType: updatedUser.userType,
                bussinessCategory: updatedUser.category,
                username: updatedUser.username,
                bussinessType: updatedUser.businessType,
                companyName: updatedUser.companyName,
                subscriptionStataus: updatedUser.subscriptionStatus,
                currentPeriodEnd: updatedUser.currentPeriodEnd,
                repoerCount: updatedUser.reportCount,
                chartCount: updatedUser.chartCount,
                plan: updatedUser.plan,

            },
        });
    } catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};


module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().populate('plan');
        if (!users || users.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No users found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "All users fetched successfully",
            data: users,
            plan: users.plan,
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                userType: user.userType,
                category: user.category,
                bussenessType: user.businessType,
                plan: user.plan ? user.plan.name : 'No plan',
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
            })),
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

module.exports.updateUsers = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        // Find user by ID and update
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: userData },
            { new: true, runValidators: true } // runValidators ensures schema validation on update
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}

module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // find user by id and delete 
        const deletedUser = await userModel.findByIdAndDelete(userId)
        if (!deletedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }
        res.status(200).json({
            status: "success",
            message: "User details deleted successfully",
            user: deletedUser,
        })
    } catch (error) {
        console.error("Error deleting user details:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}
module.exports.updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                status: "error",
                message: "Role is required"
            });
        }

        const validRoles = ['user', 'admin', 'superadmin']; // Adjust based on your system
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                status: "error",
                message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`
            });
        }

        // Update user's role
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "User role updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

module.exports.userStatus = async (req, res) => {

}

module.exports.logout = async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out Successful' });
}