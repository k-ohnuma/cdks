import { CreatedContest, CreateContestFromRangeInput } from "./models/contest";
import { ContestCreatorGateway } from "./ports/contest-creator-gateway";

export interface CreateContestFromRangeInputPort {
  execute(input: CreateContestFromRangeInput): Promise<CreatedContest>;
}

export class CreateContestFromRange implements CreateContestFromRangeInputPort {
  constructor(private readonly contestCreator: ContestCreatorGateway) {}

  async execute(input: CreateContestFromRangeInput): Promise<CreatedContest> {
    return await this.contestCreator.createContest({
      ...input,
      start: Math.min(input.start, input.end),
      end: Math.max(input.start, input.end),
    });
  }
}
