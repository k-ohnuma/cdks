import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getErrorResponse } from "../../shared/api/error-response";
import { parseRequestBody } from "../../shared/api/request";
import { getResponse } from "../../shared/api/response";
import { SETUP_STATES } from "../domain/setup-state";
import { NotifySetupStateInputPort } from "../usecase/notify-setup-state";

const requestSchema = z.object({
  state: z.enum(SETUP_STATES),
});

export type SetupStateApiHandler = (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;

export const createSetupStateApiHandler = (usecase: NotifySetupStateInputPort): SetupStateApiHandler => {
  return async (event) => {
    try {
      const { state } = parseRequestBody(requestSchema, event.body);
      return getResponse(await usecase.execute(state));
    } catch (error) {
      return getErrorResponse(error);
    }
  };
};
