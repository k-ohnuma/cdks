import { CreateVsnipInput, Vsnip } from "./models/vsnip";

export interface CreateVsnipInputPort {
  execute(input: CreateVsnipInput): Vsnip;
}

export class CreateVsnip implements CreateVsnipInputPort {
  execute(input: CreateVsnipInput): Vsnip {
    return {
      [input.title.trim()]: {
        prefix: input.prefix.trim(),
        body: splitBodyLines(input.body),
        description: input.description.trim(),
      },
    };
  }
}

export const splitBodyLines = (body: string): string[] => {
  return body.split("\n").map((line) => line.trimEnd());
};
