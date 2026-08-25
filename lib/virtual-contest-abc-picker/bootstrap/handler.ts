import { AtCoderRangeContestCreatorAdapter } from "../infrastructure/atcoder-range-contest-creator-adapter";
import { createApiHandler } from "../interface/api-handler";
import { CreateContestFromRange } from "../usecase/create-contest-from-range";
import { parseVirtualContestAbcPickerConfig } from "./config";

const config = parseVirtualContestAbcPickerConfig(process.env);
const contestCreator = new AtCoderRangeContestCreatorAdapter(config.acpBaseEndpoint);
const usecase = new CreateContestFromRange(contestCreator);

export const handler = createApiHandler(usecase);
