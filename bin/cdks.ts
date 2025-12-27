#!/usr/bin/env node
import { App, StackProps } from "aws-cdk-lib";
import { VsnipStack } from "../lib/vsnip-stack";
import { Config, DEFAULT_CONFIG } from "../lib/config";
import { VirtualContestStack } from "../lib/virtual-contest-stack";
import { VirtualContestAbcPickerStack } from "../lib/virtual-contest-abc-picker-stack";

const app = new App();
const env = app.node.tryGetContext("env") || "dev";
const region = process.env.CDK_REGION!;
const config: Config = {
  ...DEFAULT_CONFIG,
  env,
};

const stackProps: StackProps = {
  env: {
    account: process.env.CDK_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region,
  },
};

const _vsnip = new VsnipStack(app, `${config.resourcePrefix}-vsnip-stack`, stackProps, config);
const _virCon = new VirtualContestStack(app, `${config.resourcePrefix}-virtual-contest-stack`, stackProps, config);

const _va = new VirtualContestAbcPickerStack(
  app,
  `${config.resourcePrefix}-virtual-contest-abc-picker-stack`,
  stackProps,
  config,
);
