import { APIGatewayEvent, Handler } from "aws-lambda";
import { z } from "zod";
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
  const rbody = event.body ?? "{}";
  const jsonBody = JSON.parse(rbody);
  const eventBody = eBody.safeParse(jsonBody);
  if (!eventBody.success) {
    return getResponse(
      {
        error: "invalid request json format",
      },
      400,
    );
  }

  const title = eventBody.data.title.trim();
  const description = eventBody.data.description.trim();
  const prefix = eventBody.data.prefix.trim();
  const body = getBody(eventBody.data.body);

  const vsnip: Vsnip = {
    [title]: {
      prefix,
      body,
      description,
    },
  };
  return getResponse(vsnip);
};
