const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const sessions = require('express-session')
const KnexSessionStore = require('connect-session-knex')(sessions) // for storing sessins in db

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const knexConfig = require('../database/dbConfig')

const server = express();

const sessionConfiguration = {
  name: 'littybop',
  secret: process.env.SESSION_SECRET || 'this is not secret',
  cookie: {
    httpOnly: true, // JS cannot access the cookies
    maxAge: 1000 * 60 * 60, // one hour
    secure: process.env.NODE_ENV === 'production' ? true : false // use cookie over HTTPS only. Should be true in production.
  },
  resave: false,
  saveUninitialized: true, // read about GDPR compliance 
  store: new KnexSessionStore({
    knex: knexConfig,
    createtable: true, // automatically create the sessions table
    clearInterval: 1000 * 60 * 30 // every 30 min, delete expired sessions
  })
}

server.use(sessions(sessionConfiguration))
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up' });
});

module.exports = server;
