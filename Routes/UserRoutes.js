const express = require('express');
const { 
    login, 
    register, 
    deleteAccount, 
    updateInfo, 
    verifyEmail, 
    myUserData, 
    sendEmail, 
    getAllUsers,
    changeUserRole
} = require('../Controller/UserController');
const {Authenticate, Authorize } = require('../Middleware/UserMiddleware')
const User = require('../Models/User');

const router = express.Router();


router.post('/register', register); // User registration
router.post('/login', login);       // User login
router.get('/verify/:token',Authenticate, verifyEmail); // Email verification

router.use(Authenticate)
router.get('/me', myUserData);          // Fetch user data
router.post('/update-info', updateInfo); // Update password
router.delete('/delete-account', deleteAccount); // Delete user account
router.post('/sendemail', sendEmail);  // Resend verification email
router.post('/changerole/:userId', changeUserRole);


// DELETE: Delete user by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove(); // Delete the user from the database
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
