require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const userModel = require("./modules/user");
const todoModel = require("./modules/todo");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const sendMail = require("./utils/sendMail.js");
const mongoose = require("mongoose");
const cors = require("cors");



/* ---------------- DB ---------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PATCH"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------- AUTH ---------------- */
function isLoggedIn(req, res, next) {
  try {
    if (!req.cookies.token) {
      return res.status(401).send("Please login first");
    }

    const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}

/* ---------------- TEST ---------------- */
app.get("/", (req, res) => {
  res.send("Working");
});

/* ---------------- SIGNUP ---------------- */
app.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password, age } = req.body;

    const existing = await userModel.findOne({ email });
    if (existing) return res.status(400).send("User already exists");

    const hash = await bcrypt.hash(password, 10);

    const newuser = await userModel.create({
      name,
      username,
      email,
      password: hash,
      age,
      todos: []
    });

    const token = jwt.sign(
      { email, userid: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: "lax",
    });

    await sendMail(
      email,
      "Welcome to Todo App",
      `Hi ${name}, your account is created successfully!`
    );

    res.status(201).send(newuser);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Wrong password");

    const token = jwt.sign(
      { email, userid: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: "lax",
    });

    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ---------------- LOGOUT ---------------- */
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logged out");
});

/* ---------------- ME ---------------- */
app.get("/me", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  res.send(user);
});

/* ---------------- GET TODOS ---------------- */
app.get("/todos", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });

  const todos = await todoModel
    .find({ user: user._id })
    .sort({ createdAt: -1 });

  res.send(todos);
});

/* ---------------- CREATE TODO ---------------- */
app.post("/todos", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });

  const { content, type, remindAt } = req.body;

  if (type === "reminder" && remindAt) {
    if (new Date(remindAt) <= new Date()) {
      return res.status(400).send("Reminder must be in future");
    }
  }

  const todo = await todoModel.create({
    user: user._id,
    content,
    type: type || "todo",
    remindAt: remindAt || null,
    isCompleted: false,
    completedAt: null
  });

  if (!user.todos) user.todos = [];
  user.todos.push(todo._id);
  await user.save();

  res.send(todo);
});

/* ---------------- COMPLETE TODO ---------------- */
app.patch("/todos/:id/complete", isLoggedIn, async (req, res) => {
  const todo = await todoModel.findById(req.params.id);

  if (!todo) return res.status(404).send("Not found");

  // reminder auto delete
  if (todo.type === "reminder") {
    await todoModel.findByIdAndDelete(req.params.id);

    await userModel.updateOne(
      { email: req.user.email },
      { $pull: { todos: req.params.id } }
    );

    return res.send({ message: "Reminder completed & deleted" });
  }

  todo.isCompleted = true;
  todo.completedAt = new Date();
  await todo.save();

  res.send(todo);
});

/* ---------------- DELETE TODO ---------------- */
app.delete("/todos/:id", isLoggedIn, async (req, res) => {
  const todo = await todoModel.findById(req.params.id);
  if (!todo) return res.status(404).send("Not found");

  await todoModel.findByIdAndDelete(req.params.id);

  await userModel.updateOne(
    { email: req.user.email },
    { $pull: { todos: req.params.id } }
  );

  res.send({ message: "Todo deleted" });
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});