import { AtcoderProblemsClient, CreateContestInput } from "../../clients/atcoder-problems-client";
import { ProblemPicker } from "../../clients/problem-picker";
import { ContestSummary, CreatedVirtualContest, CreateVirtualContestInput } from "../usecase/models/virtual-contest";
import { VirtualContestGateway } from "../usecase/ports/virtual-contest-gateway";

export class AtCoderVirtualContestAdapter implements VirtualContestGateway {
  constructor(private readonly client: AtcoderProblemsClient) {}

  async findUpcomingContests(searchMinute: number): Promise<ContestSummary[]> {
    const contests = await this.client.getUpcomingContest(searchMinute);
    return contests.map(({ id, title }) => ({ id, title }));
  }

  getContestUrl(id: string): string {
    return this.client.getContestUrl(id);
  }

  async createContest(input: CreateVirtualContestInput): Promise<CreatedVirtualContest> {
    const [problemsJson, problemModelsJson] = await Promise.all([
      this.client.getPromblemsJson(),
      this.client.getProblemsModelJson(),
    ]);
    const problems = new ProblemPicker(problemsJson, problemModelsJson).pickProblems(input.problemDifficulties);
    const createInput: CreateContestInput = {
      duration_second: input.durationSecond,
      is_public: input.isPublic,
      memo: input.memo,
      mode: null,
      penalty_second: 300,
      start_epoch_second: input.startEpochSecond,
      title: input.title,
    };
    const id = await this.client.createContest(createInput, problems);
    return { id, url: this.client.getContestUrl(id) };
  }
}
