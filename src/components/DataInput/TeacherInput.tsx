import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Info } from 'lucide-react';
import { Teacher, TeacherGroup, TeacherSubject } from '@/types/schedule';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeacherInputProps {
  teachers: Teacher[];
  onTeachersChange: (teachers: Teacher[]) => void;
  availableSubjects: { id: string; name: string; shortName: string }[];
  availableGroups: { id: string; name: string }[];
}

const TeacherInput: React.FC<TeacherInputProps> = ({
  teachers,
  onTeachersChange,
  availableSubjects,
  availableGroups
}) => {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState({ subjectId: '', hours: '' });

  // Добавление нового преподавателя
  const addTeacher = () => {
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: '',
      groups: []
    };
    setEditingTeacher(newTeacher);
  };

  // Сохранение преподавателя
  const saveTeacher = () => {
    if (!editingTeacher || !editingTeacher.name.trim()) {
      alert('Введите имя преподавателя');
      return;
    }

    // Проверяем, что у преподавателя есть хотя бы одна группа с предметами
    if (editingTeacher.groups.length === 0) {
      alert('Добавьте хотя бы одну группу с предметами');
      return;
    }

    // Проверяем, что все группы имеют предметы
    for (const group of editingTeacher.groups) {
      if (group.subjects.length === 0) {
        alert('Все группы должны иметь хотя бы один предмет');
        return;
      }
    }

    const existingIndex = teachers.findIndex(t => t.id === editingTeacher.id);
    let updatedTeachers;
    
    if (existingIndex >= 0) {
      updatedTeachers = [...teachers];
      updatedTeachers[existingIndex] = editingTeacher;
    } else {
      updatedTeachers = [...teachers, editingTeacher];
    }
    
    onTeachersChange(updatedTeachers);
    setEditingTeacher(null);
    setEditingGroupIndex(null);
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
    setEditingGroupIndex(null);
  };

  // Добавление группы к преподавателю
  const addGroupToTeacher = () => {
    if (!editingTeacher) return;
    
    const newGroup: TeacherGroup = {
      groupId: '',
      subjects: []
    };
    
    setEditingTeacher({
      ...editingTeacher,
      groups: [...editingTeacher.groups, newGroup]
    });
    setEditingGroupIndex(editingTeacher.groups.length);
  };

  // Удаление группы у преподавателя
  const removeGroupFromTeacher = (groupIndex: number) => {
    if (!editingTeacher) return;
    
    if (confirm('Удалить группу и все её предметы?')) {
      const updatedGroups = editingTeacher.groups.filter((_, index) => index !== groupIndex);
      setEditingTeacher({
        ...editingTeacher,
        groups: updatedGroups
      });
      
      if (editingGroupIndex === groupIndex) {
        setEditingGroupIndex(null);
      }
    }
  };

  // Обновление группы у преподавателя
  const updateTeacherGroup = (groupIndex: number, groupId: string) => {
    if (!editingTeacher) return;
    
    const updatedGroups = [...editingTeacher.groups];
    updatedGroups[groupIndex] = {
      ...updatedGroups[groupIndex],
      groupId
    };
    
    setEditingTeacher({
      ...editingTeacher,
      groups: updatedGroups
    });
  };

  // Добавление предмета к группе
  const addSubjectToGroup = (groupIndex: number) => {
    if (!editingTeacher || !newSubject.subjectId || !newSubject.hours) {
      alert('Выберите предмет и введите количество часов');
      return;
    }

    const hours = parseInt(newSubject.hours);
    if (isNaN(hours) || hours <= 0 || hours % 2 !== 0) {
      alert('Количество часов должно быть положительным четным числом (1 пара = 2 часа)');
      return;
    }

    const updatedGroups = [...editingTeacher.groups];
    const existingSubject = updatedGroups[groupIndex].subjects.find(s => s.subjectId === newSubject.subjectId);
    
    if (existingSubject) {
      alert('Этот предмет уже добавлен в группу');
      return;
    }

    updatedGroups[groupIndex].subjects.push({
      subjectId: newSubject.subjectId,
      hours: hours
    });
    
    setEditingTeacher({
      ...editingTeacher,
      groups: updatedGroups
    });
    
    setNewSubject({ subjectId: '', hours: '' });
  };

  // Удаление предмета из группы
  const removeSubjectFromGroup = (groupIndex: number, subjectIndex: number) => {
    if (!editingTeacher) return;
    
    const updatedGroups = [...editingTeacher.groups];
    updatedGroups[groupIndex].subjects = updatedGroups[groupIndex].subjects.filter(
      (_, index) => index !== subjectIndex
    );
    
    setEditingTeacher({
      ...editingTeacher,
      groups: updatedGroups
    });
  };

  // Получение названия предмета
  const getSubjectName = (subjectId: string) => {
    const subject = availableSubjects.find(s => s.id === subjectId);
    return subject ? subject.shortName : 'Неизвестный предмет';
  };

  // Получение названия группы
  const getGroupName = (groupId: string) => {
    const group = availableGroups.find(g => g.id === groupId);
    return group ? group.name : 'Неизвестная группа';
  };

  // Подсчет общих часов преподавателя
  const getTotalTeacherHours = (teacher: Teacher) => {
    return teacher.groups.reduce((total, group) => {
      return total + group.subjects.reduce((groupTotal, subject) => groupTotal + subject.hours, 0);
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Преподаватели
          <Button onClick={addTeacher} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Добавить преподавателя
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Важно: 1 занятие = 2 часа. Вводите количество часов кратное 2.
          </AlertDescription>
        </Alert>

        {/* Список преподавателей */}
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{teacher.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Общая нагрузка: {getTotalTeacherHours(teacher)} часов ({getTotalTeacherHours(teacher) / 2} пар)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => editTeacher(teacher)} size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => deleteTeacher(teacher.id)} size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Группы преподавателя */}
              <div className="space-y-2">
                {teacher.groups.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-muted p-2 rounded">
                    <p className="font-medium text-sm mb-1">
                      Группа: {getGroupName(group.groupId)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.subjects.map((subject, subjectIndex) => (
                        <Badge key={subjectIndex} variant="secondary">
                          {getSubjectName(subject.subjectId)} ({subject.hours}ч)
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Форма редактирования преподавателя */}
        {editingTeacher && (
          <div className="border rounded p-4 bg-muted">
            <h4 className="font-medium mb-3">
              {teachers.find(t => t.id === editingTeacher.id) ? 'Редактировать' : 'Добавить'} преподавателя
            </h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="teacher-name">Имя преподавателя *</Label>
                <Input
                  id="teacher-name"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({
                    ...editingTeacher,
                    name: e.target.value
                  })}
                  placeholder="Введите имя преподавателя"
                />
              </div>

              {/* Группы преподавателя */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Группы и предметы</Label>
                  <Button onClick={addGroupToTeacher} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить группу
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingTeacher.groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border rounded p-3 bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 mr-2">
                          <Select
                            value={group.groupId}
                            onValueChange={(value) => updateTeacherGroup(groupIndex, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите группу" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableGroups.map((availableGroup) => (
                                <SelectItem key={availableGroup.id} value={availableGroup.id}>
                                  {availableGroup.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => removeGroupFromTeacher(groupIndex)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Предметы в группе */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {group.subjects.map((subject, subjectIndex) => (
                            <Badge key={subjectIndex} variant="secondary" className="flex items-center gap-1">
                              {getSubjectName(subject.subjectId)} ({subject.hours}ч)
                              <button
                                onClick={() => removeSubjectFromGroup(groupIndex, subjectIndex)}
                                className="ml-1 text-xs hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>

                        {/* Добавление предмета */}
                        {editingGroupIndex === groupIndex && (
                          <div className="flex gap-2 mt-2">
                            <Select
                              value={newSubject.subjectId}
                              onValueChange={(value) => setNewSubject({
                                ...newSubject,
                                subjectId: value
                              })}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Выберите предмет" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableSubjects.map((subject) => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Часы"
                              value={newSubject.hours}
                              onChange={(e) => setNewSubject({
                                ...newSubject,
                                hours: e.target.value
                              })}
                              className="w-20"
                              min="2"
                              step="2"
                            />
                            <Button
                              onClick={() => addSubjectToGroup(groupIndex)}
                              size="sm"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {editingGroupIndex !== groupIndex && (
                          <Button
                            onClick={() => setEditingGroupIndex(groupIndex)}
                            size="sm"
                            variant="outline"
                            className="mt-2"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Добавить предмет
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveTeacher}>Сохранить</Button>
                <Button 
                  onClick={() => {
                    setEditingTeacher(null);
                    setEditingGroupIndex(null);
                    setNewSubject({ subjectId: '', hours: '' });
                  }} 
                  variant="outline"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherInput;