import { TodoItem } from './todo-list.vm';

const BASE_URL = 'http://localhost:3000/todos';

export const getTodoList = async (): Promise<TodoItem[]> => {
  const response = await fetch(BASE_URL);
  const data = await response.json();
  return data;
};

export const updateTodoItem = async (item: TodoItem): Promise<TodoItem> => {
  const response = await fetch(`${BASE_URL}/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  const data = await response.json();
  return data;
};

export const appendTodoItem = async (item: TodoItem): Promise<TodoItem> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  const data = await response.json();
  return data;
};
