const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');


const todoId            = '5a6dac5bd444656c2a2d8407';
const not_found_todoId  = '6a6dac5bd444656c2a2d8407';
const invalid_todoId    = '5a6dac5bd444656c2a2d840711';

// With Mongoose we don't have to convert a String id to
// an ObjectID instance -> this is only needed using the
// MongoDB Native Driver.
// .find({...}) always returns an array with 0...N elements.
// Use when want to potentially find more than 1 doc meething
// the criteria.
Todo.find({ _id: todoId }).then((todos) => {
    console.log('Todos:', todos);
});

// Always returns 1 object (the doc) or null, depending of
// whether a doc meeting the criteria was found.
// Returns the 1st one to meet the criteria.
// Use when only want 1 doc as result.
Todo.findOne({ _id: todoId }).then((todo) => {
    console.log('Todo:', todo);
});

// Same as .findOne({...})
// Should be used if the only criteria to query
// is the _id field.
if (!ObjectID.isValid(todoId)) {
    console.log('todoId not valid');
}

Todo.findById(todoId)
    .then((todo) => {
        if (!todo) return console.log('todoId not found');
        console.log('Todo by Id:', todo);
    })
    .catch((err) => {
        console.log(err);
    });


const userId            = '5a6d8eaa7903f5fe26775a34';
const not_found_userId  = '6a6d8eaa7903f5fe26775a34';
const invalid_userId    = '5a6d8eaa7903f5fe26775a3411';

if (!ObjectID.isValid(userId)) {
    console.log('userId not valid');
}

User.findById(userId)
    .then((user) => {
        if (!user) return console.log('userId not found');
        console.log('User by Id:', user);
    })
    .catch((err) => {
        console.log(err);
    });
    
