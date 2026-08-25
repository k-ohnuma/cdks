import { Notification, NotificationPort } from "../../notification/notification-port";
import { ContestSummary, ProblemDifficulty } from "./models/virtual-contest";
import { VirtualContestGateway } from "./ports/virtual-contest-gateway";
import { getProblemDifficultyLabel } from "./virtual-contest-rules";

export type RunVirtualContestInput = {
  targetContestNames: string[];
  searchMinute: number;
  createContestTitle: string;
  createContestPublic: boolean;
  createContestDuration: number;
  problemDifficulties: ProblemDifficulty[];
  startEpochSecond: number;
};

export type RunVirtualContestOutput =
  | {
      action: "skipped";
      contests: Array<{ title: string; url: string }>;
    }
  | {
      action: "created";
      contest: { id: string; title: string; url: string };
    };

export class RunVirtualContest {
  constructor(
    private readonly contestGateway: VirtualContestGateway,
    private readonly notifications: NotificationPort[],
  ) {}

  async execute(input: RunVirtualContestInput): Promise<RunVirtualContestOutput> {
    const upcomingContests = await this.contestGateway.findUpcomingContests(input.searchMinute);
    const targetContests = this.findTargetContests(input.targetContestNames, upcomingContests);

    if (targetContests.length > 0) {
      await this.notify({
        title: "本日は以下のバチャコンが開催されます！",
        message: targetContests.map((contest) => `${contest.title}：${contest.url}`).join("\n"),
        severity: "info",
      });
      return { action: "skipped", contests: targetContests };
    }

    const difficultyLabels = input.problemDifficulties.map(getProblemDifficultyLabel);
    const contest = await this.contestGateway.createContest({
      title: input.createContestTitle,
      memo: `いつも参加しているコンテストが開催されない日のための代替コンテストです。ABCのみ、試験管なし。\n全${difficultyLabels.length}問：${difficultyLabels.join(",")}`,
      startEpochSecond: input.startEpochSecond,
      durationSecond: input.createContestDuration,
      isPublic: input.createContestPublic,
      problemDifficulties: input.problemDifficulties,
    });

    await this.notify({
      title: "本日はバチャコンが開催されないので作りました！",
      message: `${input.createContestTitle}：${contest.url}`,
      severity: "info",
    });

    return {
      action: "created",
      contest: { ...contest, title: input.createContestTitle },
    };
  }

  private findTargetContests(targetNames: string[], contests: ContestSummary[]) {
    return targetNames.flatMap((targetName) => {
      const contest = contests.find(({ title }) => title === targetName);
      return contest
        ? [
            {
              title: contest.title,
              url: this.contestGateway.getContestUrl(contest.id),
            },
          ]
        : [];
    });
  }

  private async notify(notification: Notification): Promise<void> {
    await Promise.all(this.notifications.map((notifier) => notifier.send(notification)));
  }
}
