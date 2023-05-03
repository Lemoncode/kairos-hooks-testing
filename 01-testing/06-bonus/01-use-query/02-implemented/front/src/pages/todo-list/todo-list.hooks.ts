import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './todo-list.api';

const QUERY_KEY = 'todoList';
const ARCHIVED_QUERY_KEY = 'archivedTodoList';

export const useTodoList = () => {
  const { data: todoList } = useQuery([QUERY_KEY], api.getTodoList);
  const { data: archivedTodoList } = useQuery(
    [ARCHIVED_QUERY_KEY],
    api.getArchivedTodoList
  );

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
    archivedTodoList,
  };
};
