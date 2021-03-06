'use strict'

const fp = require('fastify-plugin')
const MongoDb = require('mongodb')

const MongoClient = MongoDb.MongoClient
const ObjectId = MongoDb.ObjectId

function fastifyMongodb (fastify, options, next) {
  const url = options.url
  delete options.url

  const name = options.name
  delete options.name

  MongoClient.connect(url, options, onConnect)

  function onConnect (err, db) {
    if (err) return next(err)

    const mongo = {
      db: db,
      ObjectId: ObjectId
    }

    if (name) {
      if (!fastify.mongo) {
        fastify.decorate('mongo', {})
      }

      fastify.mongo[name] = mongo
    } else {
      if (fastify.mongo) {
        next(new Error('fastify-mongo has already registered'))
      } else {
        fastify.mongo = mongo
      }
    }

    fastify.addHook('onClose', (fastify, done) => db.close(done))

    next()
  }
}

module.exports = fp(fastifyMongodb, '>=0.13.1')
