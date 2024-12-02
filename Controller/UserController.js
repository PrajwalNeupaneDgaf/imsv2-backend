const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../Middleware/Emailer');

// Register Logic
const register = async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password should be at least 8 characters" });
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email,
        name,
        password: hashedPassword
    });

    try {
        await newUser.save();
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );
        res.status(201).json({ message: 'Successfully Registered', token });
    } catch (error) {
        return res.status(500).json({
            message: "Some error occurred",
            error: error.message
        });
    }
};

// Login Logic
const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Email does not exist" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Password is incorrect" });
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
    );
    res.status(200).json({ message: 'Successfully logged in', token });
};

// Get User Data
const myUserData = async (req, res) => {
    const data = await User.findById(req.user._id);
    if (!data) {
        return res.status(404).json({ message: "User does not exist" });
    }
    res.status(200).json({
        message: "User Data",
        id: data._id,
        name: data.name,
        email: data.email,
        isVerified: data.isVerified,
        role:data.role
    });
};

// Verify Email
const verifyEmail = async (req, res) => {
    const { token } = req.params;


    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION);
        const user = await User.findById(decoded.userId);

        if(user.isVerified ==true){
            return res.status(400).json({ message: "Email is already verified" });
        }

        if (user) {
            user.isVerified = true;
            await user.save();
            return res.status(200).json({ message: "Email verified successfully" });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token", error: error.message });
    }
};

// Update Password
const updateInfo = async (req, res) => {
    const { newPassword, oldPassword, name } = req.body;

    if(!name && !newPassword ){
        return res.status(400).json({ message: "Please provide name or new password" });
    }
    
    if(!oldPassword && newPassword ){
        return res.status(400).json({ message: "Please provide old password" });
    }


    if(name ){
        const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true });
        if(!newPassword){
            return res.status(200).json({ message: "Name updated successfully" });
        }
    }


  if(newPassword && oldPassword){
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verify = await bcrypt.compare(oldPassword, user.password);
        if (!verify) {
            return res.status(400).json({ message: "Old password didn't match" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({ message: 'Successfully changed your password' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
  }
 
};

// Delete Account
const deleteAccount = async (req, res) => {
    const { password } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'No user found' });
        }

        const verify = await bcrypt.compare(password, user.password);
        if (!verify) {
            return res.status(400).json({ message: "Password didn't match" });
        }

        await user.delete();
        return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const sendEmail = async (req,res)=>{
    const user = await User.findById(req.user._id);
    if(user.isVerified){
        return res.status(400).json({message:'Email already verified'})
    }
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.EMAIL_VERIFICATION,
        { expiresIn: '1h' }
    );
    await sendVerificationEmail(user.email, token);
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

// Change User Role (Promote or Demote)
const changeUserRole = async (req, res) => {
    const { userId } = req.params;
    const { action } = req.body; // action will be either "promote" or "demote"

    // Validate action parameter
    if (action !== 'promote' && action !== 'demote') {
        return res.status(400).json({ message: "Invalid action. Must be 'promote' or 'demote'" });
    }

    // Check if the user is trying to change their own role
    if (req.user._id.toString() === userId) {
        return res.status(400).json({ message: "You cannot change your own role" });
    }

    // Fetch the user to be promoted or demoted
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Promote or demote the user based on the action
    if (action === 'promote') {
        if (user.role === 'admin') {
            return res.status(400).json({ message: "User is already an admin" });
        }
        user.role = 'admin';
        await user.save();
        return res.status(200).json({ message: "User promoted to admin" });
    }

    if (action === 'demote') {
        if (user.role === 'user') {
            return res.status(400).json({ message: "User is already a regular user" });
        }
        user.role = 'user';
        await user.save();
        return res.status(200).json({ message: "User demoted to regular user" });
    }
};

module.exports = {
    login,
    register,
    deleteAccount,
    updateInfo,
    verifyEmail,
    myUserData,
    sendEmail,
    getAllUsers,
    changeUserRole,
};
