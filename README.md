# semver -- The semantic versioner for deno

**A fork of [node-semver](https://github.com/npm/node-semver) using TypeScript**

[![Build Status](https://travis-ci.com/justjavac/deno-semver.svg?branch=master)](https://travis-ci.com/justjavac/deno-semver)

## Usage

As a node module:

```ts
import * as semver from "https://raw.githubusercontent.com/justjavac/deno-semver/master/mod.ts";

semver.valid("1.2.3"); // "1.2.3"
semver.valid("a.b.c"); // null
semver.clean("  =v1.2.3   "); // "1.2.3"
semver.satisfies("1.2.3", "1.x || >=2.5.0 || 5.0.0 - 7.2.3"); // true
semver.gt("1.2.3", "9.8.7"); // false
semver.lt("1.2.3", "9.8.7"); // true
semver.minVersion(">=1.0.0"); // "1.0.0"
semver.valid(semver.coerce("v2")); // "2.0.0"
semver.valid(semver.coerce("42.6.7.9.3-alpha")); // "42.6.7"
```

## Versions

A "version" is described by the `v2.0.0` specification found at
<https://semver.org>.

A leading `"="` or `"v"` character is stripped off and ignored.

## Ranges

A `version range` is a set of `comparators` which specify versions
that satisfy the range.

A `comparator` is composed of an `operator` and a `version`. The set
of primitive `operators` is:

- `<` Less than
- `<=` Less than or equal to
- `>` Greater than
- `>=` Greater than or equal to
- `=` Equal. If no operator is specified, then equality is assumed,
  so this operator is optional, but MAY be included.

For example, the comparator `>=1.2.7` would match the versions
`1.2.7`, `1.2.8`, `2.5.3`, and `1.3.9`, but not the versions `1.2.6`
or `1.1.0`.

Comparators can be joined by whitespace to form a `comparator set`,
which is satisfied by the **intersection** of all of the comparators
it includes.

A range is composed of one or more comparator sets, joined by `||`. A
version matches a range if and only if every comparator in at least
one of the `||`-separated comparator sets is satisfied by the version.

For example, the range `>=1.2.7 <1.3.0` would match the versions
`1.2.7`, `1.2.8`, and `1.2.99`, but not the versions `1.2.6`, `1.3.0`,
or `1.1.0`.

The range `1.2.7 || >=1.2.9 <2.0.0` would match the versions `1.2.7`,
`1.2.9`, and `1.4.6`, but not the versions `1.2.8` or `2.0.0`.

### Prerelease Tags

If a version has a prerelease tag (for example, `1.2.3-alpha.3`) then
it will only be allowed to satisfy comparator sets if at least one
comparator with the same `[major, minor, patch]` tuple also has a
prerelease tag.

For example, the range `>1.2.3-alpha.3` would be allowed to match the
version `1.2.3-alpha.7`, but it would _not_ be satisfied by
`3.4.5-alpha.9`, even though `3.4.5-alpha.9` is technically "greater
than" `1.2.3-alpha.3` according to the SemVer sort rules. The version
range only accepts prerelease tags on the `1.2.3` version. The
version `3.4.5` _would_ satisfy the range, because it does not have a
prerelease flag, and `3.4.5` is greater than `1.2.3-alpha.7`.

The purpose for this behavior is twofold. First, prerelease versions
frequently are updated very quickly, and contain many breaking changes
that are (by the author"s design) not yet fit for public consumption.
Therefore, by default, they are excluded from range matching
semantics.

Second, a user who has opted into using a prerelease version has
clearly indicated the intent to use _that specific_ set of
alpha/beta/rc versions. By including a prerelease tag in the range,
the user is indicating that they are aware of the risk. However, it
is still not appropriate to assume that they have opted into taking a
similar risk on the _next_ set of prerelease versions.

Note that this behavior can be suppressed (treating all prerelease
versions as if they were normal versions, for the purpose of range
matching) by setting the `includePrerelease` flag on the options
object to any
[functions](https://github.com/justjavac/deno-semver#functions) that do
range matching.

#### Prerelease Identifiers

The method `.inc` takes an additional `identifier` string argument that
will append the value of the string as a prerelease identifier:

```javascript
semver.inc("1.2.3", "prerelease", "beta");
// "1.2.4-beta.0"
```

### Advanced Range Syntax

Advanced range syntax desugars to primitive comparators in
deterministic ways.

Advanced ranges may be combined in the same way as primitive
comparators using white space or `||`.

#### Hyphen Ranges `X.Y.Z - A.B.C`

Specifies an inclusive set.

- `1.2.3 - 2.3.4` := `>=1.2.3 <=2.3.4`

If a partial version is provided as the first version in the inclusive
range, then the missing pieces are replaced with zeroes.

- `1.2 - 2.3.4` := `>=1.2.0 <=2.3.4`

If a partial version is provided as the second version in the
inclusive range, then all versions that start with the supplied parts
of the tuple are accepted, but nothing that would be greater than the
provided tuple parts.

- `1.2.3 - 2.3` := `>=1.2.3 <2.4.0`
- `1.2.3 - 2` := `>=1.2.3 <3.0.0`

#### X-Ranges `1.2.x` `1.X` `1.2.*` `*`

Any of `X`, `x`, or `*` may be used to "stand in" for one of the
numeric values in the `[major, minor, patch]` tuple.

- `*` := `>=0.0.0` (Any version satisfies)
- `1.x` := `>=1.0.0 <2.0.0` (Matching major version)
- `1.2.x` := `>=1.2.0 <1.3.0` (Matching major and minor versions)

A partial version range is treated as an X-Range, so the special
character is in fact optional.

- `""` (empty string) := `*` := `>=0.0.0`
- `1` := `1.x.x` := `>=1.0.0 <2.0.0`
- `1.2` := `1.2.x` := `>=1.2.0 <1.3.0`

#### Tilde Ranges `~1.2.3` `~1.2` `~1`

Allows patch-level changes if a minor version is specified on the
comparator. Allows minor-level changes if not.

- `~1.2.3` := `>=1.2.3 <1.(2+1).0` := `>=1.2.3 <1.3.0`
- `~1.2` := `>=1.2.0 <1.(2+1).0` := `>=1.2.0 <1.3.0` (Same as `1.2.x`)
- `~1` := `>=1.0.0 <(1+1).0.0` := `>=1.0.0 <2.0.0` (Same as `1.x`)
- `~0.2.3` := `>=0.2.3 <0.(2+1).0` := `>=0.2.3 <0.3.0`
- `~0.2` := `>=0.2.0 <0.(2+1).0` := `>=0.2.0 <0.3.0` (Same as `0.2.x`)
- `~0` := `>=0.0.0 <(0+1).0.0` := `>=0.0.0 <1.0.0` (Same as `0.x`)
- `~1.2.3-beta.2` := `>=1.2.3-beta.2 <1.3.0` Note that prereleases in
  the `1.2.3` version will be allowed, if they are greater than or
  equal to `beta.2`. So, `1.2.3-beta.4` would be allowed, but
  `1.2.4-beta.2` would not, because it is a prerelease of a
  different `[major, minor, patch]` tuple.

#### Caret Ranges `^1.2.3` `^0.2.5` `^0.0.4`

Allows changes that do not modify the left-most non-zero element in the
`[major, minor, patch]` tuple. In other words, this allows patch and
minor updates for versions `1.0.0` and above, patch updates for
versions `0.X >=0.1.0`, and _no_ updates for versions `0.0.X`.

Many authors treat a `0.x` version as if the `x` were the major
"breaking-change" indicator.

Caret ranges are ideal when an author may make breaking changes
between `0.2.4` and `0.3.0` releases, which is a common practice.
However, it presumes that there will _not_ be breaking changes between
`0.2.4` and `0.2.5`. It allows for changes that are presumed to be
additive (but non-breaking), according to commonly observed practices.

- `^1.2.3` := `>=1.2.3 <2.0.0`
- `^0.2.3` := `>=0.2.3 <0.3.0`
- `^0.0.3` := `>=0.0.3 <0.0.4`
- `^1.2.3-beta.2` := `>=1.2.3-beta.2 <2.0.0` Note that prereleases in
  the `1.2.3` version will be allowed, if they are greater than or
  equal to `beta.2`. So, `1.2.3-beta.4` would be allowed, but
  `1.2.4-beta.2` would not, because it is a prerelease of a
  different `[major, minor, patch]` tuple.
- `^0.0.3-beta` := `>=0.0.3-beta <0.0.4` Note that prereleases in the
  `0.0.3` version _only_ will be allowed, if they are greater than or
  equal to `beta`. So, `0.0.3-pr.2` would be allowed.

When parsing caret ranges, a missing `patch` value desugars to the
number `0`, but will allow flexibility within that value, even if the
major and minor versions are both `0`.

- `^1.2.x` := `>=1.2.0 <2.0.0`
- `^0.0.x` := `>=0.0.0 <0.1.0`
- `^0.0` := `>=0.0.0 <0.1.0`

A missing `minor` and `patch` values will desugar to zero, but also
allow flexibility within those values, even if the major version is
zero.

- `^1.x` := `>=1.0.0 <2.0.0`
- `^0.x` := `>=0.0.0 <1.0.0`

### Range Grammar

Putting all this together, here is a Backus-Naur grammar for ranges,
for the benefit of parser authors:

```bnf
range-set  ::= range ( logical-or range ) *
logical-or ::= ( " " ) * "||" ( " " ) *
range      ::= hyphen | simple ( " " simple ) * | ""
hyphen     ::= partial " - " partial
simple     ::= primitive | partial | tilde | caret
primitive  ::= ( "<" | ">" | ">=" | "<=" | "=" ) partial
partial    ::= xr ( "." xr ( "." xr qualifier ? )? )?
xr         ::= "x" | "X" | "*" | nr
nr         ::= "0" | ["1"-"9"] ( ["0"-"9"] ) *
tilde      ::= "~" partial
caret      ::= "^" partial
qualifier  ::= ( "-" pre )? ( "+" build )?
pre        ::= parts
build      ::= parts
parts      ::= part ( "." part ) *
part       ::= nr | [-0-9A-Za-z]+
```

## Functions

All methods and classes take a final `options` object argument. All
options in this object are `false` by default. The options supported
are:

- `loose` Be more forgiving about not-quite-valid semver strings.
  (Any resulting output will always be 100% strict compliant, of
  course.) For backwards compatibility reasons, if the `options`
  argument is a boolean value instead of an object, it is interpreted
  to be the `loose` param.
- `includePrerelease` Set to suppress the [default
  behavior](https://github.com/justjavac/deno-semver#prerelease-tags) of
  excluding prerelease tagged versions from ranges unless they are
  explicitly opted into.

Strict-mode Comparators and Ranges will be strict about the SemVer
strings that they parse.

- `valid(v)`: Return the parsed version, or null if it"s not valid.
- `inc(v, release)`: Return the version incremented by the release
  type (`major`, `premajor`, `minor`, `preminor`, `patch`,
  `prepatch`, or `prerelease`), or null if it"s not valid
  - `premajor` in one call will bump the version up to the next major
    version and down to a prerelease of that major version.
    `preminor`, and `prepatch` work the same way.
  - If called from a non-prerelease version, the `prerelease` will work the
    same as `prepatch`. It increments the patch version, then makes a
    prerelease. If the input version is already a prerelease it simply
    increments it.
- `prerelease(v)`: Returns an array of prerelease components, or null
  if none exist. Example: `prerelease("1.2.3-alpha.1") -> ["alpha", 1]`
- `major(v)`: Return the major version number.
- `minor(v)`: Return the minor version number.
- `patch(v)`: Return the patch version number.
- `intersects(r1, r2, loose)`: Return true if the two supplied ranges
  or comparators intersect.
- `parse(v)`: Attempt to parse a string as a semantic version, returning either
  a `SemVer` object or `null`.

### Comparison

- `gt(v1, v2)`: `v1 > v2`
- `gte(v1, v2)`: `v1 >= v2`
- `lt(v1, v2)`: `v1 < v2`
- `lte(v1, v2)`: `v1 <= v2`
- `eq(v1, v2)`: `v1 == v2` This is true if they"re logically equivalent,
  even if they"re not the exact same string. You already know how to
  compare strings.
- `neq(v1, v2)`: `v1 != v2` The opposite of `eq`.
- `cmp(v1, comparator, v2)`: Pass in a comparison string, and it"ll call
  the corresponding function above. `"==="` and `"!=="` do simple
  string comparison, but are included for completeness. Throws if an
  invalid comparison string is provided.
- `compare(v1, v2)`: Return `0` if `v1 == v2`, or `1` if `v1` is greater, or `-1` if
  `v2` is greater. Sorts in ascending order if passed to `Array.sort()`.
- `rcompare(v1, v2)`: The reverse of compare. Sorts an array of versions
  in descending order when passed to `Array.sort()`.
- `compareBuild(v1, v2)`: The same as `compare` but considers `build` when two versions
  are equal. Sorts in ascending order if passed to `Array.sort()`.
  `v2` is greater. Sorts in ascending order if passed to `Array.sort()`.
- `diff(v1, v2)`: Returns difference between two versions by the release type
  (`major`, `premajor`, `minor`, `preminor`, `patch`, `prepatch`, or `prerelease`),
  or null if the versions are the same.

### Comparators

- `intersects(comparator)`: Return true if the comparators intersect

### Ranges

- `validRange(range)`: Return the valid range or null if it"s not valid
- `satisfies(version, range)`: Return true if the version satisfies the
  range.
- `maxSatisfying(versions, range)`: Return the highest version in the list
  that satisfies the range, or `null` if none of them do.
- `minSatisfying(versions, range)`: Return the lowest version in the list
  that satisfies the range, or `null` if none of them do.
- `minVersion(range)`: Return the lowest version that can possibly match
  the given range.
- `gtr(version, range)`: Return `true` if version is greater than all the
  versions possible in the range.
- `ltr(version, range)`: Return `true` if version is less than all the
  versions possible in the range.
- `outside(version, range, hilo)`: Return true if the version is outside
  the bounds of the range in either the high or low direction. The
  `hilo` argument must be either the string `">"` or `"<"`. (This is
  the function called by `gtr` and `ltr`.)
- `intersects(range)`: Return true if any of the ranges comparators intersect

Note that, since ranges may be non-contiguous, a version might not be
greater than a range, less than a range, _or_ satisfy a range! For
example, the range `1.2 <1.2.9 || >2.0.0` would have a hole from `1.2.9`
until `2.0.0`, so the version `1.2.10` would not be greater than the
range (because `2.0.1` satisfies, which is higher), nor less than the
range (since `1.2.8` satisfies, which is lower), and it also does not
satisfy the range.

If you want to know if a version satisfies or does not satisfy a
range, use the `satisfies(version, range)` function.

### Coercion

- `coerce(version)`: Coerces a string to semver if possible

This aims to provide a very forgiving translation of a non-semver
string to semver. It looks for the first digit in a string, and
consumes all remaining characters which satisfy at least a partial semver
(e.g., `1`, `1.2`, `1.2.3`) up to the max permitted length (256 characters).
Longer versions are simply truncated (`4.6.3.9.2-alpha2` becomes `4.6.3`).
All surrounding text is simply ignored (`v3.4 replaces v3.3.1` becomes `3.4.0`).
Only text which lacks digits will fail coercion (`version one` is not valid).
The maximum length for any semver component considered for coercion is 16 characters;
longer components will be ignored (`10000000000000000.4.7.4` becomes `4.7.4`).
The maximum value for any semver component is `Integer.MAX_SAFE_INTEGER || (2**53 - 1)`;
higher value components are invalid (`9999999999999999.4.7.4` is likely invalid).

### Clean

- `clean(version)`: Clean a string to be a valid semver if possible

This will return a cleaned and trimmed semver version. If the provided version is not valid a null will be returned. This does not work for ranges.

ex.

- `s.clean(" = v 2.1.5foo")`: `null`
- `s.clean(" = v 2.1.5foo", { loose: true })`: `"2.1.5-foo"`
- `s.clean(" = v 2.1.5-foo")`: `null`
- `s.clean(" = v 2.1.5-foo", { loose: true })`: `"2.1.5-foo"`
- `s.clean("=v2.1.5")`: `"2.1.5"`
- `s.clean(" =v2.1.5")`: `2.1.5`
- `s.clean(" 2.1.5 ")`: `"2.1.5"`
- `s.clean("~1.0.0")`: `null`
