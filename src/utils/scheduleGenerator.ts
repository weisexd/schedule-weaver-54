// Алгоритм генерации расписания
import { 
  ScheduleItem, 
  GeneratedSchedule, 
  ScheduleGenerationParams,
  Teacher,
  Group,
  Subject
} from '../types/schedule';

export class ScheduleGenerator {
  private params: ScheduleGenerationParams;
  private schedule: ScheduleItem[] = [];
  private conflicts: string[] = [];
  private warnings: string[] = [];
  
  constructor(params: ScheduleGenerationParams) {
    this.params = params;
  }

  generate(): GeneratedSchedule {
    this.reset();
    
    try {
      this.validateInput();
      this.generateScheduleItems();
      this.balanceLoad();
      this.checkConflicts();
    } catch (error) {
      this.conflicts.push(`Ошибка генерации: ${error}`);
    }

    return {
      items: this.schedule,
      conflicts: this.conflicts,
      warnings: this.warnings
    };
  }

  private reset() {
    this.schedule = [];
    this.conflicts = [];
    this.warnings = [];
  }

  private validateInput() {
    // Проверка преподавателей
    if (this.params.teachers.length === 0) {
      throw new Error("Нет преподавателей");
    }

    // Проверка групп
    if (this.params.groups.length === 0) {
      throw new Error("Нет групп");
    }

    // Проверка предметов
    if (this.params.subjects.length === 0) {
      throw new Error("Нет предметов");
    }

    // Проверка временных слотов
    if (this.params.timeSlots.length === 0) {
      throw new Error("Нет временных слотов");
    }

    // Проверка корректности часов
    this.params.teachers.forEach(teacher => {
      if (teacher.weeklyHours <= 0) {
        throw new Error(`Некорректная нагрузка у преподавателя ${teacher.name}`);
      }
    });
  }

  private generateScheduleItems() {
    // Для каждой группы генерируем расписание
    this.params.groups.forEach(group => {
      this.generateForGroup(group);
    });
  }

  private generateForGroup(group: Group) {
    const groupSubjects = group.subjects;
    const usedSlots = new Set<string>(); // "день:слот"
    
    // Подсчитываем сколько пар нужно каждому предмету (примерно)
    const subjectsPerWeek = this.calculateSubjectsPerWeek(groupSubjects);
    
    for (const [subjectId, pairsCount] of Object.entries(subjectsPerWeek)) {
      const availableTeachers = this.getTeachersForSubject(subjectId);
      
      if (availableTeachers.length === 0) {
        this.warnings.push(`Нет преподавателя для предмета ${subjectId} в группе ${group.name}`);
        continue;
      }

      // Выбираем преподавателя с наименьшей нагрузкой
      const teacher = this.selectBestTeacher(availableTeachers);
      
      // Генерируем пары для этого предмета
      for (let i = 0; i < pairsCount; i++) {
        const slot = this.findAvailableSlot(group.id, teacher.id, usedSlots);
        
        if (slot) {
          const weekType = this.determineWeekType(i, pairsCount);
          
          this.schedule.push({
            teacherId: teacher.id,
            subjectId,
            groupId: group.id,
            day: slot.day,
            timeSlot: slot.timeSlot,
            weekType
          });

          usedSlots.add(`${slot.day}:${slot.timeSlot}`);
        } else {
          this.warnings.push(`Не удалось найти слот для ${subjectId} в группе ${group.name}`);
        }
      }
    }
  }

  private calculateSubjectsPerWeek(subjects: string[]): Record<string, number> {
    // Простая логика: базовые предметы чаще, остальные реже
    const important = ['math', 'physics', 'chemistry', 'history', 'literature', 'english'];
    const result: Record<string, number> = {};
    
    subjects.forEach(subject => {
      if (important.includes(subject)) {
        result[subject] = 3; // 3 пары в неделю для основных предметов
      } else {
        result[subject] = 2; // 2 пары для остальных
      }
    });
    
    return result;
  }

  private getTeachersForSubject(subjectId: string): Teacher[] {
    return this.params.teachers.filter(teacher => 
      teacher.subjects.includes(subjectId)
    );
  }

