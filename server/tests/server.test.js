const request = require('supertest');
const expect = require('expect');
const { ObjectID } = require('mongodb');

const app = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

    it('should create a new Todo', (done) => {
        const text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('X-Auth', users[0].tokens[0].token)
            .send({ text })
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.find({ text })
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
            .set('X-Auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);

                Todo.find()
                    .then((todos) => {
                        expect(todos.length).toBe(2);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

});

describe('GET /todos', () => {

    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('X-Auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });

});

describe('GET /todos/:id', () => {

    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('X-Auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${hexId}`)
            .set('X-Auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .set('X-Auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('X-Auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

});

describe('DELETE /todos/:id', () => {

    it('should remove a todo', (done) => {
        const hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('X-Auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) return done(err);

                Todo.findById(hexId)
                    .then((todo) => {
                        expect(todo).toBeFalsy(); // .toNotExist();
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
    });

    it('should not remove a todo created by other user', (done) => {
        const hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('X-Auth', users[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);

                Todo.findById(hexId)
                    .then((todo) => {
                        expect(todo).toBeTruthy();    //.toExist();
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
    });

    it('should return 404 if todo not found', (done) => {
        const hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('X-Auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        request(app)
            .delete('/todos/123')
            .set('X-Auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

});

describe('PATCH /todos/:id', () => {

    it('should update the todo', (done) => {
        const hexId = todos[0]._id.toHexString();
        const text = 'Text updated';
        const completed = true;

        request(app)
            .patch(`/todos/${hexId}`)
            .set('X-Auth', users[0].tokens[0].token)
            .send({ text, completed })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                //expect(res.body.todo.completedAt).toBeA('number');
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it('should not update the todo created by other user', (done) => {
        const hexId = todos[0]._id.toHexString();
        const text = 'Text updated';
        const completed = true;

        request(app)
            .patch(`/todos/${hexId}`)
            .set('X-Auth', users[1].tokens[0].token)
            .send({ text, completed })
            .expect(404)
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        const hexId = todos[1]._id.toHexString();
        const text = 'Text updated';
        const completed = false;

        request(app)
            .patch(`/todos/${hexId}`)
            .set('X-Auth', users[1].tokens[0].token)
            .send({ text, completed })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeFalsy();  //.toNotExist();
            })
            .end(done);
    });

});

describe('GET /users/me', () => {

    it('should return a user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('X-Auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

});

describe('POST /users', () => {

    it('should create a user', (done) => {
        const email = 'example@example.com';
        const password = '123mnb!';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(201)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();   //.toExist();    // X-Auth must be lowercased
                expect(res.body._id).toBeTruthy();    //.toExist();
                expect(res.body.email).toBe(email);
            })
            // Custom function to end to query the database and make sure everything
            // is fine there.
            .end((err) => {
                if (err) return done(err);

                User.findOne({ email })
                    .then((user) => {
                        expect(user).toBeTruthy();  //.toExist();
                        expect(user.password).not.toBe(password); //.toNotBe(password);    // Confirm password hashing

                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        const invalidEmail = 'example-example.com';
        const invalidPassword = 'abc';  // should be at least 6 chars long

        request(app)
            .post('/users')
            .send({ email: invalidEmail, password: invalidPassword })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({ email: users[0].email, password: 'abc123!' })
            .expect(400)
            .end(done);
    });

});

describe('POST /users/login', () => {

    it('should login user and return auth token', (done) => {
        const { _id, email, password } = users[0];

        request(app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();   //.toExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                User.findById(_id)
                    .then((user) => {
                        // expect(user.tokens[1]).toInclude({  // tokens[1] because it already had a token
                        //     access: 'auth',
                        //     token: res.headers['x-auth']
                        // });
                        expect(user.toObject().tokens[1]).toMatchObject({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });

                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should reject invalid login', (done) => {
        const { _id, email, password } = users[1];

        request(app)
            .post('/users/login')
            .send({ email, password: password+'1' })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeFalsy();  //.toNotExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                User.findById(_id)
                    .then((user) => {
                        expect(user.tokens.length).toBe(1);

                        done();
                    })
                    .catch((err) => done(err));
            });
    });

});

describe('DELETE /users/me/token', () => {

    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('X-Auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                User.findOne({ email: users[0].email })
                    .then((user) => {
                        expect(user.tokens.length).toBe(0);

                        done();
                    })
                    .catch((err) => done(err));
            });
    });

});
