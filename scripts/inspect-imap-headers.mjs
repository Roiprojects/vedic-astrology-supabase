import "dotenv/config";
import tls from "node:tls";

const messageId = process.argv[2];

if (!messageId) {
  console.error("Usage: node --env-file=.env scripts/inspect-imap-headers.mjs <message-id>");
  process.exit(1);
}

const host = process.env.IMAP_HOST || process.env.SMTP_TLS_SERVERNAME || process.env.SMTP_HOST;
const port = Number(process.env.IMAP_PORT) || 993;
const user = process.env.IMAP_USER || process.env.SMTP_USER;
const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;

if (!host || !user || !pass) {
  console.error("IMAP_HOST/IMAP_USER/IMAP_PASS are required. SMTP_* is used as fallback when applicable.");
  process.exit(1);
}

const socket = tls.connect({
  host,
  port,
  servername: host,
  rejectUnauthorized: true,
});

socket.setEncoding("utf8");

let buffer = "";
let stage = 0;
let fetchId = "";
let finished = false;

const send = (tag, command) => socket.write(`${tag} ${command}\r\n`);

const done = (code) => {
  if (finished) return;
  finished = true;
  socket.end();
  process.exit(code);
};

socket.on("data", (chunk) => {
  buffer += chunk;

  if (stage === 0 && /\* OK/i.test(buffer)) {
    send("a1", `LOGIN ${JSON.stringify(user)} ${JSON.stringify(pass)}`);
    stage = 1;
    buffer = "";
    return;
  }

  if (stage === 1 && /a1 OK/i.test(buffer)) {
    send("a2", "SELECT INBOX");
    stage = 2;
    buffer = "";
    return;
  }

  if (stage === 2 && /a2 OK/i.test(buffer)) {
    send("a3", `SEARCH HEADER Message-ID ${JSON.stringify(messageId)}`);
    stage = 3;
    buffer = "";
    return;
  }

  if (stage === 3 && /a3 OK/i.test(buffer)) {
    const match = buffer.match(/\* SEARCH\s*([0-9 ]*)/i);
    const ids = (match?.[1] || "").trim().split(/\s+/).filter(Boolean);
    fetchId = ids.at(-1) || "";

    if (!fetchId) {
      console.error("No matching message found for Message-ID.");
      done(1);
      return;
    }

    send("a4", `FETCH ${fetchId} BODY.PEEK[HEADER]`);
    stage = 4;
    buffer = "";
    return;
  }

  if (stage === 4 && /a4 OK/i.test(buffer)) {
    const headerDump = buffer;
    const headerChecks = {
      "Return-Path": /Return-Path:/i.test(headerDump),
      "DKIM-Signature": /DKIM-Signature:/i.test(headerDump),
      "Reply-To": /Reply-To:/i.test(headerDump),
      "Message-ID": /Message-ID:/i.test(headerDump),
    };

    console.log(headerDump.trim());
    console.log(JSON.stringify({ headerChecks }));

    send("a5", `FETCH ${fetchId} BODYSTRUCTURE`);
    stage = 5;
    buffer = "";
  }

  if (stage === 5 && /a5 OK/i.test(buffer)) {
    console.log(buffer.trim());
    done(0);
  }
});

socket.on("error", (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  done(1);
});
