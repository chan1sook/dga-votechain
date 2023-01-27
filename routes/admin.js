const express = require('express');
const router = express.Router();
const multer = require("multer");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(tz);

router.get('/', function (req, res, next) {
  if (req.JWTData.userType == 'admin') {
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
          JWTData: req.JWTData,
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

router.get('/login', function (req, res, next) {
  if (req.JWTData.userType == 'admin') {
    return res.redirect('/admin');
  } else {
    return res.render('login', {
      JWTData: req.JWTData
    });
  }
});

router.get('/verifyvoter/:id', function (req, res, next) {
  if (req.JWTData.userType == 'admin') {
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

router.get('/logout', function (req, res, next) {
  res.clearCookie('token');
  return res.redirect('/');
});

router.post('/login', function (req, res, next) {
  if(req.body.login_id === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
    const payload = {
      userType: 'admin',
      firstName: 'Admin'
    };
    const token = req.app.jwt.sign(payload, req.app.jwtSecret);

    res.cookie('token', token);
    res.redirect('/admin');
  } else {
    const err = new Error("Invalid username/password");
    console.log(err);
    res.redirect('/admin/login');
  }
});

router.get('/fetchvoters', function (req, res, next) {
  if (req.JWTData.userType == 'admin') {
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

router.post('/addtopic', multer().none(), function (req, res, next) {
  if (req.JWTData.userType == 'admin') {
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