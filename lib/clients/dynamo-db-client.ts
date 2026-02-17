import { DynamoDBClient, DynamoDBServiceException } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommandInput,
  DynamoDBDocument,
  GetCommandInput,
  paginateQuery,
  paginateScan,
  PutCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Logger } from "pino";
import { AppError, errors } from "../utils/error";

export class AwsDynamoDBDocumentClient {
  private client: DynamoDBDocument;
  private logger: Logger;
  constructor(logger: Logger) {
    const _dydbClient = new DynamoDBClient({});
    const client = DynamoDBDocument.from(_dydbClient, {
      marshallOptions: { removeUndefinedValues: true },
    });
    this.client = client;
    this.logger = logger;
  }

  getItem = async (props: GetCommandInput) => {
    const targetRecord = await this.client.get(props).catch((e) => this.handleError(e));
    return targetRecord.Item;
  };

  put = async (props: PutCommandInput) => {
    await this.client.put(props).catch((e) => this.handleError(e));
    this.logger.info({ msg: `create a record ${props.TableName}` });
  };

  update = async (props: UpdateCommandInput) => {
    await this.client.update(props).catch((e) => this.handleError(e));
    this.logger.info({
      msg: `update a record ${props.TableName}`,
      key: props.Key,
    });
  };

  delete = async (props: DeleteCommandInput) => {
    await this.client.delete(props).catch((e) => this.handleError(e));
    this.logger.info({
      msg: `delete a record ${props.TableName}`,
      key: props.Key,
    });
  };

  remove = async (props: DeleteCommandInput): Promise<boolean> => {
    const targetRecord = await this.getItem({
      TableName: props.TableName,
      Key: props.Key,
    });
    if (!targetRecord) {
      this.logger.warn({
        msg: `not found requested key in ${props.TableName}`,
        key: props.Key,
      });
      return false;
    }
    await this.delete(props);
    return true;
  };

  paginateQueryAndConvertFlatten = async (props: QueryCommandInput) => {
    try {
      const paginator = paginateQuery({ client: this.client }, props);
      const records = [];
      for await (const page of paginator) {
        const items = page.Items ?? [];
        records.push(items);
      }
      return records.flat();
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  paginagteScanAndConvertFlatten = async (props: ScanCommandInput) => {
    try {
      const paginator = paginateScan({ client: this.client }, props);
      const records = [];
      for await (const page of paginator) {
        const items = page.Items ?? [];
        records.push(items);
      }
      return records.flat();
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  private handleError = (error: unknown): never => {
    this.logger.error({ err: error });

    // AWS SDK v3 の共通例外
    if (error instanceof DynamoDBServiceException) {
      const name = error.name;

      switch (name) {
        case "ConditionalCheckFailedException":
          throw errors.validation({
            msg: "Conditional check failed",
            type: "dynamodb",
          });

        case "ProvisionedThroughputExceededException":
        case "ThrottlingException":
          throw errors.rateLimited({
            msg: "DynamoDB throttled",
            type: "dynamodb",
          });

        case "ResourceNotFoundException":
          throw errors.notFound({
            msg: "DynamoDB resource not found",
            type: "dynamodb",
          });

        case "InternalServerError":
          throw errors.internal({
            msg: "DynamoDB internal error",
            type: "dynamodb",
          });

        default:
          throw new AppError("ERROR", 500, error.message || "Unknown DynamoDB error", "dynamodb");
      }
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("ERROR", 500, "Unexpected error", "unknown");
  };
}
