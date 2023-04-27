import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import * as api from './todo-list.api';
import { TodoListPage } from './todo-list.page';

export const queryClient = new QueryClient();
const renderWithQuery = (component) =>
  render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );

describe('TodoListPage specs', () => {
  it('should display an empty todo list and button to add new item on init', () => {
    // Arrange

    // Act
    renderWithQuery(<TodoListPage />);

    // Assert
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /add item/i })
    ).toBeInTheDocument();
  });

  it('should display a todo list with two items when it loads data from API', () => {
    // Arrange
    
    const getTodoListStub = jest.spyOn(api, 'getTodoList').mockResolvedValue([]);

    // Act
    renderWithQuery(<TodoListPage />);

    // Assert
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /add item/i })
    ).toBeInTheDocument();
  });
});
