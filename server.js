'use strict'

const http = require('http')
const socketio = require('socket.io')
const r = require('rethinkdb')
const config = require('./config')

const server = http.createServer()
const io = socketio(server)
const port = process.env.PORT || 5151

r.connect(config.db, (err, conn) => {
  if (err) return console.log(err.message)

  r.table('images').changes().run(conn, (err, cursor) => {
    if (err) return console.log(err.message)
    // data: listen table change
    cursor.on('data', data => {
      let image = data.new_val
      // after the image is created, the field publicId is created
      if (image.publicId != null) {
        // event custom called 'image', this will to emit to all users
        io.sockets.emit('image', image)
      }
    })
  })
})

server.listen(port, () => console.log(`listening on port ${port}`))
