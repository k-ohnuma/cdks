import { Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Config } from "./config";

export class VsnipStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, config: Config) {
    super(scope, id, props);

    const BASE_NAME = "vsnip";
    const lambda = new NodejsFunction(this, "vsnip", {
      functionName: `${config.resourcePrefix}-${BASE_NAME}`,
      runtime: Runtime.NODEJS_20_X,
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

    const apiKey = apiGateway.addApiKey("api-key", {
      apiKeyName: `${config.resourcePrefix}-${BASE_NAME}-apikey`,
    });
    const usagePlan = apiGateway.addUsagePlan("usage-plan");
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: apiGateway.deploymentStage });
  }
}
