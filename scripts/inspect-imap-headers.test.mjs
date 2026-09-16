import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("IMAP inspection script requires message id and checks key auth headers", () => {
  const script = readFileSync(new URL("./inspect-imap-headers.mjs", import.meta.url), "utf8");

  assert.match(script, /Usage:\s*node\s+--env-file=.*inspect-imap-headers\.mjs\s+<message-id>/i);
  assert.match(script, /IMAP_HOST/i);
  assert.match(script, /SEARCH HEADER Message-ID/i);
  assert.match(script, /BODY\.PEEK\[HEADER\]/i);
  assert.match(script, /BODYSTRUCTURE/i);
  assert.match(script, /DKIM-Signature/i);
  assert.match(script, /Return-Path/i);
});
