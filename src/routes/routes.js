// import các controller 
const userRoute = require("../routes/route/userRoute")

function router(app){ 
    app.use("/api/users",  userRoute)
    app.use("/api/doctors",  require("../routes/route/doctorRoute"))
    app.use("/api/bookings",  require("../routes/route/bookingRoute"))
    // app.use("/haha",  controller)
    // app.use("/haha",  controller)
    // app.use("/haha",  controller)
    // app.use("/haha",  controller)
    // app.use("/haha",  controller)
    // app.use("/haha",  controller)
}

module.exports = router