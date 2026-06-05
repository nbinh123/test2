const Booking = require("../models/BookingModel");
const Doctor = require("../models/DoctorModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
function generateTimeSlots(startTime, endTime) {

    const slots = [];

    let startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    while (startHour < endHour) {

        slots.push(
            `${String(startHour).padStart(2, '0')}:00`
        );

        startHour++;
    }

    return slots;
}

class BookingController {
    // [POST] /api/bookings
    createBooking = async (req, res, next) => {
        try {
            const { patientId, doctorId, doctorName, date, time, mode, phone, price, note } = req.body;

            if (!patientId || !doctorId || !date || !time || !mode) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const booking = new Booking({
                patientId,
                doctorId,
                date,
                time,
                mode,
                phone,
                price,
                note,
                doctorName
            });

            await booking.save();

            res.status(201).json({
                message: 'Booking created successfully',
                booking
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Lịch hẹn bị trùng, vui lòng chọn khung giờ khác' });
            }
            next(error);
        }
    }

    // [GET] /api/bookings/:id
    getBookingById = async (req, res) => {
        try {
            const { id } = req.params;
            const booking = await Booking.findById(id)
                .populate('patientId', 'name email phone')
                .populate('doctorId', 'name specialty price');

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            res.json({ booking });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    getAllBookingsByUser = async (req, res) => {
        try {
            const { userId } = req.params;
            const bookings = await Booking.find({ patientId: userId })
                .populate('doctorId', 'name specialty price');

            res.json({ bookings });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [DELETE] /api/bookings/:id
    deleteBooking = async (req, res) => {
        try {

            const { id } = req.params;

            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({
                    message: 'Booking not found'
                });
            }

            // Nếu đã hủy rồi
            if (booking.status === 'CANCELLED') {
                return res.status(400).json({
                    message: 'Booking already cancelled'
                });
            }

            // Chuyển trạng thái
            booking.status = 'CANCELLED';

            // Đánh dấu thời gian hủy
            booking.cancelledAt = new Date();

            await booking.save();

            res.json({
                message: 'Booking cancelled successfully',
                booking
            });

        } catch (error) {

            res.status(500).json({
                message: 'Lỗi server'
            });
        }
    }


    getAvailableSlots = async (req, res) => {
        try {

            const { doctorId, date } = req.query;

            if (!doctorId || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu doctorId hoặc date'
                });
            }

            const doctor = await Doctor.findById(doctorId);

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            // lấy thứ trong tuần
            const dayName = new Date(date)
                .toLocaleDateString('en-US', {
                    weekday: 'long'
                });

            // tìm lịch làm
            const daySchedule = doctor.schedule.find(
                item => item.day === dayName
            );

            // bác sĩ nghỉ
            if (!daySchedule) {
                return res.json({
                    success: true,
                    availableSlots: [],
                    bookedSlots: []
                });
            }

            // generate slot
            const allSlots = generateTimeSlots(
                daySchedule.startTime,
                daySchedule.endTime
            );

            // booking đã có
            const bookings = await Booking.find({
                doctorId,
                date,
                status: {
                    $in: ['PENDING', 'CONFIRMED']
                }
            });

            // slot đã bị đặt
            const bookedSlots = bookings.map(
                item => item.time
            );

            // slot còn trống
            const availableSlots = allSlots.filter(
                slot => !bookedSlots.includes(slot)
            );

            return res.json({
                success: true,
                allSlots,
                availableSlots,
                bookedSlots
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }

    cancelBooking = async (req, res) => {
        try {

            const { bookingId } = req.params;
            const { userId } = req.body;

            console.log(userId)
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    message: 'Không tìm thấy lịch đặt'
                });
            }

            // Kiểm tra đúng user
            if (booking.patientId.toString() !== userId) {
                return res.status(403).json({
                    message: 'Bạn không có quyền hủy lịch này'
                });
            }

            // Không cho hủy lịch đã hủy
            if (booking.status === 'CANCELLED') {
                return res.status(400).json({
                    message: 'Lịch đã bị hủy trước đó'
                });
            }

            // Ghép ngày + giờ khám
            const bookingDateTime = new Date(
                `${booking.date}T${booking.time}`
            );

            const now = new Date();

            // Không cho hủy lịch đã khám xong
            if (bookingDateTime < now) {
                return res.status(400).json({
                    message: 'Không thể hủy lịch đã khám xong'
                });
            }

            // Giới hạn hủy trước 2 tiếng
            const diffMs = bookingDateTime - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 2) {
                return res.status(400).json({
                    message: 'Chỉ được hủy lịch trước ít nhất 2 tiếng'
                });
            }

            booking.status = 'CANCELLED';
            // Đánh dấu thời gian hủy
            booking.cancelledAt = new Date();

            await booking.save();

            res.json({
                message: 'Hủy lịch thành công',
                booking
            });

        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server'
            });
        }
    }

    rescheduleBooking = async (req, res) => {
        try {
            const { bookingId } = req.params;
            const { date, time, mode } = req.body;

            // Kiểm tra dữ liệu đầu vào
            if (!date || !time) {
                return res.status(400).json({
                    message: 'Vui lòng cung cấp ngày và giờ khám'
                });
            }

            // Tìm booking
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({
                    message: 'Không tìm thấy lịch đặt'
                });
            }

            // Không cho đổi lịch đã hủy hoặc đã hoàn thành
            if (
                booking.status === 'CANCELLED' ||
                booking.status === 'COMPLETED'
            ) {
                return res.status(400).json({
                    message: 'Không thể đổi lịch này'
                });
            }

            // Không cho đổi sang ngày giờ quá khứ
            const newBookingDate = new Date(`${date}T${time}:00`);

            if (newBookingDate < new Date()) {
                return res.status(400).json({
                    message: 'Không thể đổi sang thời gian trong quá khứ'
                });
            }

            // Kiểm tra trùng lịch bác sĩ
            const existedBooking = await Booking.findOne({
                _id: { $ne: bookingId }, // loại trừ chính booking hiện tại
                doctorId: booking.doctorId,
                date,
                time,
                status: {
                    $in: ['PENDING', 'CONFIRMED']
                }
            });

            if (existedBooking) {
                return res.status(400).json({
                    message: 'Khung giờ này đã được đặt'
                });
            }

            // Cập nhật lịch
            booking.date = date;
            booking.time = time;
            booking.mode = mode;
            await booking.save();

            // Populate thông tin nếu muốn trả thêm dữ liệu
            await booking.populate([
                {
                    path: 'doctorId',
                    select: 'name specialty'
                },
                {
                    path: 'patientId',
                    select: 'name email'
                }
            ]);

            return res.status(200).json({
                message: 'Đổi lịch thành công',
                booking
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: 'Lỗi server'
            });
        }
    };
}
module.exports = new BookingController;