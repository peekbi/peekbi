const express = require('express');
const router = express.Router();
const { getAllUsers, updateUsers } = require('../controller/userController');
const checkRole = require('../middlewares/roleMiddleware');



router.get('/users', checkRole(['admin']), getAllUsers);
router.patch('users/:id', checkRole(['admin']), updateUsers);


// Export the routes
module.exports = router;