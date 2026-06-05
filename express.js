const express = require("express") // dùng thư viện expres
const port = 5000
const app = express()
const path = require("path")
const methodOverride = require("method-override")


const cors = require('cors');
const helmet = require("helmet");

const db = require("./src/connectDB/db")
const route = require("./src/routes/routes")

app.use(express.static(path.join(__dirname, "public")))
app.use(methodOverride("_method"))
// đây là bước lưu vào biến body cho req.body trong phương thức post của form

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());


app.use(helmet());
//nodemon dùng để lắng nghe sự thay đổi file một cách liên tục
db.connect()
app.set('view engine', 'hbs'); // đuôi tệp mẫu mặc định là '.hbs'

app.use(methodOverride("_method"))
// đây là bước lưu vào biến body cho req.body trong phương thức post của form
app.use(cors({
    origin: "http://localhost:3000", // frontend của bạn
    credentials: true
}));
app.use(express.urlencoded({
    extended: true,
}));

app.use(express.json());
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // tối đa 5 request/IP
    message: "Too many requests, please try again later"
});

app.use(limiter);


app.listen(port, () => console.log(`http://localhost:${port}`))


//////////////////////////////////////


// sử dụng hàm route đã định nghĩa trong ./routes/index.js
route(app)