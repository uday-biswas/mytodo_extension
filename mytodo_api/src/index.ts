require("dotenv").config();
const mongoose = require("mongoose");
import express from "express";
import { isAuth } from "./isAuth";
const User = require("./entities/user");
const Todo = require("./entities/todo");
const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const main = async () => {

  const DB_URL = process.env.DATABASE_URL;
  await mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("Connected to MongoDB"))
  .catch((err: any) => console.log(err));


  // const user1 = await User.create({ name: "bob", githubId: "12333"});
  // const todo1 = await Todo.create({ text: "clean", creatorId: user1._id });
  // const updatedUser = await User.findOneAndUpdate({ _id: user1._id }, { $push: { todos: todo1._id } }, { new: true });
  

  const app = express();
  passport.serializeUser((user: any, done: any) => {
    done(null, user.accessToken);
  });
  app.use(cors({ origin: "*" }));
  app.use(passport.initialize());
  app.use(express.json());

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
      },
      async (_ : any, __: any, profile: any, cb:any) => {
        let user = await User.findOne({ githubId: profile.id } );
        if (user) {
          user.name = profile.displayName;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            githubId: profile.id,
          });
        }
        cb(null, {
          accessToken: jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1y",
            }
          ),
        });
      }
    )
  );

  app.get("/auth/github", passport.authenticate("github", { session: false }));

  app.get("/auth/github/callback",
    passport.authenticate("github", { session: false }),
    (req: any, res) => {
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    }
  );

  app.get("/todo", isAuth, async (req : any, res) => {
    const todos = await Todo.find({ creatorId: req.userId }).sort({ _id: -1 });
    res.send({ todos });
  });

  app.post("/todo", isAuth, async (req: any, res) => {
    const todo = await Todo.create({
      text: req.body.text,
      creatorId: req.userId,
    });
    res.send({ todo });
  });

  app.put("/todo", isAuth, async (req: any, res) => {
    const todo = await Todo.findOne({_id: req.body.id});
    if (!todo) {
      res.send({ todo: null });
      return;
    }
    const userId = new mongoose.Types.ObjectId(req.userId);
    console.log("userId", userId);
    console.log("todo.creatorId", todo.creatorId);

    if (!todo.creatorId.equals(userId)) {
      throw new Error("not authorized");
    }
    todo.completed = !todo.completed;
    await todo.save();
    res.send({ todo });
  });

  app.delete("/todo", isAuth, async (req: any, res) => {
    const todo = await Todo.findOne({_id: req.body.id});
    if (!todo) {
      res.send({ success: false, message: "Todo not found" });
      return;
    }
    const userId = new mongoose.Types.ObjectId(req.userId);

    if (!todo.creatorId.equals(userId)) {
      throw new Error("not authorized");
    }
    await todo.remove();
    res.send({ success: true, message: "Todo deleted" });
});

  app.get("/me", async (req, res) => {
    // Bearer 120jdklowqjed021901
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    if (!authHeader) {
      res.send({ user: null });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.send({ user: null });
      return;
    }

    let userId = "";

    try {
      const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = payload.userId;
    } catch (err) {
      res.send({ user: null });
      return;
    }

    if (!userId) {
      res.send({ user: null });
      return;
    }

    const user = await User.findOne({_id: userId});

    res.send({ user });
  });

  app.get("/", (_req, res) => {
    res.send("hello all");
  });
  app.listen(3002, () => {
    console.log("listening on port 3002");
  });
};

main();
