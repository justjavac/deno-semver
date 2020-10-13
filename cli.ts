import * as semver from "./mod.ts";

const [command, ...args] = Deno.args;

const output = async (content: string) =>
  await Deno.stdout.write(new TextEncoder().encode(content?.toString() + "\n"));

const callFunction = async (command: string, args: string[]) =>
  //@ts-ignore
  await output(semver[command](...args));

switch (command) {
  case "valid":
  case "clean":
  case "satisfies":
  case "gt":
  case "lt":
  case "minVersion":
    await callFunction(command, args);
    break;
  default:
    await output(`valid 1.2.3 // "1.2.3"
valid a.b.c // null
clean "  =v1.2.3   " // "1.2.3"
satisfies "1.2.3" "1.x || >=2.5.0 || 5.0.0 - 7.2.3" // true
gt "1.2.3" "9.8.7" // false
lt "1.2.3" "9.8.7" // true
minVersion ">=1.0.0" // "1.0.0"`);
}

Deno.exit();
