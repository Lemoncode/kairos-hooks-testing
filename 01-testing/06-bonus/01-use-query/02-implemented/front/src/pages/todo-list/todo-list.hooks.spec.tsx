import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as api from './todo-list.api';
import * as model from './todo-list.model';
import { useTodoList } from './todo-list.hooks';

const wrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTodoList specs', () => {
  it('should display a todo list with two items when it loads data from API', async () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
    const archivedTodoList: model.TodoItem[] = [
      { id: 3, description: 'Eggs', isDone: true },
      { id: 4, description: 'Oil', isDone: true },
      { id: 5, description: 'Tuna', isDone: true },
    ];

    const getTodoListStub = jest
      .spyOn(api, 'getTodoList')
      .mockResolvedValue(todoList);

    const getArchivedTodoListStub = jest
      .spyOn(api, 'getArchivedTodoList')
      .mockResolvedValue(archivedTodoList);

    // Act
    const { result } = renderHook(() => useTodoList(), { wrapper });

    // Assert
    expect(getTodoListStub).toHaveBeenCalled();
    expect(getArchivedTodoListStub).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.todoList).toEqual(todoList);
      expect(result.current.archivedTodoList).toEqual(archivedTodoList);
    });
  });
});
