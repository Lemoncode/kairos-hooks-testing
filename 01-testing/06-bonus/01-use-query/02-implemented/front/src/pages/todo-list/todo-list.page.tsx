import React from 'react';
import { TodoItem, AppendTodo } from './components';
import { ReadOnlyMode, AppendMode } from './todo-list.constants';
import { useTodoList } from './todo-list.hooks';
import * as model from './todo-list.model';
import classes from './todo-list.module.css';

export const TodoListPage: React.FC = () => {
  const { todoList, onUpdateTodo, onAppendTodo, archivedTodoList } =
    useTodoList();
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleUpdate = (item: model.TodoItem) => {
    onUpdateTodo(item);
    setEditingId(ReadOnlyMode);
  };

  const handleAppend = (item: model.TodoItem) => {
    onAppendTodo(item);
    setEditingId(ReadOnlyMode);
  };

  const handleCancel = () => {
    setEditingId(ReadOnlyMode);
  };

  return (
    <main>
      <ul className={classes.todoList}>
        {todoList?.map((todo) => (
          <li key={todo.id}>
            <TodoItem
              todo={todo}
              editingId={editingId}
              onEnableEditMode={setEditingId}
              onUpdate={handleUpdate}
              onCancel={handleCancel}
            />
          </li>
        ))}
      </ul>
      <AppendTodo
        editingId={editingId}
        onEnableEditMode={() => setEditingId(AppendMode)}
        onAppend={handleAppend}
        onCancel={() => setEditingId(ReadOnlyMode)}
      />
      <h2>Archived</h2>
      <ul className={classes.todoList}>
        {archivedTodoList?.map((todo) => (
          <li key={todo.id}>
            <TodoItem
              todo={todo}
              editingId={editingId}
              onEnableEditMode={setEditingId}
              onUpdate={handleUpdate}
              onCancel={handleCancel}
            />
          </li>
        ))}
      </ul>
    </main>
  );
};
