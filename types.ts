export enum ExperienceLevel {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado',
  COMPETITIVE = 'Competitivo'
}

export enum DayOfWeek {
  MONDAY = 'Lunes',
  TUESDAY = 'Martes',
  WEDNESDAY = 'Miércoles',
  THURSDAY = 'Jueves',
  FRIDAY = 'Viernes',
  SATURDAY = 'Sábado'
}

export enum ActivityType {
  SWIMMING = 'Natación',
  AQUAGYM = 'Aquagym'
}

export enum ClassType {
  GROUP = 'Grupal',
  PRIVATE = 'Particular'
}

export enum TargetAudience {
  KIDS = 'Niños (4-12)',
  ADULTS = 'Adultos (+12)',
  ALL = 'General'
}

export interface Teacher {
  id: string;
  name: string;
  photoUrl: string;
  specialty: string;
}

export interface SwimClass {
  id: string;
  day: DayOfWeek;
  time: string; // "14:00"
  teacherId: string;
  level: ExperienceLevel;
  totalSlots: number;
  bookedSlots: number;
  price: number;
  activityType: ActivityType;
  classType: ClassType;
  targetAudience: TargetAudience;
  minAge?: number; // For specific kid groups (e.g., 4-5)
  maxAge?: number;
}

export interface UserProfile {
  age: number;
  level: ExperienceLevel;
  name: string;
  documentNumber: string;
  phoneNumber: string;
  activityType: ActivityType;
  classType: ClassType;
}

export interface AIRecommendation {
  recommendedLevel: ExperienceLevel;
  focusArea: string;
  motivationTip: string;
  reasoning: string;
}