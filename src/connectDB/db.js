const mongoose = require("mongoose")

require('dotenv').config();
const link = "mongodb+srv://nbinh0301:admin@mainserver.ez1m9pu.mongodb.net/?appName=MainServer";

async function connect() {

    // connect tới database blog
    try {
        await mongoose.connect(`${link}`,{
            dbName : "Main_Server",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
        });
        console.log("Connect project Successfully")
    } catch (error) {
        console.log("Connect project Failure!")
    }

    // connect tới database collection
    
}

module.exports = { connect };
