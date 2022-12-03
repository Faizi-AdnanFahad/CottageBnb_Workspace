const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

// We don't have to add username, password and salt ourselves. It will be added by `Passport`
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// will add a username, password and salt to our schema making sure the username is unique and password is hashed. 
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

module.exports = User;