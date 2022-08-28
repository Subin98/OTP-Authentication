const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    email:{
        type: String,
        unique: true
    },
    name: String,
    otp: Number

});

var users = mongoose.model("users", userSchema)

module.exports = users;