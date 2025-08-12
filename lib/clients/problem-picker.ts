import { randomInt } from "crypto";
import { ProblemModelsJson, ProblemsJson, UpdatePromlem } from "./atcoder-problems-client";

export type Problem = {
  id: string;
  difficulty: number;
};

export type DifficultyMap = {
  hai: Problem[];
  cha: Problem[];
  midori: Problem[];
  mizu: Problem[];
  ao: Problem[];
  ki: Problem[];
  dai: Problem[];
  aka: Problem[];
};

export class ProblemPicker {
  private diffMap: DifficultyMap;

  constructor(problemJson: ProblemsJson, problemModelJson: ProblemModelsJson) {
    const abcProbs: Problem[] = problemJson
      .filter((item) => item.id.startsWith("abc"))
      .map((item) => {
        const model = problemModelJson[item.id];
        if (model === undefined || model.difficulty === undefined || model.is_experimental === undefined) {
          return undefined;
        }
        return {
          id: item.id,
          difficulty: model.difficulty,
          is_experimental: model.is_experimental,
        };
      })
      .filter((item) => item !== undefined)
      .filter((item) => !item.is_experimental && item.difficulty >= 0);
    this.diffMap = this.clasifyProblems(abcProbs);
  }

  pickProblems = (problemDiffs: string[]): UpdatePromlem[] => {
    return problemDiffs.map((diff, idx) => {
      const problems = this.diffMap[diff as keyof DifficultyMap];
      const index = randomInt(problems.length);
      const [selected] = problems.splice(index, 1);
      return {
        id: selected.id,
        point: (idx + 1) * 100,
        order: idx,
      };
    });
  };

  private clasifyProblems = (problems: Problem[]): DifficultyMap => {
    const map: DifficultyMap = {
      hai: [],
      cha: [],
      midori: [],
      mizu: [],
      ao: [],
      ki: [],
      dai: [],
      aka: [],
    };
    for (const problem of problems) {
      if (problem.difficulty <= 399) {
        map.hai.push(problem);
      } else if (problem.difficulty <= 799) {
        map.cha.push(problem);
      } else if (problem.difficulty <= 1199) {
        map.midori.push(problem);
      } else if (problem.difficulty <= 1599) {
        map.mizu.push(problem);
      } else if (problem.difficulty <= 1999) {
        map.ao.push(problem);
      } else if (problem.difficulty <= 2399) {
        map.ki.push(problem);
      } else if (problem.difficulty <= 2799) {
        map.dai.push(problem);
      } else {
        map.aka.push(problem);
      }
    }
    return map;
  };
}
