const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');


// Removes all documents - criteria field is required but
// an empty object targets all documents.
// Doesn't return the information back.
Todo.remove({}).then((result) => {
    console.log(result);
});

// Removes the 1st document that matches criteria.
// Returns the removed document.
Todo.findOneAndRemove({ text: 'Something to do from Postman' }).then((doc) => {
    console.log(doc);
});

// Removes the document with the passed ID if such exists.
// Returns the removed document.
// Returns null if no document was found.
Todo.findByIdAndRemove('5a6dc62e82386e2c706a4db3').then((doc) => {
    console.log(doc);
});
