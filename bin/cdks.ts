#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdksStack } from '../lib/cdks-stack';

const app = new cdk.App();
new CdksStack(app, 'CdksStack');
