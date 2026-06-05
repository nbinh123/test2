
const express = require("express")
const router = express.Router()
// nạp file HomeController
const BookingController = require("../../controllers/BookingController")
const authMiddleware = require("../middleware/auth.middleware")

router.get('/available-slots', authMiddleware, BookingController.getAvailableSlots)
// router.get('/all', authMiddleware, BookingController.getAllBookings)
router.get('/user/:userId', authMiddleware, BookingController.getAllBookingsByUser)
router.get('/:id', authMiddleware, BookingController.getBookingById)

router.post('/', authMiddleware, BookingController.createBooking)
router.delete('/:id', authMiddleware, BookingController.deleteBooking)
router.put('/cancel/:bookingId', BookingController.cancelBooking);
router.put('/reschedule/:bookingId', authMiddleware, BookingController.rescheduleBooking);



module.exports = router