import { test, assert, assertEquals, assertThrows } from "./deps.ts";

import * as semver from "../mod.ts";

test(function versionIsTooLong(): void {
  const v: string = "1.2." + new Array(256).join("1");

  assertThrows(function() {
    new semver.SemVer(v);
  });
  assertEquals(semver.valid(v, false), null);
  assertEquals(semver.valid(v, true), null);
  assertEquals(semver.inc(v, "patch"), null);
});

test(function tooBig(): void {
  var v = "1.2." + new Array(100).join("1");
  assertThrows(function() {
    new semver.SemVer(v);
  });
  assertEquals(semver.valid(v, false), null);
  assertEquals(semver.valid(v, true), null);
  assertEquals(semver.inc(v, "patch"), null);
});

test(function parsingNullDoesNotThrow(): void {
  assertEquals(semver.parse(null), null);
  assertEquals(semver.parse({} as semver.SemVer), null);
  assertEquals(semver.parse(new semver.SemVer("1.2.3")).version, "1.2.3");
});
