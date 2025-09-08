// Статические данные для генератора расписания
import { TimeSlot, Subject, Teacher, Group } from '../types/schedule';

// Временные слоты (6 пар по 1.5 часа)
export const TIME_SLOTS: TimeSlot[] = [
  { id: 1, startTime: "08:30", endTime: "10:00", duration: 90 },
  { id: 2, startTime: "10:15", endTime: "11:45", duration: 90 },
  { id: 3, startTime: "12:00", endTime: "13:30", duration: 90 },
  { id: 4, startTime: "14:15", endTime: "15:45", duration: 90 },
  { id: 5, startTime: "16:00", endTime: "17:30", duration: 90 },
  { id: 6, startTime: "17:45", endTime: "19:15", duration: 90 },
];

// Предметы
export const SUBJECTS: Subject[] = [
  { id: "math", name: "Математика", shortName: "Мат" },
  { id: "physics", name: "Физика", shortName: "Физ" },
  { id: "chemistry", name: "Химия", shortName: "Хим" },
  { id: "biology", name: "Биология", shortName: "Био" },
  { id: "history", name: "История", shortName: "Ист" },
  { id: "literature", name: "Литература", shortName: "Лит" },
  { id: "english", name: "Английский язык", shortName: "Англ" },
  { id: "geometry", name: "Геометрия", shortName: "Геом" },
  { id: "informatics", name: "Информатика", shortName: "Инф" },
  { id: "pe", name: "Физическая культура", shortName: "ФК" },
];

// Преподаватели
export const TEACHERS: Teacher[] = [
  {
    id: "ivanov",
    name: "Иванов И.И.",
    subjects: ["math", "geometry", "physics"],
    weeklyHours: 18,
  },
  {
    id: "petrov",
    name: "Петров П.П.",
    subjects: ["chemistry", "biology"],
    weeklyHours: 16,
  },
  {
    id: "sidorov",
    name: "Сидоров С.С.",
    subjects: ["history", "literature"],
    weeklyHours: 20,
  },
  {
    id: "kozlov",
    name: "Козлов К.К.",
    subjects: ["english"],
    weeklyHours: 24,
  },
  {
    id: "smirnov",
    name: "Смирнов А.А.",
    subjects: ["informatics"],
    weeklyHours: 14,
  },
  {
    id: "volkov",
    name: "Волков В.В.",
    subjects: ["pe"],
    weeklyHours: 22,
  },
];

// Группы
export const GROUPS: Group[] = [
  {
    id: "10a",
    name: "10-А",
    subjects: ["math", "physics", "chemistry", "biology", "history", "literature", "english", "geometry", "informatics", "pe"],
  },
  {
    id: "10b",
    name: "10-Б",
    subjects: ["math", "physics", "chemistry", "history", "literature", "english", "geometry", "informatics", "pe"],
  },
  {
    id: "11a",
    name: "11-А",
    subjects: ["math", "physics", "chemistry", "biology", "history", "english", "geometry", "informatics"],
  },
  {
    id: "11b",
    name: "11-Б",
    subjects: ["math", "chemistry", "biology", "history", "literature", "english", "geometry", "pe"],
  },
];

// Дни недели
export const WEEKDAYS = [
  "Понедельник",
  "Вторник", 
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота"
];

// Настройки по умолчанию
export const DEFAULT_SETTINGS = {
  maxDaysPerWeek: 6,
  maxPairsPerDay: 6,
  balanceLoad: true,
  preferFiveDays: true, // приоритет 5-дневке
};