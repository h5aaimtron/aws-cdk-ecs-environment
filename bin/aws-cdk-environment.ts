#!/usr/bin/env node
/**
 * AWS ECS Environment in CDK
 * Author: Scott Ladd
 * Email: sladd@it.ucla.edu
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkEnvironmentStack } from '../lib/aws-cdk-environment-stack';

const app = new cdk.App();
const envName: string = app.node.tryGetContext('ENV_NAME') || 'dev';

// Retrieve global and environment configurations to create a context.
const envConfig = app.node.tryGetContext(envName);
const globalConfig = app.node.tryGetContext('globals');
const context: CDKContext = { ...globalConfig, ...envConfig };

console.log("Building " + context.appName + " environment for " + context.environment);

new AwsCdkEnvironmentStack(app, 'AwsCdkEnvironmentStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  /**
   * Extending the stack props to pass our context values (no secrets should be in the context)
   */
  context: context
});

/**
 * Define tags for infrastructure within the stack.
 */
cdk.Tags.of(app).add("organization", "YourOrg");
cdk.Tags.of(app).add("department", "YourDept");
cdk.Tags.of(app).add("team", "YourTeam");
cdk.Tags.of(app).add("app", "Environments");
cdk.Tags.of(app).add("contact", "Your@EmailAddress.com");
cdk.Tags.of(app).add("github", context.repo.owner + "/" + context.repo.name);

/**
 * CDK Context (cdk.json)
 */
export type CDKContext = {
  appName: string;
  region: string;
  environment: string;
  isProd: boolean;
  domain: string;
  subdomain: string,
  baseDir: string;
  codeStarConnectionArn: string;
  repo: {
    owner: string,
    name: string,
    branch: string
  }
}