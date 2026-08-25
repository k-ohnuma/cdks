import { CreateContestFromRange } from "../../lib/virtual-contest-abc-picker/usecase/create-contest-from-range";
import { CreatedContest } from "../../lib/virtual-contest-abc-picker/usecase/models/contest";
import { ContestCreatorGateway } from "../../lib/virtual-contest-abc-picker/usecase/ports/contest-creator-gateway";

describe("CreateContestFromRange", () => {
  it("normalizes the contest number range before creation", async () => {
    const createdContest: CreatedContest = {
      id: "contest-1",
      url: "https://example.com/contest/contest-1",
    };
    const contestCreator: ContestCreatorGateway = {
      createContest: jest.fn(async () => createdContest),
    };
    const usecase = new CreateContestFromRange(contestCreator);

    const output = await usecase.execute({
      accessToken: "token",
      start: 400,
      end: 300,
      colors: ["hai", "cha"],
      startEpochSecond: 1_700_000_000,
      durationSecond: 7200,
      isPublic: true,
      title: "ABC 300-400",
      mode: "normal",
    });

    expect(contestCreator.createContest).toHaveBeenCalledWith({
      accessToken: "token",
      start: 300,
      end: 400,
      colors: ["hai", "cha"],
      startEpochSecond: 1_700_000_000,
      durationSecond: 7200,
      isPublic: true,
      title: "ABC 300-400",
      mode: "normal",
    });
    expect(output).toBe(createdContest);
  });
});
