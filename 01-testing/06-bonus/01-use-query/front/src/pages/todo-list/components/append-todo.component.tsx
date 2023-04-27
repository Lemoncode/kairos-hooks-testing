import React from 'react';
import { AppendMode } from '../todo-list.constants';
import { TodoItem } from '../todo-list.vm';
import { EditTodo } from './edit-todo.component';
import classes from './append-todo.module.css';

interface Props {
  editingId: number;
  onEnableEditMode: () => void;
  onAppend: (item: TodoItem) => void;
  onCancel: () => void;
}

export const AppendTodo: React.FC<Props> = (props: Props) => {
  const { editingId, onEnableEditMode, onAppend, onCancel } = props;

  return (
    <>
      {editingId !== AppendMode ? (
        <button onClick={onEnableEditMode}>Add Item</button>
      ) : (
        <div className={classes.editTodo}>
          <EditTodo onSave={onAppend} onCancel={onCancel} />
        </div>
      )}
    </>
  );
};
