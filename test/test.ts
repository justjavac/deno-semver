import { runTests } from "./deps.ts";

import "./semver.test.ts";

import "./major.test.ts";
import "./minor.test.ts";
import "./patch.test.ts";
import "./minVersion.test.ts";
import "./prerelease.test.ts";
import "./increment.test.ts";
import "./gtr.test.ts";
import "./equality.test.ts";

import "./comparison.test.ts";
import "./comparators.test.ts";
import "./diff.test.ts";
import "./range.test.ts";

import "./tooLong.test.ts";
import "./ltr.test.ts";
import "./clean.test.ts";
import "./coerce.test.ts";

runTests();
