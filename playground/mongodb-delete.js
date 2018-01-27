const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        console.log('Unable to connect to MongoDB server');
        return;
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').deleteMany({ text: 'Eat lunch' }).then((result) => {
    //     console.log(result.result); // n: number of docs deleted, ok: status
    // });

    // db.collection('Todos').deleteOne({ text: 'Eat lunch' }).then((result) => {
    //     console.log(result.result);
    // });

    // db.collection('Todos').findOneAndDelete({ completed: false }).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').deleteMany({ name: 'hastyy' }).then((result) => {
        console.log(result.result);
    });

    db.collection('Users').findOneAndDelete({ _id: new ObjectID('5a6cf7fa9fa7ae9a848d828c') }).then((result) => {
        console.log(JSON.stringify(result, undefined, 2));
    });

    //db.close();
});