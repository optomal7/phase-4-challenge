const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')
const session = require('express-session')

const port = process.env.PORT || 3000

const app = express()

require('ejs')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(session({
  secret: 'this is not the greatest string in the world, this is just a secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use((req, res, next) => {
  res.locals.query = ''
  next()
})

app.get('/', (req, res) => {
  let reviews
  db.getRecentReviews((error, content) => {
    if (error) {
      throw error
    } else {
      reviews = content
    }
  })
  db.getAlbums((error, albums) => {
    if (error) {
      res.status(500).render('error', {error})
    } else {
      let userinfo = {id: req.session.user}
      res.render('index', {albums, reviews, userinfo})
    }
  })
})

app.get('/albums/:albumID', (req, res) => {
  const albumID = req.params.albumID

  db.getAlbumsByID(albumID, (error, albums) => {
    if (error) {
      res.status(500).render('error', {error})
    } else {
      const album = albums[0]
      let userinfo = {id: req.session.user}
      db.getReviewsByAlbumId(album.id, (error, reviews) => {
        res.render('album', { album, reviews, userinfo})
      })
    }
  })
})

app.get('/albums/:albumID/reviews/new', (req, res) => {
  const albumID = req.params.albumID

  if (!req.session.user) {
    let error = {message: 'you must be signed in to post a review'}
    res.render('login', {error})
  } else {
    db.getAlbumsByID(albumID, (err, albums) => {
      const album = albums[0]
      console.log(album);
      let userinfo = {id: req.session.user}
      res.render('new-review', {album, userinfo})
    })
  }
})

app.post('/albums/:albumID/reviews/new', (req, res) => {
  const albumID = req.params.albumID

  console.log(req.body)
  let contents = {review: req.body.review}

  if (req.body = '') {
    let error = {message: 'You can not submit a blank review'}
    db.getAlbumsByID(albumID, (err, albums) => {
      const album = albums[0]
      console.log(album);
      let userinfo = {id: req.session.user}
      res.render('new-review', {album, error, userinfo})
    })
  } else {
    console.log(req.body)
    let userinfo = {id: req.session.user}
    contents.userId = userinfo.id
    contents.time = new Date()
    contents.albumId = albumID
    db.createReview(contents, (err) => {
      res.redirect(`/albums/${albumID}`)
    })
  }
})

app.delete('/users/reviews/:reviewID', (req, res) => {
  db.deleteReview(req.params.reviewID, (err) => {
    let userinfo = {id: req.session.user}
    res.redirect(`/user/${userinfo.id}`)
  })
})

app.get('/signup', (req, res) => {
  console.log(req.session.user);
  res.render('signup')
})

app.post('/signup', (req, res) => {
  console.log('loggin away -------------------');
  console.log(req.body);
  req.body.time = new Date()
  if (req.body.name === '' || req.body.email === '') {
    let error = { message: "You must submit an email and/or name"}
    res.render('signup', {error})
  } else {
    db.createUser(req.body, (error, newUser) => {
      if (error) {
        error.message += " a.k.a. someone has already created an account with this email. Try a different one."
        res.render('signup', {error})
      } else {
        let id = newUser[0].id
        req.session.user = id
        res.redirect(`/users/${id}`)
      }
    })
  }
})

app.get('/users/:id', (req, res) =>{
  let id = req.params.id
  db.getUserById(id, (error, data) => {
    if (error) {
      res.status(500).render('error', {error})
    } else {
      let userinfo = {id: req.session.user}
      let user = data[0]
      db.getReviewsById(id, (error, reviews) => {
        if (error) {
          res.status(500).render('error', {error})
        } else {
          console.log(reviews);
          res.render('user', {user, reviews, userinfo})
        }
      })
    }
  })
})

app.get('/sign-in', (req, res) => {
  let userinfo = {id: req.session.user }
  res.render('login', {userinfo})
})

app.post('/sign-in', (req, res) => {
  db.getUserAccount(req.body, (error, account) => {
    console.log(account[0] === undefined);
    if (error) {
      res.status(500).render('error', {error})
    } else if (account[0] === undefined || req.body.email !== account[0].email || req.body.password !== account[0].password) {
      let error = {message: 'Invalid password and/or email'}
      res.render('login', {error})
    } else if (req.body.email === account[0].email && req.body.password === account[0].password) {
      let userinfo = {id: account[0].id }
      req.session.user = userinfo.id
      res.redirect(`/users/${userinfo.id}`)
    } else {
      res.status(500).render('error', {error})
    }
  })
})

app.get('/signout', (req, res) => {
  req.session.destroy(function (err) {
    res.redirect('/')
  })
})

// app.use((err, req, res, next) => {
//   res.status(404).render('not_found', { userinfo: {}})
// })

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}...`)
})
