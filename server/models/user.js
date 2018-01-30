const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


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
    const token = jwt.sign({ access, _id }, process.env.JWT_SECRET).toString();

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

// Remove the specified token
UserSchema.methods.removeToken = function(token) {
    const user = this;

    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
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
        decoded = jwt.verify(token, process.env.JWT_SECRET);
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

UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;

    return User.findOne({ email })
        .then((user) => {
            if (!user) return Promise.reject();

            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, passwordsMatch) => {
                    if (!passwordsMatch) return reject();

                    resolve(user);
                });
            });
        })
}

// This function registers middleware to run right before a .save() operation
// to the users collection.
UserSchema.pre('save', function(next) {
    const user = this;

    /**
     * This code runs for every save operation, being it the first time we're
     * saving the user to the database or any time we are updating the user.
     * We can use .isModified(<field>) to know if the given field was altered
     * before issuing this .save() operation (this code only runs when .save is
     * invoked, and it runs right before it - 'pre' middleware).
     * 
     * If the password is being modified (it runs when we first register the user)
     * then we are running this callback logic.
     * Else, we stop the execution of the middleware here because otherwise we would
     * be re-hashing an already hashed password.
     */
    if (!user.isModified('password')) next();

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
});

const User = mongoose.model('User', UserSchema);


module.exports = { User };