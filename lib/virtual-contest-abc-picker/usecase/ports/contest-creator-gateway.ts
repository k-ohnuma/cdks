import { CreatedContest, CreateContestFromRangeInput } from "../models/contest";

export interface ContestCreatorGateway {
  createContest(input: CreateContestFromRangeInput): Promise<CreatedContest>;
}
