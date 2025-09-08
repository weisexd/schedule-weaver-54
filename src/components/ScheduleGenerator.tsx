import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScheduleGenerator as Generator } from '@/utils/scheduleGenerator';
import { GeneratedSchedule, Teacher } from '@/types/schedule';
import { TIME_SLOTS, SUBJECTS, TEACHERS, GROUPS, WEEKDAYS } from '@/data/scheduleData';

export default function ScheduleGenerator() {
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    maxDaysPerWeek: 6,
    balanceLoad: true,
    preferFiveDays: true,
  });

  // Обновление часов преподавателя
  const updateTeacherHours = (teacherId: string, hours: number) => {
    if (hours < 0 || hours > 50) return; // валидация
    
    setTeachers(prev => prev.map(teacher => 
      teacher.id === teacherId 
        ? { ...teacher, weeklyHours: hours }
        : teacher
    ));
  };

  // Генерация расписания
  const generateSchedule = () => {
    setIsGenerating(true);
    
    try {
      const generator = new Generator({
        groups: GROUPS,
        teachers: teachers,
        subjects: SUBJECTS,
        timeSlots: TIME_SLOTS,
        maxDaysPerWeek: settings.maxDaysPerWeek,
        balanceLoad: settings.balanceLoad,
        preferFiveDays: settings.preferFiveDays,
      });

      const result = generator.generate();
      setGeneratedSchedule(result);
    } catch (error) {
      console.error('Ошибка генерации расписания:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Получить название предмета
  const getSubjectName = (id: string) => {
    return SUBJECTS.find(s => s.id === id)?.shortName || id;
  };

  // Получить имя преподавателя
  const getTeacherName = (id: string) => {
    return teachers.find(t => t.id === id)?.name || id;
  };

  // Получить название группы
  const getGroupName = (id: string) => {
    return GROUPS.find(g => g.id === id)?.name || id;
  };

  // Рендер расписания для группы
  const renderGroupSchedule = (groupId: string) => {
    if (!generatedSchedule) return null;
    
    const groupItems = generatedSchedule.items.filter(item => item.groupId === groupId);
    const groupName = getGroupName(groupId);

    return (
      <Card key={groupId} className="mb-6">
        <CardHeader>
          <CardTitle>Расписание группы {groupName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-sm">
            {/* Заголовки */}
            <div className="font-semibold p-2">Время</div>
            {WEEKDAYS.slice(0, settings.maxDaysPerWeek).map((day, index) => (
              <div key={index} className="font-semibold p-2 text-center">{day}</div>
            ))}

            {/* Временные слоты */}
            {TIME_SLOTS.map((timeSlot, slotIndex) => (
              <React.Fragment key={slotIndex}>
                <div className="p-2 border rounded bg-muted">
                  <div className="font-medium">{timeSlot.startTime}</div>
                  <div className="text-xs text-muted-foreground">{timeSlot.endTime}</div>
                </div>
                
                {Array.from({ length: settings.maxDaysPerWeek }, (_, dayIndex) => {
                  const items = groupItems.filter(item => 
                    item.day === dayIndex && item.timeSlot === slotIndex
                  );
                  
                  return (
                    <div key={dayIndex} className="p-2 border rounded min-h-16">
                      {items.map((item, itemIndex) => (
                        <div key={itemIndex} className="mb-1">
                          <Badge variant="outline" className="text-xs mb-1">
                            {getSubjectName(item.subjectId)}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {getTeacherName(item.teacherId)}
                          </div>
                          <div className="text-xs">
                            {item.weekType === 'upper' ? 'В' : 
                             item.weekType === 'lower' ? 'Н' : 'В/Н'}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Генератор расписания</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Настройки преподавателей */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Часы нагрузки преподавателей</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map(teacher => (
                <div key={teacher.id} className="flex items-center space-x-3">
                  <Label className="w-48 text-sm">{teacher.name}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={teacher.weeklyHours}
                    onChange={(e) => updateTeacherHours(teacher.id, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">пар/неделю</span>
                </div>
              ))}
            </div>
          </div>

          {/* Настройки генерации */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Настройки генерации</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.preferFiveDays}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, preferFiveDays: checked }))
                  }
                />
                <Label>Приоритет 5-дневке</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.balanceLoad}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, balanceLoad: checked }))
                  }
                />
                <Label>Балансировать нагрузку</Label>
              </div>

              <div className="flex items-center space-x-3">
                <Label>Макс. дней в неделе:</Label>
                <Input
                  type="number"
                  min="5"
                  max="6"
                  value={settings.maxDaysPerWeek}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      maxDaysPerWeek: Math.min(6, Math.max(5, parseInt(e.target.value) || 5))
                    }))
                  }
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* Кнопка генерации */}
          <Button 
            onClick={generateSchedule} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Генерируем...' : 'Сгенерировать расписание'}
          </Button>
        </CardContent>
      </Card>

      {/* Результаты генерации */}
      {generatedSchedule && (
        <>
          {/* Ошибки и предупреждения */}
          {generatedSchedule.conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Конфликты:</strong>
                <ul className="mt-2 space-y-1">
                  {generatedSchedule.conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {generatedSchedule.warnings.length > 0 && (
            <Alert>
              <AlertDescription>
                <strong>Предупреждения:</strong>
                <ul className="mt-2 space-y-1">
                  {generatedSchedule.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Расписания групп */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Сгенерированное расписание</h2>
            {GROUPS.map(group => renderGroupSchedule(group.id))}
          </div>
        </>
      )}
    </div>
  );
}