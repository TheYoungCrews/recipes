import assert from "node:assert/strict";
import test from "node:test";
import { stripCookieDomain, rewriteLocation } from "../domain-worker/src/worker.js";

test("stripCookieDomain drops Domain and leaves a host-only cookie", () => {
  const c = "cook_session=abc; Path=/; Domain=blind-tiger.pages.dev; HttpOnly; Secure; SameSite=Lax";
  assert.equal(stripCookieDomain(c), "cook_session=abc; Path=/; HttpOnly; Secure; SameSite=Lax");
  const already = "cook_session=abc; Path=/; HttpOnly; Secure; SameSite=Lax";
  assert.equal(stripCookieDomain(already), already);
});

test("rewriteLocation points pages.dev redirects at recipes.crews.fyi", () => {
  assert.equal(
    rewriteLocation("https://blind-tiger.pages.dev/r/denver-steak-with-brussels-sprouts"),
    "https://recipes.crews.fyi/r/denver-steak-with-brussels-sprouts",
  );
  assert.equal(rewriteLocation("/r/foo"), "https://recipes.crews.fyi/r/foo");
  assert.equal(rewriteLocation("https://accounts.google.com/o/oauth"), "https://accounts.google.com/o/oauth");
});
