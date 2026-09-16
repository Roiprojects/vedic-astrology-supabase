import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEnvelope,
  buildReplyTo,
  createSmtpTransportOptions,
  formatFromHeader,
  resolveMailIdentity,
} from "./mailer";

test("resolveMailIdentity prefers configured reply-to and envelope sender", () => {
  const identity = resolveMailIdentity({
    from: "info@myvedicastrology.in",
    replyTo: "care@myvedicastrology.in",
    envelopeFrom: "bounce@myvedicastrology.in",
  });

  assert.equal(identity.fromHeader, "My Vedic Astrology <info@myvedicastrology.in>");
  assert.equal(identity.replyTo, "care@myvedicastrology.in");
  assert.deepEqual(identity.envelope, { from: "bounce@myvedicastrology.in" });
});

test("resolveMailIdentity falls back to authenticated sender for reply-to and envelope", () => {
  const identity = resolveMailIdentity({
    from: "info@myvedicastrology.in",
  });

  assert.equal(identity.fromHeader, "My Vedic Astrology <info@myvedicastrology.in>");
  assert.equal(identity.replyTo, "info@myvedicastrology.in");
  assert.deepEqual(identity.envelope, { from: "info@myvedicastrology.in" });
});

test("buildReplyTo keeps customer email out of From while allowing direct replies", () => {
  assert.equal(buildReplyTo("customer@example.com", "info@myvedicastrology.in"), "customer@example.com");
  assert.equal(buildReplyTo("", "info@myvedicastrology.in"), "info@myvedicastrology.in");
});

test("buildEnvelope returns undefined when no sender exists", () => {
  assert.equal(buildEnvelope(""), undefined);
});

test("formatFromHeader formats the branded sender header", () => {
  assert.equal(
    formatFromHeader("My Vedic Astrology", "info@myvedicastrology.in"),
    "My Vedic Astrology <info@myvedicastrology.in>"
  );
});

test("createSmtpTransportOptions uses verified TLS defaults for submission ports", () => {
  assert.deepEqual(
    createSmtpTransportOptions({
      host: "mail.myvedicastrology.in",
      port: 587,
      user: "info@myvedicastrology.in",
      pass: "secret",
    }),
    {
      host: "mail.myvedicastrology.in",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: "info@myvedicastrology.in", pass: "secret" },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5,
    }
  );
});

test("createSmtpTransportOptions includes an explicit TLS servername when configured", () => {
  assert.deepEqual(
    createSmtpTransportOptions({
      host: "localhost",
      port: 465,
      user: "info@myvedicastrology.in",
      pass: "secret",
      tlsServername: "webmail.myvedicastrology.in",
    }),
    {
      host: "localhost",
      port: 465,
      secure: true,
      requireTLS: false,
      auth: { user: "info@myvedicastrology.in", pass: "secret" },
      tls: { servername: "webmail.myvedicastrology.in" },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5,
    }
  );
});
