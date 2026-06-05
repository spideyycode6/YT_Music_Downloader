import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './src/config/passport.js';
import { config } from './src/config/config.js';
import Musicrouter from './src/routes/music.router.js';
import Authrouter from './src/routes/auth.router.js';

const app = express();

app.use(cors({
    origin(origin, callback) {
        if (!origin || config.frontendOrigins.includes(origin)) {
            callback(null, origin);
            return;
        }
        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', Authrouter);
app.use('/api/music', Musicrouter);

export default app;