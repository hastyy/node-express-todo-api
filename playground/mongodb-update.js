const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
        return;
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5a6cfced9fa7ae9a848d8330')
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then((result) => console.log(result));

    db.collection('Users')
        .findOneAndUpdate(
            { _id: new ObjectID('5a6cf7fa9fa7ae9a848d828c') },
            { $set: { name: 'new name' }, $inc: { age: 1 } },
            { returnOriginal: false }
        ).then(res => console.log(res));

    //db.close();
});