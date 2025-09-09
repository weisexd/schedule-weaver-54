import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleGenerator as Generator } from '@/utils/scheduleGenerator';
import { GeneratedSchedule, Teacher, Subject, Group } from '@/types/schedule';
import { TIME_SLOTS, WEEKDAYS } from '@/data/scheduleData';
import TeacherInput from './DataInput/TeacherInput';
import SubjectInput from './DataInput/SubjectInput';
import GroupInput from './DataInput/GroupInput';

export default function ScheduleGenerator() {
  // Пользовательские данные
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  // Состояние генерации
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    maxDaysPerWeek: 6,
    balanceLoad: true,
    preferFiveDays: true,
  });

  // Валидация данных перед генерацией
  const validateData = (): boolean => {
    if (subjects.length === 0) {
      alert('Добавьте хотя бы один предмет');
      return false;
    }
    
    if (teachers.length === 0) {
      alert('Добавьте хотя бы одного преподавателя');
      return false;
    }
    
    if (groups.length === 0) {
      alert('Добавьте хотя бы одну группу');
      return false;
    }
    
    // Проверяем, что у всех преподавателей есть предметы
    const teachersWithoutSubjects = teachers.filter(t => t.subjects.length === 0);
    if (teachersWithoutSubjects.length > 0) {
      alert(`У преподавателей нет предметов: ${teachersWithoutSubjects.map(t => t.name).join(', ')}`);
      return false;
    }
    
    // Проверяем, что у всех групп есть предметы
    const groupsWithoutSubjects = groups.filter(g => g.subjects.length === 0);
    if (groupsWithoutSubjects.length > 0) {
      alert(`У групп нет предметов: ${groupsWithoutSubjects.map(g => g.name).join(', ')}`);
      return false;
    }
    
    return true;
  };

  // Генерация расписания
  const generateSchedule = () => {
    if (!validateData()) return;
    
    setIsGenerating(true);
    
    try {
      const generator = new Generator({
        groups: groups,
        teachers: teachers,
        subjects: subjects,
        timeSlots: TIME_SLOTS,
        maxDaysPerWeek: settings.maxDaysPerWeek,
        balanceLoad: settings.balanceLoad,
        preferFiveDays: settings.preferFiveDays,
      });

      const result = generator.generate();
      setGeneratedSchedule(result);
    } catch (error) {
      console.error('Ошибка генерации расписания:', error);
      alert('Ошибка при генерации расписания. Проверьте данные.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Получить название предмета
  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.shortName || id;
  };

  // Получить имя преподавателя
  const getTeacherName = (id: string) => {
    return teachers.find(t => t.id === id)?.name || id;
  };

  // Получить название группы
  const getGroupName = (id: string) => {
    return groups.find(g => g.id === id)?.name || id;
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
        <CardContent>
          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjects">Предметы</TabsTrigger>
              <TabsTrigger value="teachers">Преподаватели</TabsTrigger>
              <TabsTrigger value="groups">Группы</TabsTrigger>
              <TabsTrigger value="generate">Генерация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subjects" className="mt-6">
              <SubjectInput 
                subjects={subjects}
                onSubjectsChange={setSubjects}
              />
            </TabsContent>
            
            <TabsContent value="teachers" className="mt-6">
              <TeacherInput 
                teachers={teachers}
                onTeachersChange={setTeachers}
                availableSubjects={subjects}
              />
            </TabsContent>
            
            <TabsContent value="groups" className="mt-6">
              <GroupInput 
                groups={groups}
                onGroupsChange={setGroups}
                availableSubjects={subjects}
              />
            </TabsContent>
            
            <TabsContent value="generate" className="mt-6 space-y-6">
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
                    <select 
                      value={settings.maxDaysPerWeek}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          maxDaysPerWeek: parseInt(e.target.value)
                        }))
                      }
                      className="p-2 border rounded"
                    >
                      <option value={5}>5 дней</option>
                      <option value={6}>6 дней</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Кнопка генерации */}
              <Button 
                onClick={generateSchedule} 
                disabled={isGenerating || subjects.length === 0 || teachers.length === 0 || groups.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? 'Генерируем...' : 'Сгенерировать расписание'}
              </Button>
              
              {(subjects.length === 0 || teachers.length === 0 || groups.length === 0) && (
                <p className="text-center text-muted-foreground text-sm">
                  Для генерации необходимо добавить предметы, преподавателей и группы
                </p>
              )}
            </TabsContent>
          </Tabs>
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
            {groups.map(group => renderGroupSchedule(group.id))}
          </div>
        </>
      )}
    </div>
  );
}