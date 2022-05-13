const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const req = require("express/lib/request");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

//Feito------------------------------------------------------------->
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.findIndex((user) => {
    return user.username === username;
  });

  if (userAlreadyExist !== -1) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

//Feito------------------------------------------------------------->
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

//Feito------------------------------------------------------------->
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

//Feito------------------------------------------------------------->
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const index = user.todos.findIndex((object) => {
    return object.id === id;
  });

  if (index === -1) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  if (title) {
    user.todos[index].title = title;
  }
  if (deadline) {
    user.todos[index].deadline = deadline;
  }

  return response.status(201).json(user.todos[index]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((object) => {
    return object.id === id;
  });

  if (index === -1) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  user.todos[index].done = true;
  return response.status(201).json(user.todos[index]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((object) => {
    return object.id === id;
  });

  if (index === -1) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }
  user.todos.splice(index, 1);
  return response.status(204).send();
});

module.exports = app;
