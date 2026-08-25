import { AtcoderProblemsClient, CreateContestInput } from "../../clients/atcoder-problems-client";
import { ProblemPicker } from "../../clients/problem-picker";
import { CreatedContest, CreateContestFromRangeInput } from "../usecase/models/contest";
import { ContestCreatorGateway } from "../usecase/ports/contest-creator-gateway";

export class AtCoderRangeContestCreatorAdapter implements ContestCreatorGateway {
  constructor(private readonly baseEndpoint: string) {}

  async createContest(input: CreateContestFromRangeInput): Promise<CreatedContest> {
    const client = new AtcoderProblemsClient(this.baseEndpoint, input.accessToken);
    const [problemsJson, problemModelsJson] = await Promise.all([
      client.getPromblemsJson(),
      client.getProblemsModelJson(),
    ]);
    const problems = new ProblemPicker(problemsJson, problemModelsJson).getRangeProblems(
      input.start,
      input.end,
      input.colors,
    );
    const createInput: CreateContestInput = {
      start_epoch_second: input.startEpochSecond,
      duration_second: input.durationSecond,
      is_public: input.isPublic,
      memo: "",
      mode: input.mode,
      penalty_second: 0,
      title: input.title,
    };
    const id = await client.createContest(createInput, problems);
    return { id, url: client.getContestUrl(id) };
  }
}
