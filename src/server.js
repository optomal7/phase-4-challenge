const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')

const port = process.env.PORT || 3000

const app = express()

require('ejs')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

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
      res.render('index', {albums, reviews})
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
      res.render('album', {album})
    }
  })
})

// app.get('/signup', (req, res) => {
//
// })
//
// app.post('/signup', (req, res) => {
//
// })
//
// app.get('/login', (req, res) => {
//
// })

app.use((req, res) => {
  res.status(404).render('not_found')
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}...`)
})
