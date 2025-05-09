export interface FrequencyRatings {
  [key: string]: string;
}

export interface DocentesFormData {
  schoolName: string;
  yearsOfExperience: number;
  teachingGradesEarly: string[];
  teachingGradesLate: string[];
  schedule: string;
  feedbackSources: string[];
  frequencyRatings5: FrequencyRatings;
  frequencyRatings6: FrequencyRatings;
  frequencyRatings7: FrequencyRatings;
}

export interface EstudiantesFormData {
  schoolName: string;
  studentGrades: string[];
  frequencyRatings5: FrequencyRatings;
  frequencyRatings6: FrequencyRatings;
  frequencyRatings7: FrequencyRatings;
}

export interface AcudientesFormData {
  schoolName: string;
  studentGrades: string[];
  frequencyRatings5: FrequencyRatings;
  frequencyRatings6: FrequencyRatings;
  frequencyRatings7: FrequencyRatings;
} 