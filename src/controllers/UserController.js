const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

class UserController {

    //  [POST]  /login
    login = async (req, res, next) => {
        const { email, password } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await User
            .findOne({ email })
            .select('+password');
        if (!user) return res.status(400).json({
            message: 'User does not exist',
            status: 400,
        });

        // Kiểm tra mật khẩu (so sánh mật khẩu nhập vào với mật khẩu mã hóa trong DB)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            message: 'Invalid credentials',
            status: 400,
            hi: user.password,
            hi2: password
        });

        // Tạo JWT token
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1d' });

        res.json({
            token: token,
            status: 200,
            id: user._id
        });
    }

    //  [POST]  /register
    register = async (req, res, next) => {
        try {
            const { name, email, username, password } = req.body;

            if (!email || !username || !password) {
                return res.status(400).json({
                    message: 'Missing required fields'
                });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Username already exists'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                username,
                password: hashedPassword,
                email,
                name: name || username
            });

            await newUser.save();

            res.status(201).json({
                message: 'User registered successfully',
                status: 201
            });

        } catch (error) {
            next(error);
        }
    }

    //  [GET]   /get_information
    getInformation = async (req, res) => {
        try {
            const userID = req.user.id; // lấy từ JWT

            const user = await User.findById(userID).select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.json({
                user,
                status: 200
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    };

    findUserByEmail = async (req, res) => {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).json({
                    message: 'Email là bắt buộc'
                });
            }

            const user = await User.findOne({
                email: email.toLowerCase()
            }).select('_id username email');

            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy user'
                });
            }

            res.json({
                id: user._id,
                username: user.username,
                email: user.email
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server'
            });
        }
    };

    findUserByUsername = async (req, res) => {
        try {
            const { username } = req.query;

            if (!username) {
                return res.status(400).json({
                    message: 'username là bắt buộc'
                });
            }

            const user = await User.findOne({
                username: username.trim()
            }).select('_id username email');

            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy user'
                });
            }

            res.json({
                id: user._id,
                username: user.username,
                email: user.email
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server'
            });
        }
    };
    // DELETE /api/users/:userId/observer
    removeObserver = async (req, res) => {
        try {
            const { userId } = req.params;

            const targetUser = await User.findById(userId);
            if (!targetUser) {
                return res.status(404).json({ message: 'User không tồn tại' });
            }

            if (
                req.user.id !== userId &&
                req.user.role !== 'admin'
            ) {
                return res.status(403).json({ message: 'Không có quyền xoá observer' });
            }

            targetUser.observer = null;
            await targetUser.save();

            res.json({ message: 'Đã xoá observer' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    };

    getProfile = async (req, res, next) => {
        try {

            const user = await User.findById(req.user.id)
                .select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            res.status(200).json(user);

        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req, res, next) => {
        try {

            const { name, phone, username } = req.body;

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                {
                    name,
                    phone,
                    username
                },
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");

            res.status(200).json({
                message: "Cập nhật thành công",
                user: updatedUser
            });

        } catch (error) {

            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Username đã tồn tại"
                });
            }

            next(error);
        }
    };
}

module.exports = new UserController;