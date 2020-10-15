import { assertEquals } from "./deps.ts";

Deno.test("cli", async function (): Promise<void> {
  const cmds = [
    { commands: ["valid", "1.2.3"], expected: "1.2.3\n" },
    { commands: ["clean", "  =v1.2.3   "], expected: "1.2.3\n" },
    {
      commands: ["satisfies", "1.2.3", "1.x || >=2.5.0 || 5.0.0 - 7.2.3"],
      expected: "true\n",
    },
    { commands: ["gt", "1.2.3", "9.8.7"], expected: "false\n" },
    { commands: ["lt", "1.2.3", "9.8.7"], expected: "true\n" },
    { commands: ["minVersion", ">=1.0.0"], expected: "1.0.0\n" },
  ];

  const errorMsg = (command: string, expected: string, output: string) =>
    `Command '${command}' failed; Expected: ${expected}; Was: ${output}`;

  for await (const { commands, expected } of cmds) {
    const p = Deno.run({
      cmd: [
        "deno",
        "run",
        "cli.ts",
        ...commands,
      ],
      stdout: "piped",
    });

    const { code } = await p.status();

    assertEquals(
      code,
      0,
      errorMsg(commands[0] + " code", "0", code.toString()),
    );

    const rawOutput = await p.output();

    p.close();

    const output = new TextDecoder().decode(rawOutput);

    assertEquals(output, expected, errorMsg(commands[0], expected, output));
  }
});
