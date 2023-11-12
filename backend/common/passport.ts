import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { NextFunction, Request, Response } from 'express';
import UserModel from './models/user.model';

const cookieExtractor = (req: Request): string | null => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt']
    }
    return token;
}

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET as string,
    passReqToCallback: true
}

const jwtStrategy = new JwtStrategy(jwtOptions, (req: any, jwt_payload: any, done: any) => {
    UserModel.findOne({_id: jwt_payload._id}).then((user) => {
        if (user) {
            req.user = user;
            return done(null, user)
        } else {
            return done(null, false)
        }
    }).catch(err => {
        done(err, false);
    });
})

const googleStrategy = new GoogleStrategy({
     // options for Google Strategy
     clientID: process.env.CLIENT_ID_GOOGLE as string,
     clientSecret: process.env.CLIENT_SECRET_GOOGLE as string,
     callbackURL: "/v1/auth/google/cb",
    }, async (accessToken: string, refreshToken: string, profile: any, done) => {
    // Check if user already exists in our database
    let user = await UserModel.findOne({googleID: profile.id})
    if (!user) {
        user = await UserModel.create({
            googleID: profile.id,
            username: '',
            password : '',
            email: profile.emails[0].value,
            lastname: profile.name.familyName,
            firstname: profile.name.givenName,
            avatar: profile.photos[0].value,
        })
    }
    done(null, user);
})

const facebookStrategy = new FacebookStrategy({
    clientID: process.env.CLIENT_ID_FACEBOOK as string,
    clientSecret: process.env.CLIENT_SECRET_FACEBOOK as string,
    callbackURL: "/v1/auth/facebook/cb",
    profileFields: ['id', 'emails', 'name', 'photos']
}, async (accessToken: string, refreshToken: string, profile: any, done) => {
    let user = await UserModel.findOne({facebookID: profile.id})
    if (!user) {
        user = await UserModel.create({
            facebookID: profile.id,
            username: '',
            password : '',
            avatar: profile.photos[0].value,
            facebookId: profile.id,
            lastname: profile.name.familyName,
            firstname: profile.name.givenName,
            email: profile.emails[0].value
        })
    }
    done(null, user)
})

passport.use(jwtStrategy);
passport.use(googleStrategy);
passport.use(facebookStrategy);

export default passport;