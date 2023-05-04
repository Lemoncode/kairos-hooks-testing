import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from './todo-list.api';
import * as model from './todo-list.model';
import * as hooks from './todo-list.hooks';
import { TodoListPage } from './todo-list.page';

const renderWithQuery = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('TodoListPage specs', () => {
  it('should display an empty todo list and button to add new item on init', () => {
    // Arrange

    // Act
    renderWithQuery(<TodoListPage />);

    // Assert
    const [todoListElement, archivedTodoListElement] =
      screen.getAllByRole('list');

    expect(todoListElement).toBeInTheDocument();
    expect(archivedTodoListElement).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /add item/i })
    ).toBeInTheDocument();
  });

  it(`should display a todo list with two items and arhived todo list with three items when
   it loads data from API`, async () => {
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
    renderWithQuery(<TodoListPage />);

    const [todoListElement, archivedTodoListElement] =
      screen.getAllByRole('list');

    const todoListItems = await within(todoListElement).findAllByRole(
      'listitem'
    );
    const archivedTodoListItems = await within(
      archivedTodoListElement
    ).findAllByRole('listitem');

    // Assert
    expect(getTodoListStub).toHaveBeenCalled();
    expect(todoListItems).toHaveLength(2);
    expect(
      within(todoListItems[0]).getByText('Todo completed')
    ).toBeInTheDocument();
    expect(within(todoListItems[0]).getByText('Lemons')).toBeInTheDocument();
    expect(
      within(todoListItems[1]).getByText('Pending todo')
    ).toBeInTheDocument();
    expect(within(todoListItems[1]).getByText('Oranges')).toBeInTheDocument();

    expect(getArchivedTodoListStub).toHaveBeenCalled();
    expect(archivedTodoListItems).toHaveLength(3);
    expect(
      within(archivedTodoListItems[0]).getByText('Todo completed')
    ).toBeInTheDocument();
    expect(
      within(archivedTodoListItems[0]).getByText('Eggs')
    ).toBeInTheDocument();
    expect(
      within(archivedTodoListItems[1]).getByText('Todo completed')
    ).toBeInTheDocument();
    expect(
      within(archivedTodoListItems[1]).getByText('Oil')
    ).toBeInTheDocument();
    expect(
      within(archivedTodoListItems[2]).getByText('Todo completed')
    ).toBeInTheDocument();
    expect(
      within(archivedTodoListItems[2]).getByText('Tuna')
    ).toBeInTheDocument();
  });

  it('should update the second item when it calls to onUpdateTodo', async () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
    const updatedTodoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: true },
    ];

    const getTodoListStub = jest
      .spyOn(api, 'getTodoList')
      .mockResolvedValueOnce(todoList)
      .mockResolvedValueOnce(updatedTodoList);

    const updateTodoItemStub = jest
      .spyOn(api, 'updateTodoItem')
      .mockResolvedValue();

    // Act
    renderWithQuery(<TodoListPage />);

    const listItems = await screen.findAllByRole('listitem');
    const secondItem = listItems[1];

    expect(within(secondItem).getByText('Pending todo')).toBeInTheDocument();

    await userEvent.click(
      within(secondItem).getByRole('button', { name: /edit/i })
    );

    const isDoneCheckbox = within(secondItem).getByRole('checkbox');
    await userEvent.click(isDoneCheckbox);
    await userEvent.click(
      within(secondItem).getByRole('button', { name: /save/i })
    );

    // Assert
    expect(getTodoListStub).toHaveBeenCalledTimes(2);
    expect(updateTodoItemStub).toHaveBeenCalledWith({
      id: 2,
      description: 'Oranges',
      isDone: true,
    });
    expect(within(secondItem).getByText('Todo completed')).toBeInTheDocument();
  });

  it('should add a third item when it calls to onAppendTodo', async () => {
    // Arrange
    const newTodo: model.TodoItem = {
      id: 3,
      description: 'Apples',
      isDone: false,
    };
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
    const updatedTodoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: true },
      { ...newTodo },
    ];

    const getTodoListStub = jest
      .spyOn(api, 'getTodoList')
      .mockResolvedValueOnce(todoList)
      .mockResolvedValueOnce(updatedTodoList);

    const appendTodoItemStub = jest
      .spyOn(api, 'appendTodoItem')
      .mockResolvedValue();

    // Act
    renderWithQuery(<TodoListPage />);

    const listItems = await screen.findAllByRole('listitem');

    expect(listItems).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: /add item/i }));

    const descriptionInput = screen.getByRole('textbox');
    await userEvent.type(descriptionInput, newTodo.description);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    // Assert
    const newListItem = await screen.findAllByRole('listitem');
    expect(getTodoListStub).toHaveBeenCalledTimes(2);
    expect(appendTodoItemStub).toHaveBeenCalledWith({
      id: 0,
      description: newTodo.description,
      isDone: false,
    });
    expect(newListItem).toHaveLength(3);
    expect(within(newListItem[2]).getByText('Apples')).toBeInTheDocument();
  });

  it('should display a todo list with two items when it calls to useTodoList', () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
    const onUpdateTodoSpy = jest.fn();
    const onAppendTodoSpy = jest.fn();

    const useTodoListStub = jest.spyOn(hooks, 'useTodoList').mockReturnValue({
      todoList,
      onUpdateTodo: onUpdateTodoSpy,
      onAppendTodo: onAppendTodoSpy,
      archivedTodoList: [],
    });

    // Act
    render(<TodoListPage />);

    const listItems = screen.queryAllByRole('listitem');

    // Assert
    expect(useTodoListStub).toHaveBeenCalled();
    expect(
      within(listItems[0]).getByText('Todo completed')
    ).toBeInTheDocument();
    expect(within(listItems[0]).getByText('Lemons')).toBeInTheDocument();
    expect(within(listItems[1]).getByText('Pending todo')).toBeInTheDocument();
    expect(within(listItems[1]).getByText('Oranges')).toBeInTheDocument();
  });

  it('should update the second item when it calls to onUpdateTodo mocking useTodoList', async () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
    const updateTodoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: true },
    ];
    const onUpdateTodoSpy = jest.fn();
    const onAppendTodoSpy = jest.fn();

    const useTodoListStub = jest
      .spyOn(hooks, 'useTodoList')
      .mockReturnValueOnce({
        todoList,
        onUpdateTodo: onUpdateTodoSpy,
        onAppendTodo: onAppendTodoSpy,
        archivedTodoList: [],
      })
      .mockReturnValueOnce({
        todoList,
        onUpdateTodo: onUpdateTodoSpy,
        onAppendTodo: onAppendTodoSpy,
        archivedTodoList: [],
      })
      .mockReturnValueOnce({
        todoList: updateTodoList,
        onUpdateTodo: onUpdateTodoSpy,
        onAppendTodo: onAppendTodoSpy,
        archivedTodoList: [],
      });
    // Act
    renderWithQuery(<TodoListPage />);

    const listItems = screen.getAllByRole('listitem');
    const secondItem = listItems[1];
    expect(within(secondItem).getByText('Pending todo')).toBeInTheDocument();

    await userEvent.click(
      within(secondItem).getByRole('button', { name: /edit/i })
    );
    const isDoneCheckbox = within(secondItem).getByRole('checkbox');
    await userEvent.click(isDoneCheckbox);
    await userEvent.click(
      within(secondItem).getByRole('button', { name: /save/i })
    );

    // Assert
    expect(useTodoListStub).toHaveBeenCalled();
    expect(useTodoListStub).toHaveBeenCalledTimes(3);
    expect(onUpdateTodoSpy).toHaveBeenCalledWith({
      id: 2,
      description: 'Oranges',
      isDone: true,
    });
    expect(within(secondItem).getByText('Todo completed')).toBeInTheDocument();
  });
});
