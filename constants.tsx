
import React from 'react';
import { Category, Level, SwimmingClass } from './types';

// Fix: Added ICONS export to resolve missing member errors in ChatBot, ClassCard, and App components
export const ICONS = {
  Waves: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1 3 0 3-2 5.5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </svg>
  ),
  Message: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
};

// Fix: Completed CLASSES_DATA array to fix missing properties error on line 83
export const CLASSES_DATA: SwimmingClass[] = [
  // --- CLASES PARA NIÑOS (4-6 AÑOS) ---
  {
    id: 'k-4-6-17h',
    category: Category.KIDS,
    level: "Nivel Inicial",
    ageRange: "4 a 6 años",
    time: '17:00 - 18:00',
    days: ['Lunes', 'Miércoles', 'Jueves'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 4500
  },
  {
    id: 'k-4-6-18h',
    category: Category.KIDS,
    level: "Nivel Inicial",
    ageRange: "4 a 6 años",
    time: '18:00 - 19:00',
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 4500
  },
  {
    id: 'k-4-6-19h',
    category: Category.KIDS,
    level: "Nivel Inicial",
    ageRange: "4 a 6 años",
    time: '19:00 - 20:00',
    days: ['Martes'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 4500
  },

  // --- CLASES PARA NIÑOS (7-9 AÑOS) ---
  {
    id: 'k-7-9-17h',
    category: Category.KIDS,
    level: "Nivel Intermedio",
    ageRange: "7 a 9 años",
    time: '17:00 - 18:00',
    days: ['Lunes', 'Miércoles', 'Jueves'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 4800
  },
  {
    id: 'k-7-9-18h',
    category: Category.KIDS,
    level: "Nivel Intermedio",
    ageRange: "7 a 9 años",
    time: '18:00 - 19:00',
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 4800
  },
  {
    id: 'k-7-9-19h',
    category: Category.KIDS,
    level: "Nivel Intermedio",
    ageRange: "7 a 9 años",
    time: '19:00 - 20:00',
    days: ['Martes'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 4800
  },

  // --- CLASES PARA NIÑOS (10-12 AÑOS) ---
  {
    id: 'k-10-12-17h',
    category: Category.KIDS,
    level: "Nivel Pro",
    ageRange: "10 a 12 años",
    time: '17:00 - 18:00',
    days: ['Lunes', 'Miércoles'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 5000
  },
  {
    id: 'k-10-12-18h',
    category: Category.KIDS,
    level: "Nivel Pro",
    ageRange: "10 a 12 años",
    time: '18:00 - 19:00',
    days: ['Lunes', 'Viernes'],
    instructor: '',
    capacity: 10,
    remainingSlots: 10,
    price: 5000
  },
  
  // --- CLASES PARA ADULTOS ---
  {
    id: 'a-ini-16h',
    category: Category.ADULTS,
    level: "Nivel Inicial",
    time: '16:00 - 17:00',
    days: ['Lunes', 'Miércoles', 'Martes', 'Jueves'],
    instructor: 'Staff Obras',
    capacity: 10,
    remainingSlots: 10,
    price: 5500
  },
  {
    id: 'a-int-19h',
    category: Category.ADULTS,
    level: "Nivel Medio",
    time: '19:00 - 20:00',
    days: ['Lunes', 'Miércoles'],
    instructor: 'Staff Obras',
    capacity: 10,
    remainingSlots: 10,
    price: 6000
  },
  {
    id: 'a-adv-20h',
    category: Category.ADULTS,
    level: "Nivel Pro",
    time: '20:00 - 21:00',
    days: ['Martes', 'Jueves'],
    instructor: 'Staff Obras',
    capacity: 10,
    remainingSlots: 10,
    price: 6500
  },

  // --- ACUAGYM ---
  {
    id: 'acu-1030',
    category: Category.ACUAGYM,
    level: "Acuagym",
    time: '10:30 - 11:30',
    days: ['Lunes', 'Viernes'],
    instructor: 'Staff Obras',
    capacity: 25,
    remainingSlots: 25,
    price: 4000
  },
  {
    id: 'acu-1000',
    category: Category.ACUAGYM,
    level: "Acuagym",
    time: '10:00 - 11:00',
    days: ['Martes', 'Jueves'],
    instructor: 'Staff Obras',
    capacity: 25,
    remainingSlots: 25,
    price: 4000
  }
];
