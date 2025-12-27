import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Config } from "./config";

export class VirtualContestAbcPickerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, config: Config) {
    super(scope, id, props);

    const BASE_NAME = "virtual-contest-selector";
    const lambda = new NodejsFunction(this, "api", {
      functionName: `${config.resourcePrefix}-${BASE_NAME}`,
      runtime: Runtime.NODEJS_24_X,
      environment: {
        ACP_BASE_ENDPOINT: config.virtualContest.endpoint,
      },
      timeout: Duration.seconds(60),
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
      apiKeyRequired: false,
    });
  }
}
