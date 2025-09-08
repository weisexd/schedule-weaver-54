// Типы данных для генератора расписания

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  duration: number; // в минутах
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[]; // массив ID предметов, которые может вести
  weeklyHours: number; // максимальное количество пар в неделю
}

export interface Group {
  id: string;
  name: string;
  subjects: string[]; // массив ID предметов для группы
}

export interface ScheduleItem {
  teacherId: string;
  subjectId: string;
  groupId: string;
  day: number; // 0-5 (пн-сб)
  timeSlot: number; // индекс временного слота
  weekType: 'upper' | 'lower' | 'both'; // верхняя/нижняя/обе недели
}

export interface GeneratedSchedule {
  items: ScheduleItem[];
  conflicts: string[];
  warnings: string[];
}

export interface ScheduleGenerationParams {
  groups: Group[];
  teachers: Teacher[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  maxDaysPerWeek: number;
  balanceLoad: boolean;
  preferFiveDays: boolean;
}