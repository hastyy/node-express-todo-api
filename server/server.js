const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');


const app = express();

// If there is a JSON object in the body of the request, it gets
// parsed into a JS Object and attached to req -> req.body
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((doc) => {
            res.status(201).send(doc);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

app.listen(3000, () => console.log(`Started on PORT 3000`));
