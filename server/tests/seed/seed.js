const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');


const secret = 'abc123';
const access = 'auth';
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
    {
        _id: userOneId,
        email: 'hastyy@example.com',
        password: 'userOnePass',
        tokens: [{
            access,
            token: jwt.sign({ access, _id: userOneId.toHexString() }, secret).toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'mimii@example.com',
        password: 'userTwoPass',
        tokens: [{
            access,
            token: jwt.sign({ access, _id: userTwoId.toHexString() }, secret).toString()
        }]
    }
];

const todos = [
    { _id: new ObjectID(), text: 'First test todo', _creator: userOneId },
    { _id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 123, _creator: userTwoId }
];

const populateTodos = (done) => {
    // Empty the whole database
    // Insert todos array into the database
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos);
        })
        .then(() => done());
};

const populateUsers = (done) => {
    User.remove({})
        .then(() => {
            const userOne = new User(users[0]);
            const userTwo = new User(users[1]);

            // Can't user .insertMany here because that methods prevents middleware
            // from running, which means our passwords would not be hashed.
            return Promise.all([userOne.save(), userTwo.save()]);
        })
        .then(() => done());
};


module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
};