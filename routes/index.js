const express = require('express');
const router = express.Router();
const multer = require('multer');
const qrCode = require('qrcode');
const qrReader = require('qrcode-reader');
const Jimp = require("jimp");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const { isAdminRole } = require('../helper');


const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: function(req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)

        cb(null, raw.toString('hex') + '.png')
      })
    },}
  ),
});

const uploadMemory = multer({
  storage: multer.memoryStorage(),
});

router.get('/', function (req, res, next) {
	res.render('index', {
    isAdmin: isAdminRole(req.session.userData),
	});
});

router.get('/voteTopic', function (req, res, next) {
	if (!req.session.votePayload) {
		return res.redirect('/vote');
	}
  
  const { topic, id, name, nationid } = req.session.votePayload;

  Promise.all([
    req.app.db.models.Voter.findById(id),
    req.app.db.models.Topic.findById(topic),
    req.app.db.models.Voting.findOne({
      topicId: mongoose.Types.ObjectId(topic),
      voter: mongoose.Types.ObjectId(id),
    }),
  ]).then(([voter, topicData, voting]) => {
    if (!voter || !topicData || !voter.isValid || voting) {
      return res.redirect('/vote');
    }
		res.render('votetopic', {
      isAdmin: isAdminRole(req.session.userData),
			id: id,
			name: name,
			nationid: nationid,
      topic: topicData,
		});
  }).catch((err) => {
    console.log(err);
    return next(err);
  });
});

router.get('/vote', function (req, res, next) {
	res.render('vote', {
    isAdmin: isAdminRole(req.session.userData),
	});
});

router.get('/register', function (req, res, next) {
	res.render('register', {
    isAdmin: isAdminRole(req.session.userData),
	});
});

router.get('/results', function (req, res, next) {
	res.render('results', {
    isAdmin: isAdminRole(req.session.userData),
	});
});

router.post('/register', upload.single('avatar'), function (req, res, next) {
	const voterDetails = {
		name: req.body.name,
		nationid: req.body.nationid,
		imagePath: path.basename(req.file.path),
		hasVoted: false,
		isValid: true,
	}

	req.app.db.models.Voter.create(voterDetails, function (err, data) {
		if (err) {
			console.log(err);
			return next(err);
		}

		const voterID = JSON.stringify(data._id);

		qrCode.toDataURL(voterID, function (err, url) {
			var im = url.split(",")[1];
			var img = Buffer.from(im, 'base64');

			res.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': img.length,
				'Content-Disposition': 'attachment; filename="Voter_QR.png"'
			});
			res.end(img);
		})
	});
});

const verifyUploadFields = [{ name: 'avatar', maxCount: 1 }, { name: 'qr', maxCount: 1 }];
router.post('/verifyvoter', uploadMemory.fields(verifyUploadFields), function (req, res, next) {
  const qr = new qrReader();
	const qrBuffer = req.files.qr[0].buffer;

  Jimp.read(qrBuffer, function (err, image) {
    if (err) {
      console.error(err);
      next(err);
      return;
    }

    qr.callback = function (err, value) {
      if (err) {
        console.error(err);
        next(err);
        return;
      }

      const id = value.result.substr(1).slice(0, -1);
      const topic = req.body.topic;

      Promise.all([
        req.app.db.models.Voter.findById(id),
        req.app.db.models.Topic.findById(topic),
        req.app.db.models.Voting.findOne({
          topicId: mongoose.Types.ObjectId(topic),
          voter: mongoose.Types.ObjectId(id),
        }),
      ]).then(([voter, topicData, voting]) => {
        if (!voter || !topicData || !voter.isValid || voting) {
          return res.status(403).json({
            message: 'Sorry! You are not allowed to vote.'
          });
        } else {
          const votePayload = {
            topic: req.body.topic,
            id: id,
            nationid: voter.nationid,
            name: voter.name,
          }
          // const avatarImg = fs.readFileSync(`uploads/${voter.imagePath}`);
          req.session.votePayload = votePayload;

          // auth face
          
          return res.status(200).json({
            message: 'Verify allow!'
          });
        }
      }).catch((err) => {
        console.log(err);
        next(err);
      });
    };

    qr.decode(image.bitmap);
  });
});

router.post('/votetopic', multer().none(), function (req, res, next) {
  const votingData = {
    topicId: req.body.topic,
    voter: req.body.id,
    choice: req.body.choice,
  };

  Promise.all([
    req.app.db.models.Voter.findById(votingData.voter),
    req.app.db.models.Topic.findById(votingData.topicId),
    req.app.db.models.Voting.findOne({
      topicId: mongoose.Types.ObjectId(votingData.topicId),
      voter: mongoose.Types.ObjectId(votingData.voter),
    }),
  ]).then(([voter, topicData, voting]) => {
    if (!voter || !topicData || !voter.isValid || voting) {
      return res.status(403).json({
        message: 'Sorry! You are not allowed to vote.'
      });
    } else {
      req.app.db.models.Voting.create(votingData, function (err, data) {
        if (err) {
          console.log(err);
          return next(err);
        }

        delete req.session.votePayload;
    
        return res.status(200).json({
          message: "Voted!",
        })
      });
    }
  }).catch((err) => {
    console.log(err);
    next(err);
  });
});

router.get('/fetchtopics', function (req, res, next) {
  const filterExpired = req.query.expired;
  const query = {};

  switch(filterExpired) {
    case "all":
      break;
    case "expired":
      query.expired = {
        $lte: new Date(),
      };
      break;
    case "nonexpired":
    default:
      query.expired = {
        $gte: new Date(),
      };
      break;
  }

  req.app.db.models.Topic.find({ expired: { '$gte': new Date() } }, function (err, topics) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.status(200).json(
      {
        topics: topics.map((ele) => ele.toJSON()),
      }
    );
  });
});

router.get('/fetchtopicresult/:id', function (req, res, next) {
  Promise.all([
    req.app.db.models.Topic.findById(req.params.id),
    req.app.db.models.Voting.find({
      topicId: mongoose.Types.ObjectId(req.params.id)
    })
  ]).then(([topic, votings]) => {
    if(!topic) {
      console.log(err);
      return res.status(500).json({
        message: "No topic found"
      })
    }

    const choices = topic.choices.map((ele, i) => {
      return { nth: i + 1, choice: ele, count: 0 }
    })

    let emptyChoice = { nth: 0, choice: null, count: 0 };
    choices.push(emptyChoice);

    for(const vote of votings) {
      const target = choices.find((ele) => ele.nth === vote.choice);

      if(target) {
        target.count += 1;
      } else {
        emptyChoice.count += 1;
      }
    }

    
    return res.status(200).json({
      topic: topic._id,
      name: topic.name,
      result: choices,
      final: topic.expired.getTime() < Date.now(),
    });
  }).catch((err) => {
    console.log(err);
    return next(err);
  });
});

module.exports = router;