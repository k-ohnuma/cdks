import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Config } from "./config";
import path from "node:path";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

export class MeowHydrationStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, config: Config) {
    super(scope, id, props);

    const BASE_NAME = "meow-hydration";
    const lineEnvironment = {
      // コンソールから手で設定
      LINE_CHANNEL_ACCESS_TOKEN: "",
      // コンソールから手で設定（カンマ区切り）
      LINE_SEND_USER_IDS: "",
    };

    const table = new Table(this, "table", {
      tableName: `${config.resourcePrefix}-${BASE_NAME}-${config.env}`,
      partitionKey: {
        name: "waterSourceId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "occurredAt",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambda = new NodejsFunction(this, "api", {
      entry: path.join(__dirname, "../meow-hydration/bootstrap/handler.ts"),
      functionName: `${config.resourcePrefix}-${BASE_NAME}`,
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
        ...lineEnvironment,
      },
    });
    table.grantWriteData(lambda);

    const dailyReport = new NodejsFunction(this, "daily-report", {
      entry: path.join(__dirname, "../meow-hydration/bootstrap/daily-report-handler.ts"),
      functionName: `${config.resourcePrefix}-${BASE_NAME}-daily-report`,
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
        ...lineEnvironment,
      },
    });
    table.grantReadData(dailyReport);

    const dailyReportRule = new Rule(this, "daily-report-rule", {
      ruleName: `${config.resourcePrefix}-${BASE_NAME}-daily-report-${config.env}`,
      schedule: Schedule.cron({ minute: "0", hour: "15" }),
    });
    dailyReportRule.addTarget(new LambdaFunction(dailyReport));

    const setupState = new NodejsFunction(this, "setup-state", {
      entry: path.join(__dirname, "../meow-hydration/bootstrap/setup-state-handler.ts"),
      functionName: `${config.resourcePrefix}-${BASE_NAME}-setup-state`,
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(30),
      environment: lineEnvironment,
    });

    const apiGateway = new RestApi(this, "apigateway", {
      restApiName: `${config.resourcePrefix}-${BASE_NAME}-ag`,
      deployOptions: {
        stageName: config.env,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });
    apiGateway.root.addMethod("POST", new LambdaIntegration(lambda, { allowTestInvoke: false }), {
      apiKeyRequired: true,
    });
    apiGateway.root
      .addResource("setup-state")
      .addMethod("POST", new LambdaIntegration(setupState, { allowTestInvoke: false }), {
        apiKeyRequired: true,
      });

    const apiKey = apiGateway.addApiKey("api-key", {
      apiKeyName: `${config.resourcePrefix}-${BASE_NAME}-apikey`,
    });
    const usagePlan = apiGateway.addUsagePlan("usage-plan");
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: apiGateway.deploymentStage });
  }
}
