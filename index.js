const express = require('express');
const fileSystem = require('fs');
const expressSession = require('express-session');

const app = express();

//middlewares
app.use(express.static(__dirname + '/public'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(expressSession({ secret: 'neeku endukura' }));

//routes
app.post('/check-user', (req, res) => {
    const { username, password } = req.body;

    const users = JSON.parse(fileSystem.readFileSync('user-todos.txt').toString());
    const isUserFound = users.some(user => user.username == username && user.password == password);

    if (isUserFound) {
        req.session.user = { username, password };
        res.status(200).send({ success: true, message: 'Login Successful' });
    }
    else {
        res.status(403).send({ success: false, message: 'You entered incorrect credentials.' })
    }
});

app.get('/get-todo-list', (req, res) => {
    if (!req.session.user) {
        res.redirect('./login.html');
        return;
    }
    const data = JSON.parse(fileSystem.readFileSync('user-todos.txt').toString());
    res.status(200).send({ success: true, message: `All Todos Sent.` });
});

app.post('/add-task', (req, res) => {
    const { id, task } = req.body;

    if (!(id && task)) {
        res.status(400).send({ success: false, message: "Task Details doesn't exists in the Request Body.", data: {} });
        return;
    }

    const data = JSON.parse(fileSystem.readFileSync('todos.txt'));
    const todos = data.todos;

    todos.push({ id, task });

    fileSystem.writeFileSync('todos.txt', JSON.stringify({ todos }));

    res.status(201).send({ success: true, message: `Task with id:${id} added.`, data: { id, task } })
});

app.delete('/delete-task', (req, res) => {
    const { id } = req.query;

    if (!id) {
        res.status(400).send({ success: false, message: "Task ID doesn't exists in the Request Body.", data: {} });
        return;
    }

    const data = JSON.parse(fileSystem.readFileSync('todos.txt'));
    const todos = data.todos;

    const indexOfTask = todos.findIndex(todo => todo.id === Number(id));

    if (indexOfTask == -1) {
        res.status(400).send({ success: false, message: `Task with id:${id} cannot be found.`, data: {} });
        return;
    }

    todos.splice(indexOfTask, 1);

    fileSystem.writeFileSync('todos.txt', JSON.stringify({ todos }));

    res.status(200).send({ success: true, message: `Task with id:${id} is Deleted.`, data: {} });
});

app.listen(6900, () => {
    console.log('Todos Server uriking on 6900 Port');
});