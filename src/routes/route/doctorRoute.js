// bắt đầu với file home
// là trang dành cho trang chủ, chứa các thông tin tổng quát
// bất cứ file nào cũng phải import các thư viện như thế này

const express = require("express")
const router = express.Router()
// nạp file HomeController
const DoctorController = require("../../controllers/DoctorController")
const authMiddleware = require("../middleware/auth.middleware")

router.get('/', DoctorController.getDoctors)
router.get('/seed', DoctorController.seedDoctors)
router.post('/', authMiddleware, DoctorController.createDoctor)
router.get('/:id', authMiddleware, DoctorController.getDoctorById)
// tìm kiếm theo chuyên khoa
router.get('/specialties', authMiddleware, DoctorController.getAllDoctors)
router.get('/:id/schedule', authMiddleware, DoctorController.getDoctorSchedule)

router.put('/:id', authMiddleware, DoctorController.updateDoctor)
router.delete('/:id', authMiddleware, DoctorController.deleteDoctor)

module.exports = router