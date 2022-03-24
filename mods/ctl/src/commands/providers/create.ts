import "../../config";
import {CLIError} from "@oclif/errors";
import {Command} from "@oclif/command";
import {CliUx} from "@oclif/core";
import {getProjectConfig, hasProjectConfig} from "../../config";

const Providers = require("@fonoster/providers");
const inquirer = require("inquirer");

export default class CreateCommand extends Command {
  static description = `create a new Fonoster Provider (trunk)
  ...
  Create a new Fonoster Provider
  `;

  async run() {
    if (!hasProjectConfig()) {
      throw new CLIError("you must set a default project");
    }
    console.log("This utility will help you create a new Fonoster Provider");
    console.log("Press ^C at any time to quit.");

    const answers = await inquirer.prompt([
      {
        name: "name",
        message: "friendly name",
        type: "input"
      },
      {
        name: "username",
        message: "username",
        type: "input"
      },
      {
        name: "secret",
        message: "secret",
        type: "password",
        mask: true
      },
      {
        name: "host",
        message: "host",
        type: "input"
      },
      {
        name: "transport",
        message: "transport",
        type: "list",
        choices: ["tcp", "udp"],
        default: "tcp"
      },
      {
        name: "expires",
        message: "sip registration refresh (in seconds)",
        type: "input",
        validate: (answer: number) => {
          if (isNaN(answer)) {
            return "please enter a number";
          }
          return true;
        },
        default: 600
      },
      {
        name: "confirm",
        message: "ready?",
        type: "confirm"
      }
    ]);

    if (!answers.confirm) {
      console.log("Aborted");
    } else {
      try {
        CliUx.ux.action.start(`Creating Provider ${answers.name}`);

        const providers = new Providers(getProjectConfig());
        const provider = await providers.createProvider(answers);
        await CliUx.ux.wait(1000);

        CliUx.ux.action.stop(provider.ref);
      } catch (e) {
        CliUx.ux.action.stop();
        if (e.code === 9) {
          throw new CLIError("This Provider already exist");
        } else {
          throw new CLIError(e.message);
        }
      }
    }
  }
}
