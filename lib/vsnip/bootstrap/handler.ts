import { createApiHandler } from "../interface/api-handler";
import { CreateVsnip } from "../usecase/create-vsnip";

const usecase = new CreateVsnip();

export const handler = createApiHandler(usecase);
