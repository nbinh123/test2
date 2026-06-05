const Doctor = require("../models/DoctorModel");

class DoctorController {

    // [POST] /api/doctors
    createDoctor = async (req, res, next) => {
        try {
            const {
                name,
                avatar,
                specialty,
                hospital,
                experience,
                degree,
                bio,
                description,
                price,
                location,
                rating,
                reviews,
                totalReviews,
                tags,
                schedule
            } = req.body;

            // validate cơ bản
            if (!name || !specialty || !price) {
                return res.status(400).json({
                    message: 'Name, specialty và price là bắt buộc'
                });
            }

            const newDoctor = new Doctor({
                name,
                avatar,
                specialty,
                hospital,
                experience,
                degree,

                // hỗ trợ cả bio lẫn description
                description: description || bio || '',

                price,
                location,

                rating: rating || 0,

                // hỗ trợ reviews từ mock data
                totalReviews: totalReviews || reviews || 0,

                tags: tags || [],

                schedule: schedule || []
            });

            await newDoctor.save();

            return res.status(201).json({
                message: 'Doctor created successfully',
                doctor: newDoctor
            });

        } catch (error) {
            next(error);
        }
    }

    // [GET] /api/doctors
    getDoctors = async (req, res) => {
        try {
            const doctors = await Doctor.find();
            res.json({ doctors, status: 200 });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [GET] /api/doctors/:id
    getDoctorById = async (req, res) => {
        try {
            const { id } = req.params;
            const doctor = await Doctor.findById(id);

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            res.json({ doctor });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [PUT] /api/doctors/:id
    updateDoctor = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, specialty, hospital, price } = req.body;

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            if (name) doctor.name = name;
            if (specialty) doctor.specialty = specialty;
            if (hospital) doctor.hospital = hospital;
            if (price !== undefined) doctor.price = price;

            await doctor.save();

            res.json({ message: 'Doctor updated successfully', doctor });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [DELETE] /api/doctors/:id
    deleteDoctor = async (req, res) => {
        try {
            const { id } = req.params;
            const doctor = await Doctor.findByIdAndDelete(id);

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            res.json({ message: 'Doctor deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [GET] /api/doctors/search
    searchDoctors = async (req, res) => {
        try {
            const { specialty, hospital, name } = req.query;
            const query = {};

            if (specialty) query.specialty = new RegExp(specialty, 'i');
            if (hospital) query.hospital = new RegExp(hospital, 'i');
            if (name) query.name = new RegExp(name, 'i');

            const doctors = await Doctor.find(query);
            res.json({ doctors });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // [GET] /api/doctors/specialties/:specialty
    getAllDoctors = async (req, res, next) => {
        try {

            const { specialty } = req.query;

            // query mặc định
            const query = {
                isActive: true
            };

            // nếu có specialty thì filter
            if (specialty) {
                query.specialty = specialty;
            }

            const doctors = await Doctor.find(query);

            return res.status(200).json({
                success: true,
                total: doctors.length,
                doctors
            });

        } catch (error) {
            next(error);
        }
    }

    // [GET] /api/doctors/:id/schedule
    getDoctorSchedule = async (req, res) => {
        try {
            const { id } = req.params;
            const doctor = await Doctor.findById(id);

            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            res.json({ schedule: doctor.shedule || [] });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }


    seedDoctors = async (req, res, next) => {
        const doctors = [
            {
                name: "BS. Nguyễn Minh Anh",
                specialty: "Tim mạch",
                experience: "12 năm kinh nghiệm",
                degree: "ThS. Y khoa, Chuyên khoa I Tim mạch",
                rating: 4.9,
                reviews: 128,
                price: 450000,
                hospital: "Bệnh viện An Tâm",
                location: "Quận 1, TP.HCM",
                bio: "Chuyên khám và theo dõi bệnh tim mạch, tăng huyết áp, rối loạn mỡ máu.",
                schedule: [
                    {
                        day: "Monday",
                        startTime: "08:00",
                        endTime: "12:00"
                    },
                    {
                        day: "Wednesday",
                        startTime: "13:00",
                        endTime: "17:00"
                    },
                    {
                        day: "Friday",
                        startTime: "08:00",
                        endTime: "12:00"
                    }
                ],
                tags: ["Khám online", "Khám offline"],
                avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Trần Thu Hà",
                specialty: "Da liễu",
                experience: "9 năm kinh nghiệm",
                degree: "Bác sĩ Chuyên khoa I Da liễu",
                rating: 4.8,
                reviews: 96,
                price: 380000,
                hospital: "Phòng khám Sáng Da",
                location: "Bình Thạnh, TP.HCM",
                bio: "Điều trị mụn, viêm da cơ địa, dị ứng da và chăm sóc da chuyên sâu.",
                schedule: [
                    {
                        day: "Monday",
                        startTime: "13:00",
                        endTime: "17:00"
                    },
                    {
                        day: "Friday",
                        startTime: "08:00",
                        endTime: "11:00"
                    }
                ],
                tags: ["Khám online", "Khám offline"],
                avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16b?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Lê Quốc Huy",
                specialty: "Nhi khoa",
                experience: "15 năm kinh nghiệm",
                degree: "ThS. Nhi khoa",
                rating: 5.0,
                reviews: 201,
                price: 500000,
                hospital: "Nhi Đồng An Bình",
                location: "TP. Thủ Đức",
                bio: "Khám, tư vấn dinh dưỡng và theo dõi phát triển cho trẻ em.",
                schedule: [
                    {
                        day: "Monday",
                        startTime: "13:00",
                        endTime: "17:00"
                    },
                    {
                        day: "Friday",
                        startTime: "08:00",
                        endTime: "11:00"
                    }
                ],
                tags: ["Khám online", "Khám offline"],
                avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Trần Quốc Bảo",
                specialty: "Da liễu",
                experience: "8 năm kinh nghiệm",
                degree: "BS. Chuyên khoa Da liễu",
                rating: 4.8,
                reviews: 94,
                price: 350000,
                hospital: "Phòng khám Hồng Đức",
                location: "Quận 3, TP.HCM",
                bio: "Chuyên điều trị mụn, viêm da cơ địa và các bệnh lý về da.",
                schedule: [
                    {
                        day: "Monday",
                        startTime: "08:00",
                        endTime: "11:00"
                    },
                    {
                        day: "Thursday",
                        startTime: "14:00",
                        endTime: "16:00"
                    }
                ],
                tags: ["Khám online", "Khám offline"],
                avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Lê Thị Thanh",
                specialty: "Nhi khoa",
                experience: "15 năm kinh nghiệm",
                degree: "ThS. Nhi khoa",
                rating: 4.9,
                reviews: 210,
                price: 400000,
                hospital: "Bệnh viện Nhi Đồng",
                location: "Quận 5, TP.HCM",
                bio: "Theo dõi và điều trị các bệnh lý trẻ em từ sơ sinh đến thiếu niên.",
                schedule: [
                    {
                        day: "Tuesday",
                        startTime: "08:00",
                        endTime: "11:00"
                    },
                    {
                        day: "Friday",
                        startTime: "13:00",
                        endTime: "15:00"
                    }
                ],
                tags: ["Khám offline"],
                avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Phạm Hữu Đạt",
                specialty: "Tai Mũi Họng",
                experience: "10 năm kinh nghiệm",
                degree: "BS. CKI Tai Mũi Họng",
                rating: 4.7,
                reviews: 88,
                price: 320000,
                hospital: "Phòng khám Thành Công",
                location: "Bình Thạnh, TP.HCM",
                bio: "Điều trị viêm xoang, viêm họng và các bệnh lý tai mũi họng.",
                schedule: [
                    {
                        day: "Wednesday",
                        startTime: "08:00",
                        endTime: "10:00"
                    },
                    {
                        day: "Saturday",
                        startTime: "15:00",
                        endTime: "17:00"
                    }
                ],
                tags: ["Khám online"],
                avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Võ Minh Tâm",
                specialty: "Nội tổng quát",
                experience: "9 năm kinh nghiệm",
                degree: "BS. Nội khoa",
                rating: 4.6,
                reviews: 73,
                price: 300000,
                hospital: "Bệnh viện Gia Phúc",
                location: "Quận 7, TP.HCM",
                bio: "Khám tổng quát và điều trị các bệnh lý nội khoa phổ biến.",
                schedule: [
                    {
                        day: "Monday",
                        startTime: "13:00",
                        endTime: "15:00"
                    },
                    {
                        day: "Friday",
                        startTime: "08:00",
                        endTime: "10:00"
                    }
                ],
                tags: ["Khám online", "Khám offline"],
                avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Đặng Thị Hương",
                specialty: "Sản phụ khoa",
                experience: "14 năm kinh nghiệm",
                degree: "ThS. Sản phụ khoa",
                rating: 4.9,
                reviews: 176,
                price: 500000,
                hospital: "Bệnh viện Phụ sản Ánh Dương",
                location: "Quận 10, TP.HCM",
                bio: "Tư vấn thai kỳ, khám phụ khoa và theo dõi sức khỏe sinh sản.",
                schedule: [
                    {
                        day: "Tuesday",
                        startTime: "08:00",
                        endTime: "10:00"
                    },
                    {
                        day: "Thursday",
                        startTime: "13:00",
                        endTime: "15:00"
                    }
                ],
                tags: ["Khám offline"],
                avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Nguyễn Hoàng Nam",
                specialty: "Tim mạch",
                experience: "11 năm kinh nghiệm",
                degree: "BS. CKII Tim mạch",
                rating: 4.8,
                reviews: 132,
                price: 470000,
                hospital: "Bệnh viện Quốc Tế Việt",
                location: "Quận 2, TP.HCM",
                bio: "Chuyên điều trị tăng huyết áp và bệnh lý tim mạch mãn tính.",
                schedule: [
                    {
                        day: "Monday",
                        startTime: "08:00",
                        endTime: "11:00"
                    },
                    {
                        day: "Wednesday",
                        startTime: "14:00",
                        endTime: "16:00"
                    }
                ],
                tags: ["Khám online", "Khám offline"],
                avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
            },

            {
                name: "BS. Hồ Gia Linh",
                specialty: "Da liễu",
                experience: "6 năm kinh nghiệm",
                degree: "BS. Da liễu",
                rating: 4.5,
                reviews: 58,
                price: 280000,
                hospital: "Phòng khám An Khang",
                location: "Gò Vấp, TP.HCM",
                bio: "Điều trị mụn, nám, sẹo và chăm sóc da chuyên sâu.",
                schedule: [
                    {
                        day: "Wednesday",
                        startTime: "08:00",
                        endTime: "10:00"
                    },
                    {
                        day: "Saturday",
                        startTime: "13:00",
                        endTime: "14:00"
                    }
                ],
                tags: ["Khám online"],
                avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
            }
        ]
        try {

            await Doctor.deleteMany();

            await Doctor.insertMany(doctors);

            return res.status(201).json({
                message: 'Seed doctors successfully'
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DoctorController();
