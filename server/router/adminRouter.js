const express = require('express');
const router = express.Router();
const { getAllUsers, updateUsers, deleteUser, updateUserRole } = require('../controller/userController');
const checkRole = require('../middlewares/roleMiddleware');
const testimonialController = require('../controller/testimonialController');
const { assignPlanAsAdmin } = require('../controller/subscriptionController');

router.get('/users', checkRole(['admin']), getAllUsers);
router.patch('/users/:id', checkRole(['admin']), updateUsers);
router.delete('/users/:id', checkRole(['admin']), deleteUser);
router.patch('/role/:id', checkRole(['admin']), updateUserRole)
// Admin routes
router.get('/testimonials', checkRole(['admin']), testimonialController.getAllTestimonials);
router.get('/testimonials/:id', checkRole(['admin']), testimonialController.getTestimonialById);
router.put('/testimonials/:id', checkRole(['admin']), testimonialController.updateTestimonial);
router.delete('/testimonials/:id', checkRole(['admin']), testimonialController.deleteTestimonial);

router.post("/assign-plan", assignPlanAsAdmin);
// Export the routes
module.exports = router;