// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * @author Ivan Chen <v-ivanchen@microsoft.com>
 */

import { expect } from "chai";
import fs from "fs-extra";
import path from "path";
import { it } from "@microsoft/extra-shot-mocha";
import {
  execAsync,
  getTestFolder,
  cleanUp,
  setSimpleAuthSkuNameToB1Bicep,
  getSubscriptionId,
  readContextMultiEnv,
} from "../commonUtils";
import { AadValidator, BotValidator } from "../../commonlib";
import { TemplateProject } from "../../commonlib/constants";
import { CliHelper } from "../../commonlib/cliHelper";
import m365Login from "../../../src/commonlib/m365Login";
import { environmentManager } from "@microsoft/teamsfx-core/build/core/environment";

describe("teamsfx new template", function () {
  let appName: string;
  let testFolder: string;
  let projectPath: string;

  const env = environmentManager.getDefaultEnvName();
  const subscription = getSubscriptionId();
  beforeEach(async () => {
    testFolder = getTestFolder();
  });

  it(`${TemplateProject.HelloWorldBotSSO}`, { testPlanCaseId: 15277464 }, async function () {
    projectPath = path.resolve(testFolder, TemplateProject.HelloWorldBotSSO);
    await execAsync(`teamsfx new template ${TemplateProject.HelloWorldBotSSO}`, {
      cwd: testFolder,
      env: process.env,
      timeout: 0,
    });

    expect(fs.pathExistsSync(projectPath)).to.be.true;
    expect(fs.pathExistsSync(path.resolve(projectPath, ".fx"))).to.be.true;

    // Provision
    await setSimpleAuthSkuNameToB1Bicep(projectPath, env);
    await CliHelper.setSubscription(subscription, projectPath);
    await CliHelper.provisionProject(projectPath);

    // Validate Provision
    const context = await readContextMultiEnv(projectPath, env);

    // Validate Bot Provision
    const bot = new BotValidator(context, projectPath, env);
    await bot.validateProvision(false);

    // deploy
    await CliHelper.deployAll(projectPath);

    {
      // Validate deployment

      // Get context
      const context = await fs.readJSON(`${projectPath}/.fx/states/state.dev.json`);

      // Validate Aad App
      const aad = AadValidator.init(context, false, m365Login);
      await AadValidator.validate(aad);

      // Validate Bot Deploy
      const bot = new BotValidator(context, projectPath, env);
      await bot.validateDeploy();
    }

    // test (validate)
    await execAsync(`teamsfx validate`, {
      cwd: projectPath,
      env: process.env,
      timeout: 0,
    });

    // package
    await execAsync(`teamsfx package`, {
      cwd: projectPath,
      env: process.env,
      timeout: 0,
    });
  });

  after(async () => {
    await cleanUp(appName, projectPath, true, true, false);
  });
});