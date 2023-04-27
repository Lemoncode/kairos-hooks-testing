import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { todoKeys } from './todo-key-queries';
import {
  useTodoListQuery,
  useUpdateTodoItemMutation,
  useAppendTodoItemMutation,
} from './todo-query';
import { TodoItem, AppendTodo } from './components';
import { ReadOnlyMode, AppendMode } from './todo-list.constants';
import * as vm from './todo-list.vm';
import classes from './todo-list.module.css';

const useTodoQueries = () => {
  const handleSaveSuccess = () => {
    queryClient.invalidateQueries(todoKeys.todoList());
  };

  const queryClient = useQueryClient();
  const { data } = useTodoListQuery();
  const updateMutation = useUpdateTodoItemMutation(handleSaveSuccess);
  const appendMutation = useAppendTodoItemMutation(handleSaveSuccess);

  return {
    data,
    updateMutation,
    appendMutation,
    handleSaveSuccess,
  };
};

export const TodoListPage: React.FC = () => {
  const { data, updateMutation, appendMutation } = useTodoQueries();
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleUpdate = (item: vm.TodoItem) => {
    updateMutation.mutate(item);
    setEditingId(ReadOnlyMode);
  };

  const handleAppend = (item: vm.TodoItem) => {
    appendMutation.mutate(item);
    setEditingId(ReadOnlyMode);
  };

  const handleCancel = () => {
    setEditingId(ReadOnlyMode);
  };

  return (
    <>
      <ul className={classes.todoList}>
        {data?.map((todo) => (
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
    </>
  );
};
