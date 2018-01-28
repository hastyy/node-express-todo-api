const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');


const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/todos', (req, res) => {
    Todo.find()
        .then((todos) => {
            res.send({ todos });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    Todo.findById(id)
        .then((todo) => {
            if (!todo)
                return res.status(404).send();

            res.send({ todo });
        })
        .catch(err => res.status(400).send());
});

app.listen(PORT, () => console.log(`Started on PORT ${PORT}`));


module.exports = app;
