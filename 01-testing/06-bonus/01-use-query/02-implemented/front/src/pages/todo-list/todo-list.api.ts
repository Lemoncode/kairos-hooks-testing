import { TodoItem } from './todo-list.model';

const BASE_URL = 'http://localhost:3000/todos';

export const getTodoList = async (): Promise<TodoItem[]> => {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data;
};

export const updateTodoItem = async (item: TodoItem): Promise<void> => {
  await fetch(`${BASE_URL}/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
};

export const appendTodoItem = async (item: TodoItem): Promise<void> => {
  await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
};

export const getArchivedTodoList = async (): Promise<TodoItem[]> => {
  const response = await fetch('http://localhost:3000/archived-todos');
  const data = await response.json();
  return data;
};
