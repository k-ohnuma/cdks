import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Config } from "./config";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

export class ProblemDiffStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, config: Config) {
    super(scope, id, props);

    const projectname = "problem-diff";

    const table = new Table(this, "table", {
      tableName: `${config.resourcePrefix}-${projectname}-${config.env}`,
      partitionKey: {
        name: "problemId",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const api = new NodejsFunction(this, "api", {
      functionName: `${config.resourcePrefix}-${projectname}-api-${config.env}`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      environment: { TABLE_NAME: table.tableName },
    });

    const lambda = new NodejsFunction(this, "fetch", {
      functionName: `${config.resourcePrefix}-${projectname}-fetch-${config.env}`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(300),
      environment: {
        TABLE_NAME: table.tableName,
        ACP_BASE_ENDPOINT: config.virtualContest.endpoint,
      },
    });

    table.grantReadData(api);
    table.grantReadWriteData(lambda);

    const rule = new Rule(this, "rule", {
      ruleName: `${config.resourcePrefix}-${projectname}-${config.env}`,
      schedule: Schedule.cron({ hour: "17", minute: "0", weekDay: "WED" }),
    });
    rule.addTarget(new LambdaFunction(lambda));

    const apiGateway = new RestApi(this, "apigateway", {
      restApiName: `${config.resourcePrefix}-${projectname}-${config.env}`,
      deployOptions: {
        stageName: config.env,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });
    apiGateway.root.addMethod("GET", new LambdaIntegration(api, { allowTestInvoke: false }));
  }
}
