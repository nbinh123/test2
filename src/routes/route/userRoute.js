// bắt đầu với file home
// là trang dành cho trang chủ, chứa các thông tin tổng quát
// bất cứ file nào cũng phải import các thư viện như thế này

const express = require("express")
const router = express.Router()
// nạp file HomeController
const UserController = require("../../controllers/UserController")
const authMiddleware = require("../middleware/auth.middleware")

router.get('/get_information/', authMiddleware, UserController.getInformation)

router.post('/auth/register', UserController.register)
router.post('/auth/login', UserController.login)

router.get('/', authMiddleware, UserController.getProfile)
router.put('/', authMiddleware, UserController.updateProfile)
// find
router.get('/email/search', authMiddleware, UserController.findUserByEmail)
router.get('/username/search', authMiddleware, UserController.findUserByUsername);

module.exports = router