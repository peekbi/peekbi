const express = require('express');
const router = express.Router();
const authorization = require('../middlewares/authMiddleware');
const { registerUser, loginUser, getUserDetails, updateUserDetails, getAllUsers, updateUsers, logout } = require('../controller/userController');
const checkRole = require('../middlewares/roleMiddleware');
router.post('/regester', registerUser);
router.post('/login', loginUser);
router.get('/:id', authorization, getUserDetails);
router.patch('/:id', authorization, updateUserDetails);
router.post('/logout', logout)
router.get('/', authorization, checkRole(['admin', 'admi']), getAllUsers);
router.patch('/admin/:id', authorization, checkRole(['admin', 'admi']), updateUsers);


// Export the routes
module.exports = router;