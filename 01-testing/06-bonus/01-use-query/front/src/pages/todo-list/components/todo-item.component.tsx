import React from 'react';
import * as vm from '../todo-list.vm';
import { EditTodo } from './edit-todo.component';
import { DisplayTodo } from './display-todo.component';
import classes from './todo-item.module.css';

interface Props {
  editingId: number;
  todo: vm.TodoItem;
  onEnableEditMode: (id: number) => void;
  onUpdate: (item: vm.TodoItem) => void;
  onCancel: () => void;
}

export const TodoItem: React.FC<Props> = (props: Props) => {
  const { todo, editingId, onEnableEditMode, onUpdate, onCancel } = props;

  return (
    <div className={classes.root}>
      {todo.id !== editingId ? (
        <DisplayTodo key={todo.id} item={todo} onEdit={onEnableEditMode} />
      ) : (
        <EditTodo
          key={todo.id}
          item={todo}
          onSave={onUpdate}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};
