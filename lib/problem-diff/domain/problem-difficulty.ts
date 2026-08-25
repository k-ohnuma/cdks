export type ProblemDifficulty = {
  problemId: string;
  difficulty: number;
};

export const calculateProblemDifficulty = (sourceDifficulty: number): number => {
  if (sourceDifficulty >= 400) return sourceDifficulty;

  const exponent = (400 - sourceDifficulty) / 400;
  return Math.round(400 / Math.exp(exponent));
};
