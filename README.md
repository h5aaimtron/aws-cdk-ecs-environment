# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Stack Deployment

`cdk synth --context ENV_NAME=production`   This is an example of synthesizing the production code.
`cdk deploy --context ENV_NAME=production`  This is an example of deploying the production code.

Synth and Deploy utilize the AWS CLI under the hood, so make sure you've set the appropriate AWS CLI profile prior to running the command(s).

## Infrastructure Description

This particular stack provisions a basic environment for hosting an ECS cluster. It will create a VPC with 2 public and 2 private subnets across 2 availability zones. This is the default setup utilized by AWS as of this repository creation. Additionally, 2 NAT gateways will be provisioned to allow for EGRESS for any internal resources within your additional stacks (Ex: scheduled jobs that run in private subnet but require internet access).

Once the VPC and appropriate network infrastructure is provisioned, the stack will then create a ECS clusters to host your future product services. These services will reside behind an application load balancer (ALB). Finally, a simple code pipeline is added to monitor changes to the environments repository and trigger builds upon changes. There are 3 primary steps for this pipeline, source, build, and synth.

* Note: If re-using existing infrastructure (Pre-existing VPC w/subnets), code for creating the VPC can be changed to instead look up a vpc by name or arn.

## CDK Context Configuration (cdk.json)

General parameters for build and deploy are stored within the cdk.json and imported into the CDKContext object. Currently this information encompasses appName (think product/product pod/team name). For those migrating from AWS Copilot, this would be the equivalent of the APP in copilot. For instance, if I were a financial system, I might set my appName to finance. This is used to create meaningful stack IDs and infrastructure object IDs (Ex: finance-qa-ecs-cluster). Tagging is "global" within the stack. Tags can be set in the aws-cdk-environment.ts file under /bin.

"globals" contains the appName and region you're operating out of for this particular product. "baseDir" is a hold over for single page applications and is not utilized within this particular repo or stack.

The next section entails the various environments you may wish to deploy. "production" for instance, has the environment name "production", has a flag isProd (used for turning on pipeline release approvals), a code star connection Arn (assumed you've set this up outside of this work), and the GitHub repository information that the codestar connection has access. This last bit of information to to create stack-specific pipelines that are self-mutating. This means, as you modify your stacks, the pipeline can detect the stack change and apply those changes without requiring redeployment from the cli.

* Note: Some infrastructure is considered immutable (VPC). This means these resources cannot be changed after provisioning and will result in build fails when applying change sets. 