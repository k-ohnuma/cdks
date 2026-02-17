import { AwsDynamoDBDocumentClient } from "../clients/dynamo-db-client";

export interface ProblemDifficulty {
  problemId: string;
  difficulty: number;
}

export class ProblemDifficultyRepository {
  private readonly dynamodbClient: AwsDynamoDBDocumentClient;
  private readonly tableName: string;
  constructor(tableName: string, dynamoDBClient: AwsDynamoDBDocumentClient) {
    this.dynamodbClient = dynamoDBClient;
    this.tableName = tableName;
  }

  get = async (problemId: string): Promise<ProblemDifficulty | undefined> => {
    return (await this.dynamodbClient.getItem({
      TableName: this.tableName,
      Key: { problemId },
    })) as ProblemDifficulty | undefined;
  };

  put = async (item: ProblemDifficulty) => {
    await this.dynamodbClient.put({
      TableName: this.tableName,
      Item: item,
    });
  };
}