  private selectBestTeacher(teachers: Teacher[]): Teacher {
    // Выбираем преподавателя с наименьшей текущей нагрузкой
    const teacherLoads = teachers.map(teacher => ({
      teacher,
      currentLoad: this.getCurrentTeacherLoad(teacher.id)
    }));

    teacherLoads.sort((a, b) => a.currentLoad - b.currentLoad);
    return teacherLoads[0].teacher;
  }

  private getCurrentTeacherLoad(teacherId: string): number {
    return this.schedule.filter(item => item.teacherId === teacherId).length;
  }

  private findAvailableSlot(groupId: string, teacherId: string, usedSlots: Set<string>): { day: number, timeSlot: number } | null {
    // Приоритет 5-дневке, потом 6 дней
    const maxDays = this.params.preferFiveDays ? 5 : this.params.maxDaysPerWeek;
    
    // Балансированное распределение - сначала по одной паре в день
    for (let timeSlot = 0; timeSlot < this.params.timeSlots.length; timeSlot++) {
      for (let day = 0; day < maxDays; day++) {
        const slotKey = `${day}:${timeSlot}`;
        
        if (!usedSlots.has(slotKey) && 
            !this.hasConflict(groupId, teacherId, day, timeSlot)) {
          return { day, timeSlot };
        }
      }
    }

    // Если не хватило 5 дней, пробуем 6-й день
    if (this.params.preferFiveDays && maxDays < this.params.maxDaysPerWeek) {
      for (let timeSlot = 0; timeSlot < this.params.timeSlots.length; timeSlot++) {
        const day = 5; // суббота
        const slotKey = `${day}:${timeSlot}`;
        
        if (!usedSlots.has(slotKey) && 
            !this.hasConflict(groupId, teacherId, day, timeSlot)) {
          return { day, timeSlot };
        }
      }
    }

    return null;
  }

  private hasConflict(groupId: string, teacherId: string, day: number, timeSlot: number): boolean {
    return this.schedule.some(item => 
      (item.groupId === groupId || item.teacherId === teacherId) &&
      item.day === day && 
      item.timeSlot === timeSlot
    );
  }

  private determineWeekType(pairIndex: number, totalPairs: number): 'upper' | 'lower' | 'both' {
    // Если пар много - ставим на обе недели
    // Если мало - чередуем верхнюю/нижнюю
    if (totalPairs >= 3) {
      return 'both';
    } else if (pairIndex % 2 === 0) {
      return 'upper';
    } else {
      return 'lower';
    }
  }

  private balanceLoad() {
    if (!this.params.balanceLoad) return;

    // Проверяем нагрузку преподавателей
    this.params.teachers.forEach(teacher => {
      const currentLoad = this.getCurrentTeacherLoad(teacher.id);
      if (currentLoad > teacher.weeklyHours) {
        this.warnings.push(`Превышена нагрузка преподавателя ${teacher.name}: ${currentLoad}/${teacher.weeklyHours}`);
      }
    });
  }

  private checkConflicts() {
    // Проверяем конфликты расписания
    const conflicts = new Map<string, ScheduleItem[]>();

    this.schedule.forEach(item => {
      const key = `${item.day}:${item.timeSlot}`;
      
      if (!conflicts.has(key)) {
        conflicts.set(key, []);
      }
      conflicts.get(key)!.push(item);
    });

    conflicts.forEach((items, timeKey) => {
      // Проверяем конфликты преподавателей
      const teacherGroups = new Map<string, string[]>();
      
      items.forEach(item => {
        if (!teacherGroups.has(item.teacherId)) {
          teacherGroups.set(item.teacherId, []);
        }
        teacherGroups.get(item.teacherId)!.push(item.groupId);
      });

      teacherGroups.forEach((groups, teacherId) => {
        if (groups.length > 1) {
          const teacher = this.params.teachers.find(t => t.id === teacherId);
          this.conflicts.push(`Конфликт преподавателя ${teacher?.name} в ${timeKey}: группы ${groups.join(', ')}`);
        }
      });
    });
  }
}