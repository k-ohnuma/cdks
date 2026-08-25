import { NotificationPort } from "../../lib/shared/notification/notification-port";
import { ContestSummary, CreatedVirtualContest } from "../../lib/virtual-contest/usecase/models/virtual-contest";
import { VirtualContestGateway } from "../../lib/virtual-contest/usecase/ports/virtual-contest-gateway";
import { RunVirtualContest, RunVirtualContestInput } from "../../lib/virtual-contest/usecase/run-virtual-contest";

const input: RunVirtualContestInput = {
  targetContestNames: ["まよコン"],
  searchMinute: 15,
  createContestTitle: "代替コン",
  createContestPublic: true,
  createContestDuration: 6000,
  problemDifficulties: ["hai", "cha"],
  startEpochSecond: 1_700_000_000,
};

describe("RunVirtualContest", () => {
  it("skips creation when a target contest is scheduled", async () => {
    const contestGateway: VirtualContestGateway = {
      findUpcomingContests: jest.fn(async (): Promise<ContestSummary[]> => [{ id: "contest-1", title: "まよコン" }]),
      getContestUrl: jest.fn((id) => `https://example.com/contest/${id}`),
      createContest: jest.fn(),
    };
    const notification: NotificationPort = { send: jest.fn(async () => {}) };
    const usecase = new RunVirtualContest(contestGateway, [notification]);

    const output = await usecase.execute(input);

    expect(output).toStrictEqual({
      action: "skipped",
      contests: [{ title: "まよコン", url: "https://example.com/contest/contest-1" }],
    });
    expect(contestGateway.createContest).not.toHaveBeenCalled();
    expect(notification.send).toHaveBeenCalledWith({
      title: "本日は以下のバチャコンが開催されます！",
      message: "まよコン：https://example.com/contest/contest-1",
      severity: "info",
    });
  });

  it("creates and announces a contest when no target contest is scheduled", async () => {
    const contestGateway: VirtualContestGateway = {
      findUpcomingContests: jest.fn(async (): Promise<ContestSummary[]> => []),
      getContestUrl: jest.fn(),
      createContest: jest.fn(
        async (): Promise<CreatedVirtualContest> => ({
          id: "created-1",
          url: "https://example.com/contest/created-1",
        }),
      ),
    };
    const notification: NotificationPort = { send: jest.fn(async () => {}) };
    const usecase = new RunVirtualContest(contestGateway, [notification]);

    const output = await usecase.execute(input);

    expect(contestGateway.createContest).toHaveBeenCalledWith({
      title: "代替コン",
      memo: "いつも参加しているコンテストが開催されない日のための代替コンテストです。ABCのみ、試験管なし。\n全2問：灰,茶",
      startEpochSecond: 1_700_000_000,
      durationSecond: 6000,
      isPublic: true,
      problemDifficulties: ["hai", "cha"],
    });
    expect(output).toStrictEqual({
      action: "created",
      contest: {
        id: "created-1",
        title: "代替コン",
        url: "https://example.com/contest/created-1",
      },
    });
    expect(notification.send).toHaveBeenCalledWith({
      title: "本日はバチャコンが開催されないので作りました！",
      message: "代替コン：https://example.com/contest/created-1",
      severity: "info",
    });
  });
});
