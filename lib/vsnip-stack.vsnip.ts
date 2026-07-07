import { APIGatewayEvent, Handler } from "aws-lambda";
import { z } from "zod";
import { getErrorResponse, parseRequestBody } from "./utils/api";
import { getResponse } from "./utils/lib";

const eBody = z.object({
  title: z.string(),
  prefix: z.string(),
  body: z.string(),
  description: z.string(),
});

type Vsnip = {
  [key: string]: {
    prefix: string;
    body: string[];
    description: string;
  };
};

export const getBody = (bodyString: string): string[] => {
  const sp = bodyString.split("\n");
  return sp.map((item) => item.trimEnd());
};

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    const eventBody = parseRequestBody(eBody, event.body);
    const title = eventBody.title.trim();
    const description = eventBody.description.trim();
    const prefix = eventBody.prefix.trim();
    const body = getBody(eventBody.body);

    const vsnip: Vsnip = {
      [title]: {
        prefix,
        body,
        description,
      },
    };
    return getResponse(vsnip);
  } catch (e) {
    return getErrorResponse(e);
  }
};
