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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
const nodemailer_1 = require("nodemailer");
class MailerBuilder {
    constructor(transporterOptions, from) {
        this.transporterOptions = transporterOptions !== null && transporterOptions !== void 0 ? transporterOptions : {
            service: process.env.MAILER_SERVICE,
            secure: true,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS,
            },
        };
        this.from = from !== null && from !== void 0 ? from : process.env.MAILER_FROM;
    }
    withTransporter(transporterOptions) {
        this.transporterOptions = transporterOptions;
        return this;
    }
    withFrom(from) {
        this.from = from;
        return this;
    }
    build() {
        return new Mailer(this.transporterOptions, this.from);
    }
}
class Mailer {
    constructor(transporterOptions, from) {
        this.transporter = (0, nodemailer_1.createTransport)(transporterOptions);
        this.from = from;
    }
    static default() {
        return this.builder().build();
    }
    static builder() {
        return new MailerBuilder();
    }
    sendMail(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.transporter.sendMail(Object.assign({ from: this.from }, mail));
            }
            catch (error) {
                throw new Error(`An error occurred while sending the email. ${error}`);
            }
        });
    }
}
exports.Mailer = Mailer;
const GMailer = Mailer.default();
exports.default = GMailer;
