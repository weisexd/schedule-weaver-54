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

export interface TeacherSubject {
  subjectId: string;
  hours: number; // количество часов (1 пара = 2 часа)
}

export interface TeacherGroup {
  groupId: string;
  subjects: TeacherSubject[];
}

export interface Teacher {
  id: string;
  name: string;
  groups: TeacherGroup[]; // группы и предметы которые ведет преподаватель
}

export interface Group {
  id: string;
  name: string;
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