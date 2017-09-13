const pg = require('pg')

const dbName = 'vinyl'
const connectionString = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`
const client = new pg.Client(connectionString)

client.connect()

function createReview(contents, cb) {
  _query('INSERT INTO reviews (album_id, user_id, content, created_at) VALUES ($1, $2, $3, $4)', [contents.albumId, contents.userId, contents.review, contents.time], cb)
}

function deleteReview(reviewID, cb) {
  _query('DELETE FROM reviews WHERE id = $1', [reviewID], cb)
}

function getRecentReviews(cb) {
  _query('SELECT albums.title, users.name, content, user_id, album_id, created_at FROM reviews INNER JOIN albums ON (reviews.album_id = albums.id) INNER JOIN users ON (reviews.user_id = users.id) ORDER BY created_at DESC LIMIT 3', [], cb)
}

function getReviewsById(id, cb) {
  _query('SELECT albums.title, reviews.id, content, album_id, created_at FROM reviews INNER JOIN albums ON (reviews.album_id = albums.id) WHERE user_id = $1 ORDER BY created_at DESC', [id], cb )
}

function getReviewsByAlbumId(id, cb) {
  _query('SELECT albums.title, content, reviews.id, album_id, created_at, users.name, user_id FROM reviews INNER JOIN albums ON (reviews.album_id = albums.id) INNER JOIN users ON (reviews.user_id = users.id) WHERE album_id = $1 ORDER BY created_at DESC', [id], cb)
}

function createUser(user, cb) {
  _query('INSERT INTO users (name, email, password, joined_at) VALUES ($1, $2, $3, $4) RETURNING id', [user.name, user.email, user.password, user.time], cb)
}

function getUserById(id, cb) {
  _query('SELECT * FROM users WHERE id = $1', [id], cb)
}

function getUserAccount(attempt, cb) {
  _query('SELECT * FROM users WHERE email = $1 AND password = $2', [attempt.email, attempt.password], cb)
}

function getAlbums(cb) {
  _query('SELECT * FROM albums', [], cb)
}

function getAlbumsByID(albumID, cb) {
  _query('SELECT * FROM albums WHERE id = $1', [albumID], cb)
}

function _query(sql, variables, cb) {
  console.log('QUERY ->', sql.replace(/[\n\s]+/g, ' '), variables)

  client.query(sql, variables, (error, result) => {
    if (error) {
      console.log('QUERY -> !!ERROR!!')
      console.error(error)
      cb(error)
    } else {
      console.log('QUERY ->', JSON.stringify(result.rows))
      cb(error, result.rows)
    }
  })
}

module.exports = {
  getReviewsByAlbumId,
  getReviewsById,
  getUserAccount,
  getUserById,
  createUser,
  createReview,
  deleteReview,
  getRecentReviews,
  getAlbums,
  getAlbumsByID,
}
