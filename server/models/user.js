const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        trim: true,
        validate: {
            validator: validator.isEmail,   // validator needs a function that expects value as argument -> .isEmail meets the requirement
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
}, { usePushEach: true } /* Necessary option to use user.tokens.push */);

// UserSchema.methods -> Instance methods
// Using the old function syntax instead of arrow functions
// because this binds the 'this' keyword, which will point
// to the instance object calling the method later.
UserSchema.methods.generateAuthToken = function() {
    const user = this;  // to understand better what we are manipulating in the method
    const access = 'auth';
    const _id = user._id.toHexString();
    const token = jwt.sign({ access, _id }, 'abc123').toString();

    //user.tokens.push({ access, token }); - throwing Error
    user.tokens = user.tokens.concat([{access, token}]); // Work around for the above line...

    // We are returning a Promise with one .then() already hooked in.
    // This is perfectly valid and in the controller side of things
    // we just have to hook another .then() to the returned result
    // which should expect the token as the value to be passed to
    // its callback: .then((token) => {...})
    return user.save().then(() => {
        return token;
    });
};

/**
 * Override of the toJSON method already made available by Mongoose.
 * We override this method so that when we send the user object in
 * res.send(user) , what gets send is the returned value of our
 * implementation (which will be a cut version of the whole user
 * document).
 * 
 * @Override
 */
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

// UserSchema.statics -> Model methods
// Like the static methods of a class, User (model) being the class.
//
// Using the old function syntax instead of arrow functions
// because this binds the 'this' keyword, which will point
// to the User model.
UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        // If we can't decode the token, return a Promise that will always reject
        return Promise.reject(e);
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

const User = mongoose.model('User', UserSchema);


module.exports = { User };