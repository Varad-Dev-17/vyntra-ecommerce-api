import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "node:dns";
dotenv.config();

// Force IPv4 resolution first because Render often lacks IPv6 routing,
// causing ENETUNREACH errors when Node tries IPv6 first.
dns.setDefaultResultOrder('ipv4first');

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
  },
  // Enforce IPv4 lookup manually, overriding any Node/OS IPv6 preference
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, (err, address, family) => {
      callback(err, address, family);
    });
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

export default transport;
