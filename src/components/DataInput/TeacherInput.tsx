import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';
import { Teacher } from '@/types/schedule';

interface TeacherInputProps {
  teachers: Teacher[];
  onTeachersChange: (teachers: Teacher[]) => void;
  availableSubjects: { id: string; name: string; shortName: string }[];
}

export default function TeacherInput({ teachers, onTeachersChange, availableSubjects }: TeacherInputProps) {
  const [editingTeacher, setEditingTeacher] = useState<{ id: string; name: string; subjects: string[]; weeklyHours: number } | null>(null);

  // Добавление нового преподавателя
  const addTeacher = () => {
    setEditingTeacher({
      id: `teacher_${Date.now()}`,
      name: '',
      subjects: [],
      weeklyHours: 18
    });
  };

  // Сохранение преподавателя
  const saveTeacher = () => {
    if (!editingTeacher) return;
    
    // Валидация
    if (!editingTeacher.name.trim()) {
      alert('Введите имя преподавателя');
      return;
    }
    
    if (editingTeacher.subjects.length === 0) {
      alert('Добавьте хотя бы один предмет');
      return;
    }
    
    if (editingTeacher.weeklyHours <= 0 || editingTeacher.weeklyHours > 50) {
      alert('Часы должны быть от 1 до 50');
      return;
    }

    const existingIndex = teachers.findIndex(t => t.id === editingTeacher.id);
    if (existingIndex >= 0) {
      // Обновляем существующего
      const updatedTeachers = [...teachers];
      updatedTeachers[existingIndex] = editingTeacher;
      onTeachersChange(updatedTeachers);
    } else {
      // Добавляем нового
      onTeachersChange([...teachers, editingTeacher]);
    }
    
    setEditingTeacher(null);
  };

  // Удаление преподавателя
  const deleteTeacher = (id: string) => {
    if (confirm('Удалить преподавателя?')) {
      onTeachersChange(teachers.filter(t => t.id !== id));
    }
  };

  // Редактирование преподавателя
  const editTeacher = (teacher: Teacher) => {
    setEditingTeacher({ ...teacher });
  };

  // Добавление предмета к преподавателю
  const addSubjectToTeacher = (subjectId: string) => {
    if (!editingTeacher) return;
    
    if (!editingTeacher.subjects.includes(subjectId)) {
      setEditingTeacher({
        ...editingTeacher,
        subjects: [...editingTeacher.subjects, subjectId]
      });
    }
  };

  // Удаление предмета у преподавателя
  const removeSubjectFromTeacher = (subjectId: string) => {
    if (!editingTeacher) return;
    
    setEditingTeacher({
      ...editingTeacher,
      subjects: editingTeacher.subjects.filter(s => s !== subjectId)
    });
  };

  const getSubjectName = (id: string) => {
    return availableSubjects.find(s => s.id === id)?.shortName || id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Преподаватели
          <Button onClick={addTeacher} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список преподавателей */}
        {teachers.map(teacher => (
          <div key={teacher.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{teacher.name}</h4>
              <div className="flex gap-2">
                <Button onClick={() => editTeacher(teacher)} size="sm" variant="outline">
                  Редактировать
                </Button>
                <Button onClick={() => deleteTeacher(teacher.id)} size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {teacher.subjects.map(subjectId => (
                <Badge key={subjectId} variant="secondary">
                  {getSubjectName(subjectId)}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Нагрузка: {teacher.weeklyHours} пар/неделю
            </p>
          </div>
        ))}

        {/* Форма редактирования */}
        {editingTeacher && (
          <div className="p-4 border-2 border-primary rounded-lg bg-muted/10">
            <h4 className="font-semibold mb-4">
              {teachers.find(t => t.id === editingTeacher.id) ? 'Редактирование' : 'Новый'} преподаватель
            </h4>
            
            <div className="space-y-4">
              {/* Имя */}
              <div>
                <Label>Имя преподавателя *</Label>
                <Input
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
                  placeholder="Введите ФИО"
                />
              </div>

              {/* Предметы */}
              <div>
                <Label className="flex items-center gap-2">
                  Предметы *
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        addSubjectToTeacher(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="ml-auto text-xs p-1 border rounded"
                  >
                    <option value="">+ Добавить предмет</option>
                    {availableSubjects
                      .filter(s => !editingTeacher.subjects.includes(s.id))
                      .map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    }
                  </select>
                </Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {editingTeacher.subjects.map(subjectId => (
                    <Badge key={subjectId} variant="secondary" className="cursor-pointer">
                      {getSubjectName(subjectId)}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeSubjectFromTeacher(subjectId)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Часы */}
              <div>
                <Label>Недельная нагрузка (пары) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={editingTeacher.weeklyHours}
                  onChange={(e) => setEditingTeacher({
                    ...editingTeacher, 
                    weeklyHours: parseInt(e.target.value) || 0
                  })}
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-2">
                <Button onClick={saveTeacher}>Сохранить</Button>
                <Button onClick={() => setEditingTeacher(null)} variant="outline">
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {teachers.length === 0 && !editingTeacher && (
          <p className="text-center text-muted-foreground py-8">
            Нет преподавателей. Добавьте первого преподавателя.
          </p>
        )}
      </CardContent>
    </Card>
  );
}