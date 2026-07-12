export interface PasswordEvaluationResult {
  score: number
  isStrongEnough: boolean
  feedback: {
    warning: string
    suggestions: string[]
  }
}