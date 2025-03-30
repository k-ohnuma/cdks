#!/usr/bin/env node
import { App, StackProps } from "aws-cdk-lib";
import { VsnipStack } from "../lib/vsnip-stack";
import { Config, DEFAULT_CONFIG } from "../lib/config";

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
