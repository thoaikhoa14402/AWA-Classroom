"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const passport_github_1 = require("passport-github");
const user_model_1 = __importDefault(require("./models/user.model"));
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
};
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true
};
const jwtStrategy = new passport_jwt_1.Strategy(jwtOptions, (req, jwt_payload, done) => {
    user_model_1.default.findOne({ _id: jwt_payload._id }).then((user) => {
        if (user) {
            req.user = user;
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    }).catch(err => {
        done(err, false);
    });
});
const googleStrategy = new passport_google_oauth20_1.Strategy({
    // options for Google Strategy
    clientID: process.env.CLIENT_ID_GOOGLE,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE,
    callbackURL: "/v1/auth/google/cb",
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield user_model_1.default.findOne({ googleID: profile.id });
    if (!user) {
        user = yield user_model_1.default.create({
            googleID: profile.id,
            username: profile.displayName,
            password: '',
            email: profile.emails[0].value,
            lastname: profile.name.familyName,
            firstname: profile.name.givenName,
            avatar: profile.photos[0].value,
        });
    }
    done(null, user);
}));
const facebookStrategy = new passport_facebook_1.Strategy({
    clientID: process.env.CLIENT_ID_FACEBOOK,
    clientSecret: process.env.CLIENT_SECRET_FACEBOOK,
    callbackURL: "/v1/auth/facebook/cb",
    profileFields: ['id', 'name', 'emails', 'displayName', 'about', 'gender', 'photos']
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield user_model_1.default.findOne({ facebookID: profile.id });
    if (!user) {
        user = yield user_model_1.default.create({
            facebookID: profile.id,
            username: profile.displayName,
            password: '',
            avatar: "https://graph.facebook.com/" + profile.id + "/picture" + "?width=200&height=200",
            facebookId: profile.id,
            lastname: profile.name.familyName,
            firstname: profile.name.givenName,
            email: profile.emails[0].value
        });
    }
    done(null, user);
}));
const githubStrategy = new passport_github_1.Strategy({
    clientID: process.env.CLIENT_ID_GITHUB,
    clientSecret: process.env.CLIENT_SECRET_GITHUB,
    callbackURL: "/v1/auth/github/cb",
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists in our database
    let user = yield user_model_1.default.findOne({ githubID: profile.id });
    if (!user) {
        user = yield user_model_1.default.create({
            githubID: profile.id,
            username: profile.username,
            password: '',
            email: profile.emails[0].value,
            firstname: profile.displayName,
            avatar: profile.photos[0].value,
        });
    }
    done(null, user);
}));
passport_1.default.use(jwtStrategy);
passport_1.default.use(googleStrategy);
passport_1.default.use(facebookStrategy);
passport_1.default.use(githubStrategy);
exports.default = passport_1.default;
