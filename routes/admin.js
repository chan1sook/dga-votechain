const express = require('express');
const router = express.Router();
const multer = require("multer");
const bcrypt = require('bcrypt');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
const { isAdminRole, isDevRole } = require('../helper');

dayjs.extend(utc);
dayjs.extend(tz);

router.get('/', (req, res, next) => {
  if (isAdminRole(req.session.userData)) {
    req.app.db.models.Voter.find({}, {
      "image": false
    }, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      req.app.db.models.Topic.find({}, function (err, topics) {

        if (err) {
          console.log(err);
          return next(err);
        }
        
        return res.render('admin', {
          isAdmin: isAdminRole(req.session.userData),
          voters: data,
          topics: topics.map((ele) => ele.toJSON()),
          formatDate(date) {
            return dayjs(date).tz("Asia/Bangkok").format("D MMM YYYY H:mm");
          }
        });
      });
    });
  } else {
    return res.redirect('/admin/login');
  }
});

router.get('/login', (req, res, next) => {
  if (isAdminRole(req.session.userData)) {
    return res.redirect('/admin');
  } else {
    return res.render('login', {
      isAdmin: isAdminRole(req.session.userData),
    });
  }
});

router.get('/verifyvoter/:id', (req, res, next) => {
  if (isAdminRole(req.session.userData)) {
    req.app.db.models.Voter.findById(req.params.id, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
      data.isValid = true;
      data.save();

      return res.redirect('/admin');
    });
  } else {
    return res.redirect('/admin/login');
  }
});

router.get('/logout', (req, res, next) => {
  delete req.session.userData;

  return res.redirect('/');
});

router.post("/reg-admin", async (req, res, next) => {
  if (isDevRole(req.session.userData)) {
    const hashpw = await bcrypt.hash(req.body.password, 12);

    req.app.db.models.Admin.create({
      username: req.body.username,
      hashpw: hashpw,
      role: "admin",
    }, function (err, data) {

      if (err) {
        console.log(err);
        return next(err);
      }

      return res.status(200).json({
        message: "User created"
      });
    });
  } else {
    return res.status(403).json({
      message: "Forbidden"
    });
  }
});


router.post('/login', (req, res, next) => {
  req.app.db.models.Admin.findOne({
    username: req.body.username,
  }, async function (err, data) {
    if (err) {
      console.log(err);
      return next(err);
    }

    if(!data) {
      const err = new Error("Invalid Username/Password");
      console.log(err);
      return next(err);
    }

    const isMatch = await bcrypt.compare(req.body.password, data.hashpw);
    if(!isMatch) {
      const err = new Error("Invalid Username/Password");
      console.log(err);
      return next(err);
    }

    req.session.userData = {
      username: data.username,
      role: data.role,
    };

    return res.redirect("/admin");
  });
});

router.get('/fetchvoters', (req, res, next) => {
  if (isAdminRole(req.session.userData)) {
    req.app.db.models.Voter.find({}, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.send(data);
    });
  } else {
    console.log(err);
    return next(err);
  }
});

router.post('/addtopic', multer().none(), (req, res, next) => {
  if (isAdminRole(req.session.userData)) {
    const topic = {
      name: req.body.name,
      choices: JSON.parse(req.body.choices),
      expired: req.body.expired,
    };

    if(!Array.isArray(topic.choices) || topic.choices.length < 2) {
      return next(new Error("Bad Request"));
    }

    req.app.db.models.Topic.create(topic, function (err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
      return res.status(200).json({
        message: "Topic Add"
      });
    });
  } else {
    console.log(err);
    return next(err);
  }
});

module.exports = router;