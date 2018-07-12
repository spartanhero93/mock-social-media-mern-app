const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const keys = require('../../config/keys')
const User = require('../../models/User')

router.get('/test', (req, res) => res.json({ msg: 'Users works!' }))

router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists' })
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // Picture rating
        d: 'mm' // default
      })
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      })
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err
          }
          newUser.password = hash
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.error(err))
        })
      })
    }
  })
})

router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: 'User not found' })
    }

    // <=== Check Password ===>//
    bcrypt.compare(password, user.password).then(isMatched => {
      if (isMatched) {
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 60 * 60 * 6 },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            })
          }
        ) // is equal to 6 hours (seconds are the main INT)
      } else {
        return res.status(400).json({ password: 'Password incorrect' })
      }
    })
  })
})

module.exports = router
