import { DayOfWeek, ExperienceLevel, SwimClass, Teacher, ActivityType, ClassType, TargetAudience } from "./types";

export const TEACHERS: Record<string, Teacher> = {
  'seb': { id: 'seb', name: 'Sebastián Nieto', specialty: 'Niños 4-5 años', photoUrl: 'https://picsum.photos/seed/sebastian/100/100' },
  'abril_g': { id: 'abril_g', name: 'Abril Gargano', specialty: 'Niños 6-7 años', photoUrl: 'https://picsum.photos/seed/abrilg/100/100' },
  'lujan': { id: 'lujan', name: 'Lujan Herrera', specialty: 'Niños 8-10 años', photoUrl: 'https://picsum.photos/seed/lujan/100/100' },
  'agostina': { id: 'agostina', name: 'Agostina Brizuela', specialty: 'Niños 11-12 y Adultos', photoUrl: 'https://picsum.photos/seed/agostina/100/100' },
  'abril_s': { id: 'abril_s', name: 'Abril Sanchez', specialty: 'Adultos Avanzados', photoUrl: 'https://picsum.photos/seed/abrils/100/100' },
  'generic': { id: 'generic', name: 'Staff Obras', specialty: 'Entrenador de Turno', photoUrl: 'https://picsum.photos/seed/staff/100/100' },
};

