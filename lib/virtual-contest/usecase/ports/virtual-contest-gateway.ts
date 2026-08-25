import { ContestSummary, CreatedVirtualContest, CreateVirtualContestInput } from "../models/virtual-contest";

export interface VirtualContestGateway {
  findUpcomingContests(searchMinute: number): Promise<ContestSummary[]>;
  getContestUrl(id: string): string;
  createContest(input: CreateVirtualContestInput): Promise<CreatedVirtualContest>;
}
