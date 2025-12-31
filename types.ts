
export enum Level {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado',
  INITIAL = 'Nivel Inicial',
  MEDIUM = 'Nivel Medio',
  PRO = 'Nivel Pro'
}

export enum Category {
  KIDS = 'Niños',
  ADULTS = 'Adultos',
  ACUAGYM = 'Acuagym'
}

export interface SwimmingClass {
  id: string;
  category: Category;
  level: Level | string;
  time: string;
  days: string[];
  instructor: string;
  capacity: number;
  remainingSlots: number;
  price: number;
  ageRange?: string; // Nuevo campo para segmentación por edad
}

export interface Reservation {
  id: string;
  classId: string;
  studentName: string;
  studentAge: number;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'confirmed';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
