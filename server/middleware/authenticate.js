const { User } = require('./../models/user');


const authenticate = (req, res, next) => {
    const token = req.header('X-Auth');

    User.findByToken(token)
        .then((user) => {
            // No user, same as failing in findByToken - goes to .catch()
            if (!user) Promise.reject();

            req.user = user;
            req.token = token;

            next();
        })
        .catch((err) => {
            res.status(401).send();
        });
};


module.exports = { authenticate };