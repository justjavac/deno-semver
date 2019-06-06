import { test, assertEquals } from "./deps.ts";

import * as semver from "../mod.ts";

test(function clean(): void {
  // [range, version]
  // Version should be detectable despite extra characters
  const versions: [string, string][] = [
    ["1.2.3", "1.2.3"],
    [" 1.2.3 ", "1.2.3"],
    [" 1.2.3-4 ", "1.2.3-4"],
    [" 1.2.3-pre ", "1.2.3-pre"],
    ["  =v1.2.3   ", "1.2.3"],
    ["v1.2.3", "1.2.3"],
    [" v1.2.3 ", "1.2.3"],
    ["\t1.2.3", "1.2.3"],
    [">1.2.3", null],
    ["~1.2.3", null],
    ["<=1.2.3", null],
    ["1.2.x", null]
  ];

  versions.forEach(function(tuple) {
    const range: string = tuple[0];
    const version: string = tuple[1];
    const msg = `clean(${range})=${version}`;
    assertEquals(semver.clean(range), version, msg);
  });
});