const generateSchedule = (): SwimClass[] => {
  const schedule: SwimClass[] = [];
  let idCounter = 1;

  const days = Object.values(DayOfWeek);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20

  days.forEach(day => {
    hours.forEach(hour => {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

      // --- 1. CLASES PARTICULARES (Private) ---
      // Lunes-Viernes: 8-16 | Sábados: 9-15
      let isPrivateTime = false;
      if (day !== DayOfWeek.SATURDAY) {
        if (hour >= 8 && hour <= 15) isPrivateTime = true; // Ends at 16:00
      } else {
        if (hour >= 9 && hour <= 14) isPrivateTime = true; // Ends at 15:00
      }

      if (isPrivateTime) {
        schedule.push({
          id: `priv-${idCounter++}`,
          day,
          time: timeStr,
          teacherId: 'generic', // Generic for private unless specified
          level: ExperienceLevel.BEGINNER,
          totalSlots: 1, 
          bookedSlots: Math.random() > 0.8 ? 1 : 0,
          price: 150000,
          activityType: ActivityType.SWIMMING,
          classType: ClassType.PRIVATE,
          targetAudience: TargetAudience.ALL
        });
      }

      // --- 2. CLASES GRUPALES (Group) - Lunes a Viernes ---
      if (day !== DayOfWeek.SATURDAY) {

        // --- AQUAGYM ---
        // Martes y Jueves: 09:00 y 10:00 | Cupo 18
        const isAquaDay = day === DayOfWeek.TUESDAY || day === DayOfWeek.THURSDAY;
        if (isAquaDay && (hour === 9 || hour === 10)) {
           schedule.push({
            id: `aquagym-${idCounter++}`,
            day, time: timeStr, teacherId: 'generic', 
            level: ExperienceLevel.BEGINNER, 
            totalSlots: 18, 
            bookedSlots: Math.floor(Math.random() * 5),
            price: 65000, 
            activityType: ActivityType.AQUAGYM, 
            classType: ClassType.GROUP,
            targetAudience: TargetAudience.ADULTS
          });
        }
        
        // --- NIÑOS (4-12 años) ---
        
        // A) Horario: 17:00 a 19:00 (Implies slots 17:00 and 18:00)
        // EXCEPCIÓN: Martes y Viernes a las 17hs NO hay clases de niños.
        if (hour === 17 || hour === 18) {
          const isTueFri = day === DayOfWeek.TUESDAY || day === DayOfWeek.FRIDAY;
          
          if (!(isTueFri && hour === 17)) {
              // Grupo 4-5 años: Sebastián Nieto
              schedule.push({
                id: `kid-4-5-${idCounter++}`,
                day, time: timeStr, teacherId: 'seb',
                level: ExperienceLevel.BEGINNER, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.KIDS, minAge: 4, maxAge: 5
              });

              // Grupo 6-7 años: Abril Gargano
              schedule.push({
                id: `kid-6-7-${idCounter++}`,
                day, time: timeStr, teacherId: 'abril_g',
                level: ExperienceLevel.BEGINNER, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.KIDS, minAge: 6, maxAge: 7
              });

              // Grupo 8-10 años: Lujan Herrera
              schedule.push({
                id: `kid-8-10-${idCounter++}`,
                day, time: timeStr, teacherId: 'lujan',
                level: ExperienceLevel.INTERMEDIATE, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.KIDS, minAge: 8, maxAge: 10
              });

              // Grupo 11-12 años: Agostina Brizuela
              schedule.push({
                id: `kid-11-12-${idCounter++}`,
                day, time: timeStr, teacherId: 'agostina',
                level: ExperienceLevel.ADVANCED, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.KIDS, minAge: 11, maxAge: 12
              });
          }
        }

        // B) Horario: 19:00 - Martes y Jueves (Específico)
        if (hour === 19 && (day === DayOfWeek.TUESDAY || day === DayOfWeek.THURSDAY)) {
            // Grupo 6-7 años: Sebastián Nieto
            schedule.push({
              id: `kid-6-7-19-${idCounter++}`,
              day, time: timeStr, teacherId: 'seb', // Explicitly Sebastian for this slot
              level: ExperienceLevel.BEGINNER, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
              price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
              targetAudience: TargetAudience.KIDS, minAge: 6, maxAge: 7
            });

            // Grupo 8-10 años: Lujan Herrera
            schedule.push({
              id: `kid-8-10-19-${idCounter++}`,
              day, time: timeStr, teacherId: 'lujan',
              level: ExperienceLevel.INTERMEDIATE, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
              price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
              targetAudience: TargetAudience.KIDS, minAge: 8, maxAge: 10
            });

            // Grupo 11-12 años: Agostina Brizuela
            schedule.push({
              id: `kid-11-12-19-${idCounter++}`,
              day, time: timeStr, teacherId: 'agostina',
              level: ExperienceLevel.ADVANCED, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
              price: 60000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
              targetAudience: TargetAudience.KIDS, minAge: 11, maxAge: 12
            });
        }

        // --- ADULTOS (Natación) ---
        // Horarios: 16:00, 19:00, 20:00
        if (hour === 16 || hour === 19 || hour === 20) {
          
          // >>> 1. NIVEL INICIAL (Agostina Brizuela) - 16:00 HS
          // "Los días lunes y miércoles a las 16 horas y martes y viernes a las 16 horas."
          if (hour === 16) {
             const isMonWed = day === DayOfWeek.MONDAY || day === DayOfWeek.WEDNESDAY;
             const isTueFri = day === DayOfWeek.TUESDAY || day === DayOfWeek.FRIDAY;
             
             if (isMonWed || isTueFri) {
                schedule.push({
                    id: `adult-beg-${idCounter++}`,
                    day, time: timeStr, teacherId: 'agostina',
                    level: ExperienceLevel.BEGINNER, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                    price: 70000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                    targetAudience: TargetAudience.ADULTS
                });
             }
          }

          // >>> 2. NIVEL INTERMEDIO (Agostina Brizuela)
          // Lunes y Miércoles 19:00
          if (hour === 19 && (day === DayOfWeek.MONDAY || day === DayOfWeek.WEDNESDAY)) {
             schedule.push({
                id: `adult-int-19-${idCounter++}`,
                day, time: timeStr, teacherId: 'agostina',
                level: ExperienceLevel.INTERMEDIATE, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 70000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.ADULTS
             });
          }
          // "Los martes y jueves a las 20 horas solo se dictan clases nivel intermedio con la profesora Agostina Brisuela"
          if (hour === 20 && (day === DayOfWeek.TUESDAY || day === DayOfWeek.THURSDAY)) {
             schedule.push({
                id: `adult-int-20-${idCounter++}`,
                day, time: timeStr, teacherId: 'agostina',
                level: ExperienceLevel.INTERMEDIATE, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 70000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.ADULTS
             });
          }

          // >>> 3. NIVEL AVANZADO (Abril Sanchez)
          // "Los días lunes y miércoles 20 horas solo se dictan clases adultos nivel avanzado."
          if (hour === 20 && (day === DayOfWeek.MONDAY || day === DayOfWeek.WEDNESDAY)) {
             schedule.push({
                id: `adult-adv-${idCounter++}`,
                day, time: timeStr, teacherId: 'abril_s',
                level: ExperienceLevel.ADVANCED, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 70000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.ADULTS
             });
          }
          // "Las días martes y jueves a las 20 solo se dictan clases adultos nivel avanzado."
          // Coexiste con Intermedio en este horario.
          if (hour === 20 && (day === DayOfWeek.TUESDAY || day === DayOfWeek.THURSDAY)) {
             schedule.push({
                id: `adult-adv-${idCounter++}`,
                day, time: timeStr, teacherId: 'abril_s',
                level: ExperienceLevel.ADVANCED, totalSlots: 10, bookedSlots: Math.floor(Math.random() * 8),
                price: 70000, activityType: ActivityType.SWIMMING, classType: ClassType.GROUP,
                targetAudience: TargetAudience.ADULTS
             });
          }
        }
      }
    });
  });

  return schedule;
};

export const MOCK_SCHEDULE = generateSchedule();