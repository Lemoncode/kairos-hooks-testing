import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoItem, AppendTodo } from './components';
import { ReadOnlyMode, AppendMode } from './todo-list.constants';
import * as api from './todo-list.api';
import * as model from './todo-list.model';
import classes from './todo-list.module.css';

const QUERY_KEY = 'todoList';

const useTodoList = () => {
  const { data: todoList } = useQuery([QUERY_KEY], api.getTodoList);

  const queryClient = useQueryClient();
  const handleSaveSuccess = () => {
    queryClient.invalidateQueries([QUERY_KEY]);
  };

  const { mutate: handleUpdateTodo } = useMutation(api.updateTodoItem, {
    onSuccess: handleSaveSuccess,
  });

  const { mutate: handleAppendTodo } = useMutation(api.appendTodoItem, {
    onSuccess: handleSaveSuccess,
  });

  return {
    todoList,
    onUpdateTodo: handleUpdateTodo,
    onAppendTodo: handleAppendTodo,
  };
};

export const TodoListPage: React.FC = () => {
  const { todoList, onUpdateTodo, onAppendTodo } = useTodoList();
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
    </main>
  );
};
