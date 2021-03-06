const express = require("express");
const router = express.Router();
const { loggedInOnly, loggedOutOnly } = require("../services/session");
const User = require("../models").User;

router.get("/", loggedInOnly, function(req, res, next) {
  const user = req.user;

  user
    .getAccounts()
    .then(accounts => {
      if (user.bestMin === 99999) {
        user.bestMin = 0;
      }
      res.render("home", { accounts, user });
    })
    .catch(next);
});

router.get("/workout", loggedInOnly, function(req, res) {
  res.render("workout");
});

router.post("/workout", loggedInOnly, function(req, res) {
  const body = req.body;
  const record = req.user;
  const workout = {
    push: body.pushup,
    pull: body.pullup,
    seconds: body.seconds,
    minutes: body.minutes,
    date: body.date
  };
  let best = {
    bestMin: record.bestMin,
    bestSec: record.bestSec,
    bestPull: record.bestPull,
    bestPush: record.bestPush
  };

  if (body.minutes + body.seconds / 60 < record.bestMin + record.bestSec) {
    best.bestMin = body.minutes;
    best.bestSec = body.seconds;
  }
  if (body.pullup > record.bestPull) {
    best.bestPull = body.pullup;
  }
  if (body.pushup > record.bestPush) {
    best.bestPush = body.pushup;
  }

  User.findByIdAndUpdate(req.user._id, {
    $set: {
      bestMin: best.bestMin,
      bestSec: best.bestSec,
      bestPull: best.bestPull,
      bestPush: best.bestPush
    },
    $push: { workouts: workout }
  })
    .then(user => {
      res.redirect("/vikings");
    })
    .catch(err => {
      console.log(err);
      res.redirect("/vikings");
    });
});

router.get("/show/:id", loggedInOnly, function(req, res, next) {
  User.findById(req.params.id)
    .then(user => {
      if (user.bestMin === 99999) {
        user.bestMin = 0;
      }
      res.render("show", { user });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/vikings");
    });
});

module.exports = router;
