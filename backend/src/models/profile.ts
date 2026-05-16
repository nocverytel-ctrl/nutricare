export interface Profile {
  name: string
  age: number
  biologicalSex: string
  weight: number
  height: number
  activityLevel: string
  conditions: string[]
  diet: string
  dislikes: string
  budget: string
  goals: string[]
  reminders: boolean
  mealTimes: {
    breakfast: string
    lunch: string
    dinner: string
    snacks: string
  }
  dailyTips: boolean
  updatedAt: string
}
