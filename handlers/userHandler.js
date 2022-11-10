const CryptoJS = require('crypto-js'),
  tokenTimeOut = 168, // calc = hours = 168/24 = 7 days
  defaultUser = 'admin',
  secretKeyGenerationToken = 'aA123Bb321@8*iPg',
  db = require('../models'),
  User = db.user,
  log = console.log,
  md5 = require('md5'),
  login = (req, res) => {
    try {
      User.findAll({
        where: {
          username: defaultUser,
          password: md5(req.body.password),
        },
        order: [['createdAt', 'DESC']],
      }).then((user) => {
        if (user.length === 0) {
          res.send({
            success: false,
            message: 'Mật khẩu sai.',
          });
        } else {
          var key = CryptoJS.enc.Utf8.parse(secretKeyGenerationToken);
          var iv = CryptoJS.enc.Utf8.parse(secretKeyGenerationToken);
          let authToken = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(
              JSON.stringify({
                expiredDate: Date.now() + tokenTimeOut * 3600 * 1000,
              })
            ),
            key,
            {
              keySize: 128 / 8,
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            }
          ).toString();
          res.cookie('auth-token', authToken);
          res.send({
            success: true,
            authToken: authToken,
          });
        }
      });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  changePwd = (req, res) => {
    try {
      log(req.body);
      User.findAll({
        where: {
          username: defaultUser,
          password: md5(req.body.password),
        },
        order: [['createdAt', 'DESC']],
      })
        .then((user) => {
          if (user.length === 0) {
            res.send({
              success: false,
              message: 'Mật khẩu sai.',
            });
            return;
          }
          let userId = user[0].id;
          User.update(
            { password: md5(req.body.newPassword) },
            {
              where: { id: userId },
            }
          ).then((num) => {
            log('num:%s', num);
            if (num[0] === 1) {
              res.send({
                success: true,
                message: 'Mật khẩu đổi thành công.',
              });
            } else {
              res.send({
                success: false,
                message: `Thông tin không có gì thay đổi`,
              });
            }
          });
        })
        .catch((err) => {
          res.status(500).send({
            success: false,
            message:
              err.message || 'Some error occurred while change password.',
          });
        });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  getLoginStatus = (req, res) => {
    try {
      console.log(req.headers);
      let token = req.cookies['auth-token'],
        //let token = req.headers.authorization.split(' ')[1],
        status = false;
      console.log(token);
      if (!token) {
        res.send({ success: false, message: 'cookie does not exist' });
        return;
      }
      var key = CryptoJS.enc.Utf8.parse(secretKeyGenerationToken);
      var iv = CryptoJS.enc.Utf8.parse(secretKeyGenerationToken);
      let decyptedData = CryptoJS.AES.decrypt(decodeURIComponent(token), key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);
      if (decyptedData) {
        let d1 = Date.now(),
          d2 = new Date(JSON.parse(decyptedData).expiredDate).getTime();
        //log(d1 - d2);
        status = d1 - d2 <= 0;
      }
      res.send({
        success: status,
        message: token,
        date: new Date(JSON.parse(decyptedData).expiredDate).toLocaleString(),
        // d1: d1,
        // d2: d2,
        // d1d2: d1 - d2,
        // d2d1: d2 - d1,
      });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };

module.exports = {
  login,
  changePwd,
  getLoginStatus,
};
