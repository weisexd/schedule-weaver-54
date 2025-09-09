import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Trash2 } from 'lucide-react';
import { Group } from '@/types/schedule';

interface GroupInputProps {
  groups: Group[];
  onGroupsChange: (groups: Group[]) => void;
  availableSubjects: { id: string; name: string; shortName: string }[];
}

export default function GroupInput({ groups, onGroupsChange, availableSubjects }: GroupInputProps) {
  const [editingGroup, setEditingGroup] = useState<{ id: string; name: string; subjects: string[] } | null>(null);

  // Добавление новой группы
  const addGroup = () => {
    setEditingGroup({
      id: `group_${Date.now()}`,
      name: '',
      subjects: []
    });
  };

  // Сохранение группы
  const saveGroup = () => {
    if (!editingGroup) return;
    
    // Валидация
    if (!editingGroup.name.trim()) {
      alert('Введите название группы');
      return;
    }
    
    if (editingGroup.subjects.length === 0) {
      alert('Добавьте хотя бы один предмет');
      return;
    }

    const existingIndex = groups.findIndex(g => g.id === editingGroup.id);
    if (existingIndex >= 0) {
      // Обновляем существующую
      const updatedGroups = [...groups];
      updatedGroups[existingIndex] = editingGroup;
      onGroupsChange(updatedGroups);
    } else {
      // Добавляем новую
      onGroupsChange([...groups, editingGroup]);
    }
    
    setEditingGroup(null);
  };

  // Удаление группы
  const deleteGroup = (id: string) => {
    if (confirm('Удалить группу?')) {
      onGroupsChange(groups.filter(g => g.id !== id));
    }
  };

  // Редактирование группы
  const editGroup = (group: Group) => {
    setEditingGroup({ ...group });
  };

  // Добавление предмета к группе
  const addSubjectToGroup = (subjectId: string) => {
    if (!editingGroup) return;
    
    if (!editingGroup.subjects.includes(subjectId)) {
      setEditingGroup({
        ...editingGroup,
        subjects: [...editingGroup.subjects, subjectId]
      });
    }
  };

  // Удаление предмета у группы
  const removeSubjectFromGroup = (subjectId: string) => {
    if (!editingGroup) return;
    
    setEditingGroup({
      ...editingGroup,
      subjects: editingGroup.subjects.filter(s => s !== subjectId)
    });
  };

  const getSubjectName = (id: string) => {
    return availableSubjects.find(s => s.id === id)?.shortName || id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Группы
          <Button onClick={addGroup} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список групп */}
        {groups.map(group => (
          <div key={group.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{group.name}</h4>
              <div className="flex gap-2">
                <Button onClick={() => editGroup(group)} size="sm" variant="outline">
                  Редактировать
                </Button>
                <Button onClick={() => deleteGroup(group.id)} size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {group.subjects.map(subjectId => (
                <Badge key={subjectId} variant="secondary">
                  {getSubjectName(subjectId)}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        {/* Форма редактирования */}
        {editingGroup && (
          <div className="p-4 border-2 border-primary rounded-lg bg-muted/10">
            <h4 className="font-semibold mb-4">
              {groups.find(g => g.id === editingGroup.id) ? 'Редактирование' : 'Новая'} группа
            </h4>
            
            <div className="space-y-4">
              {/* Название */}
              <div>
                <Label>Название группы *</Label>
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                  placeholder="Например: 10-А"
                />
              </div>

              {/* Предметы */}
              <div>
                <Label className="flex items-center gap-2">
                  Предметы группы *
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        addSubjectToGroup(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="ml-auto text-xs p-1 border rounded"
                  >
                    <option value="">+ Добавить предмет</option>
                    {availableSubjects
                      .filter(s => !editingGroup.subjects.includes(s.id))
                      .map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))
                    }
                  </select>
                </Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {editingGroup.subjects.map(subjectId => (
                    <Badge key={subjectId} variant="secondary" className="cursor-pointer">
                      {getSubjectName(subjectId)}
                      <X 
                        className="w-3 h-3 ml-1" 
                        onClick={() => removeSubjectFromGroup(subjectId)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-2">
                <Button onClick={saveGroup}>Сохранить</Button>
                <Button onClick={() => setEditingGroup(null)} variant="outline">
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        {groups.length === 0 && !editingGroup && (
          <p className="text-center text-muted-foreground py-8">
            Нет групп. Добавьте первую группу.
          </p>
        )}
      </CardContent>
    </Card>
  );
}