import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './todo-list.api';

const QUERY_KEY = 'todoList';

export const useTodoList = () => {
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
