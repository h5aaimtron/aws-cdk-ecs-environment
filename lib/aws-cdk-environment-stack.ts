/**
 * AWS ECS Environment in CDK
 * Author: Scott Ladd
 * Email: sladd@it.ucla.edu
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { CDKContext } from '../bin/aws-cdk-environment';

interface EnvStackProps extends cdk.StackProps {
  context: CDKContext
}

export class AwsCdkEnvironmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EnvStackProps) {
    super(scope, id, props);

    // Provision VPC and Subnets.
    const vpc = new ec2.Vpc(this, `${props.context.appName}-${props.context.environment}-vpc`, {
      vpcName: `${props.context.appName}-${props.context.environment}`,
      maxAzs: 2 // Default is all AZs in the region.
    });

    // Provision ECS Cluster
    const cluster = new ecs.Cluster(this, `${props.context.appName}-${props.context.environment}-cluster`, {
      clusterName: `${props.context.appName}-${props.context.environment}`,
      vpc: vpc
    });

    // Create Pipeline for Environment Changes. Ex: Adding environment-specific security groups, adding subnets, etc.
    const pipeline = new CodePipeline(this, `${props.context.appName}-${props.context.environment}-pipeline`, {
      pipelineName: `${props.context.appName}-${props.context.environment}-environment`,
      synth: new CodeBuildStep("SynthStep", {
        input: CodePipelineSource.connection(
          props.context.repo.owner + '/' + props.context.repo.name,
          props.context.repo.branch,
          {
            connectionArn: props.context.codeStarConnectionArn
          }
        ),
        installCommands: ["npm install -g aws-cdk"],
        commands: [
          "npm ci",
          "npm run build",
          "npx cdk synth --context ENV_NAME=" + props.context.environment
        ],
        primaryOutputDirectory: "cdk.out"
      })
    });
  }
}
