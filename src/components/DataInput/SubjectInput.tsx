import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Subject } from '@/types/schedule';

interface SubjectInputProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
}

export default function SubjectInput({ subjects, onSubjectsChange }: SubjectInputProps) {
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string; shortName: string } | null>(null);

  // Добавление нового предмета
  const addSubject = () => {
    setEditingSubject({
      id: `subject_${Date.now()}`,
      name: '',
      shortName: ''
    });
  };

  // Сохранение предмета
  const saveSubject = () => {
    if (!editingSubject) return;
    
    // Валидация
    if (!editingSubject.name.trim()) {
      alert('Введите название предмета');
      return;
    }
    
    if (!editingSubject.shortName.trim()) {
      alert('Введите короткое название предмета');
      return;
    }

    if (editingSubject.shortName.length > 5) {
      alert('Короткое название не должно превышать 5 символов');
      return;
    }

    const existingIndex = subjects.findIndex(s => s.id === editingSubject.id);
    if (existingIndex >= 0) {
      // Обновляем существующий
      const updatedSubjects = [...subjects];
      updatedSubjects[existingIndex] = editingSubject;
      onSubjectsChange(updatedSubjects);
    } else {
      // Добавляем новый
      onSubjectsChange([...subjects, editingSubject]);
    }
    
    setEditingSubject(null);
  };

  // Удаление предмета
  const deleteSubject = (id: string) => {
    if (confirm('Удалить предмет? Это также удалит его у всех преподавателей и групп.')) {
      onSubjectsChange(subjects.filter(s => s.id !== id));
    }
  };

  // Редактирование предмета
  const editSubject = (subject: Subject) => {
    setEditingSubject({ ...subject });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Предметы
          <Button onClick={addSubject} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список предметов */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subjects.map(subject => (
            <div key={subject.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{subject.name}</h4>
                  <p className="text-sm text-muted-foreground">Кратко: {subject.shortName}</p>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => editSubject(subject)} size="sm" variant="outline">
                    Изменить
                  </Button>
                  <Button onClick={() => deleteSubject(subject.id)} size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Форма редактирования */}
        {editingSubject && (
          <div className="p-4 border-2 border-primary rounded-lg bg-muted/10">
            <h4 className="font-semibold mb-4">
              {subjects.find(s => s.id === editingSubject.id) ? 'Редактирование' : 'Новый'} предмет
            </h4>
            
            <div className="space-y-4">
              {/* Название */}
              <div>
                <Label>Полное название *</Label>
                <Input
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                  placeholder="Например: Математика"
                />
              </div>

              {/* Короткое название */}
              <div>
                <Label>Короткое название * (макс. 5 символов)</Label>
                <Input
                  value={editingSubject.shortName}
                  onChange={(e) => setEditingSubject({
                    ...editingSubject, 
                    shortName: e.target.value.slice(0, 5)
                  })}
                  placeholder="Например: Мат"
                  maxLength={5}
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-2">
                <Button onClick={saveSubject}>Сохранить</Button>
                <Button onClick={() => setEditingSubject(null)} variant="outline">
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {subjects.length === 0 && !editingSubject && (
          <p className="text-center text-muted-foreground py-8">
            Нет предметов. Добавьте первый предмет.
          </p>
        )}
      </CardContent>
    </Card>
  );
}