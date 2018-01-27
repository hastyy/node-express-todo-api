const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
        return;
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos')
    //     .find({ _id: new ObjectID('5a6cf2869fa7ae9a848d81fa') })
    //     .toArray()
    //     .then((docs) => {
    //         console.log('Todos');
    //         console.log(JSON.stringify(docs, undefined, 2));
    //     }, (err) => {
    //         console.log('Unable to fetch todos', err);
    //     });

    // db.collection('Todos')
    //     .find()
    //     .count()
    //     .then((count) => console.log('Todos count:', count))
    //     .catch((err) => console.log('Unable to fetch todos', err));

    db.collection('Users')
        .find({ name: 'hastyy' })
        .toArray()
        .then((docs) => console.log(JSON.stringify(docs, undefined, 2)))
        .catch((err) => console.log('Unable to fetch users', err));

    //db.close();
});