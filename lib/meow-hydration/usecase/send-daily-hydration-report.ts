import { getPrevious24HoursRange } from "../../shared/datetime/clock";
import { MessageSender } from "../../shared/messaging/message-sender";
import { DrinkEventRepository } from "../domain/drink-event-repository";
import { DrinkSummary, summarizeDrinkEvents } from "../domain/drink-summary";

export type SendDailyHydrationReportInput = {
  reportAt: string;
};

export type SendDailyHydrationReportOutput = {
  from: string;
  to: string;
  summary: DrinkSummary;
};

export interface SendDailyHydrationReportInputPort {
  execute(input: SendDailyHydrationReportInput): Promise<SendDailyHydrationReportOutput>;
}

export class SendDailyHydrationReport implements SendDailyHydrationReportInputPort {
  constructor(
    private readonly repository: DrinkEventRepository,
    private readonly messageSenders: MessageSender[],
  ) {}

  async execute({ reportAt }: SendDailyHydrationReportInput): Promise<SendDailyHydrationReportOutput> {
    const range = getPrevious24HoursRange(reportAt);
    const events = await this.repository.findByOccurredAtRange(range.from, range.to);
    const summary = summarizeDrinkEvents(events);
    await Promise.all(this.messageSenders.map((sender) => sender.postMessage(formatReport(range, summary))));

    return { ...range, summary };
  }
}

const formatReport = (range: { from: string; to: string }, summary: DrinkSummary): string => {
  const formatNullableMl = (value: number | null) => (value === null ? "-" : `${value}ml`);

  return [
    "【過去24時間の水分補給レポート】",
    `期間: ${range.from} - ${range.to}`,
    `飲んだ回数: ${summary.count}回`,
    `合計: ${summary.totalMl}ml`,
    `最小: ${formatNullableMl(summary.minMl)}`,
    `最大: ${formatNullableMl(summary.maxMl)}`,
    `平均: ${formatNullableMl(summary.averageMl)}`,
  ].join("\n");
};
