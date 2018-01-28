const request = require('supertest');
const expect = require('expect');

const app = require('./../server');
const { Todo } = require('./../models/todo');


beforeEach((done) => {
    // Empty the whole database
    Todo.remove({}).then(() => done());
});

describe('POST /todos', () => {

    it('should create a new Todo', (done) => {
        const text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);

                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should not create Todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(0);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

});