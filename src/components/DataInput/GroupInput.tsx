import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Group } from '@/types/schedule';

interface GroupInputProps {
  groups: Group[];
  onGroupsChange: (groups: Group[]) => void;
}

const GroupInput: React.FC<GroupInputProps> = ({
  groups,
  onGroupsChange
}) => {
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Добавление новой группы
  const addGroup = () => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: ''
    };
    setEditingGroup(newGroup);
  };

  // Сохранение группы
  const saveGroup = () => {
    if (!editingGroup || !editingGroup.name.trim()) {
      alert('Введите название группы');
      return;
    }

    const existingIndex = groups.findIndex(g => g.id === editingGroup.id);
    let updatedGroups;
    
    if (existingIndex >= 0) {
      updatedGroups = [...groups];
      updatedGroups[existingIndex] = editingGroup;
    } else {
      updatedGroups = [...groups, editingGroup];
    }
    
    onGroupsChange(updatedGroups);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Группы
          <Button onClick={addGroup} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Добавить группу
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список групп */}
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <h4 className="font-medium">{group.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Предметы назначаются через преподавателей
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => editGroup(group)} size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button onClick={() => deleteGroup(group.id)} size="sm" variant="outline">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Форма редактирования группы */}
        {editingGroup && (
          <div className="border rounded p-4 bg-muted">
            <h4 className="font-medium mb-3">
              {groups.find(g => g.id === editingGroup.id) ? 'Редактировать' : 'Добавить'} группу
            </h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="group-name">Название группы *</Label>
                <Input
                  id="group-name"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({
                    ...editingGroup,
                    name: e.target.value
                  })}
                  placeholder="Введите название группы"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Предметы для группы назначаются через преподавателей
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveGroup}>Сохранить</Button>
                <Button onClick={() => setEditingGroup(null)} variant="outline">
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

export default GroupInput;