import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as api from './todo-list.api';
import * as model from './todo-list.model';
import { useTodoList } from './todo-list.hooks';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTodoList specs', () => {
  it('should display a todo list with two items when it loads data from API', async () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
    const getTodoListStub = jest
      .spyOn(api, 'getTodoList')
      .mockResolvedValue(todoList);

    // Act
    const { result } = renderHook(() => useTodoList(), { wrapper });

    // Assert
    expect(getTodoListStub).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.todoList).toEqual(todoList);
    });
  });
});
