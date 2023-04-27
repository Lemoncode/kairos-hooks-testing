# 01 Use query

In this example we will create tests for components using `@tanstack/react-query`.

# Steps

`npm install` to install packages:

```bash
npm install
```

Let's start implementing a test, the scenario we want to test:

- Check initial values.
- Load `todoList` from API and check values.
- Update current todo item.
- Append new todo item.

_./src/pages/todo-list/todo-list.page.spec.tsx_

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { TodoListPage } from "./todo-list.page";

describe("TodoListPage specs", () => {
  it("should display an empty todo list and button to add new item on init", () => {
    // Arrange

    // Act
    render(<TodoListPage />);

    // Assert
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: /add item/i })
    ).toBeInTheDocument();
  });
});
```

Run tests:

```bash
npm run test:wath

```

Why is it failing? Because jest is not being able to resolve the css files, let's fix it:

_./config/test/mocks/styles.js_

```javascript
module.exports = {};
```

_./config/test/jest.js_

```diff
export default {
  rootDir: '../../',
  verbose: true,
  preset: 'ts-jest',
  restoreMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/test/setup-after.ts'],
+ moduleNameMapper: {
+   '\\.css$': '<rootDir>/config/test/mocks/styles.js',
+ },
};

```

> [Official docs](https://jestjs.io/docs/webpack#handling-static-assets)

Run again:

```bash
npm run test:wath

```

Now we are getting a new error, we need to render the component with the `QueryClientProvider`:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
import React from "react";
+ import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from "@testing-library/react";
import { TodoListPage } from "./todo-list.page";

+ export const queryClient = new QueryClient({
+   defaultOptions: { queries: { retry: false } },
+   logger: {
+     log: console.log,
+     warn: console.warn,
+     error: () => {},
+   },
+ });
+ const renderWithQuery = (component) =>
+   render(
+     <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
+   );

describe("TodoListPage specs", () => {
  it("should display an empty todo list and button to add new item on init", () => {
    // Arrange

    // Act
-   render(<TodoListPage />);
+   renderWithQuery(<TodoListPage />);

    // Assert
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: /add item/i })
    ).toBeInTheDocument();
  });
});

```

> [Turn off retries to avoid timeouts on tests](https://tanstack.com/query/v4/docs/react/guides/testing#turn-off-retries)

Loading data from API:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
+ import * as api from './todo-list.api';
+ import * as model from './todo-list.model';
import { TodoListPage } from './todo-list.page';
...

+ it('should display a todo list with two items when it loads data from API', async () => {
+     // Arrange
+     const todoList: model.TodoItem[] = [
+       { id: 1, description: 'Lemons', isDone: true },
+       { id: 2, description: 'Oranges', isDone: false },
+     ];

+     const getTodoListStub = jest
+       .spyOn(api, 'getTodoList')
+       .mockResolvedValue(todoList);

+     // Act
+     renderWithQuery(<TodoListPage />);

+     const listItems = await screen.findAllByRole('listitem');

+     // Assert
+     expect(getTodoListStub).toHaveBeenCalled();
+     expect(within(listItems[0]).getByText('✅')).toBeInTheDocument();
+     expect(within(listItems[0]).getByText('Lemons')).toBeInTheDocument();
+     expect(within(listItems[1]).getByText('⭕️')).toBeInTheDocument();
+     expect(within(listItems[1]).getByText('Oranges')).toBeInTheDocument();
+   });
  });

```

A better solution would be to hide the icon using `aria-hidden`:

_./src/pages/todo-list/components/display-todo.component.tsx_

```diff
import React from 'react';
import * as model from '../todo-list.model';
import classes from './display-todo.module.css';

interface Props {
  item: model.TodoItem;
  onEdit: (id: number) => void;
}

export const DisplayTodo: React.FC<Props> = (props: Props) => {
  const { item, onEdit } = props;

  return (
    <>
-     <span>{item.isDone ? '✅' : '⭕️'}</span>
+     <span aria-hidden>{item.isDone ? '✅' : '⭕️'}</span>
+     <span className="visually-hidden">
+       {item.isDone ? 'Todo completed' : 'Pending todo'}
+     </span>
      <span>{item.description}</span>
      <button className={classes.editButton} onClick={() => onEdit(item.id)}>
        Edit
      </button>
    </>
  );
};

```

Update spec:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
...

-   expect(within(listItems[0]).getByText('✅')).toBeInTheDocument();
+   expect(within(listItems[0]).getByText('Todo completed')).toBeInTheDocument();
    expect(within(listItems[0]).getByText('Lemons')).toBeInTheDocument();
-   expect(within(listItems[1]).getByText('⭕️')).toBeInTheDocument();
+   expect(within(listItems[1]).getByText('Pending todo')).toBeInTheDocument();
    expect(within(listItems[1]).getByText('Oranges')).toBeInTheDocument();
  });
});

```

Update current todo item:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
+ import userEvent from '@testing-library/user-event';
import * as api from './todo-list.api';
import * as model from './todo-list.model';
import { TodoListPage } from './todo-list.page';
...

+ it('should update the second item when it calls to onUpdateTodo', async () => {
+     // Arrange
+     const todoList: model.TodoItem[] = [
+       { id: 1, description: 'Lemons', isDone: true },
+       { id: 2, description: 'Oranges', isDone: false },
+     ];
+     const updatedTodoList: model.TodoItem[] = [
+       { id: 1, description: 'Lemons', isDone: true },
+       { id: 2, description: 'Oranges', isDone: true },
+     ];

+     const getTodoListStub = jest
+       .spyOn(api, 'getTodoList')
+       .mockResolvedValueOnce(todoList)
+       .mockResolvedValueOnce(updatedTodoList);

+     const updateTodoItemStub = jest
+       .spyOn(api, 'updateTodoItem')
+       .mockResolvedValue();

+     // Act
+     renderWithQuery(<TodoListPage />);

+     const listItems = await screen.findAllByRole('listitem');
+     const secondItem = listItems[1];

+     expect(within(secondItem).getByText('Pending todo')).toBeInTheDocument();

+     await userEvent.click(
+       within(secondItem).getByRole('button', { name: /edit/i })
+     );

+     const isDoneCheckbox = within(secondItem).getByRole('checkbox');
+     await userEvent.click(isDoneCheckbox);
+     await userEvent.click(
+       within(secondItem).getByRole('button', { name: /save/i })
+     );

+     // Assert
+     expect(getTodoListStub).toHaveBeenCalledTimes(2);
+     expect(updateTodoItemStub).toHaveBeenCalledWith({
+       id: 2,
+       description: 'Oranges',
+       isDone: true,
+     });
+     expect(within(secondItem).getByText('Todo completed')).toBeInTheDocument();
+   });
});
```

Append new todo item:

```diff

+ it('should add a thidr item when it calls to onAppendTodo', async () => {
+   // Arrange
+   const newTodo: model.TodoItem = {
+     id: 3,
+     description: 'Apples',
+     isDone: false,
+   };
+   const todoList: model.TodoItem[] = [
+     { id: 1, description: 'Lemons', isDone: true },
+     { id: 2, description: 'Oranges', isDone: false },
+   ];
+   const updatedTodoList: model.TodoItem[] = [
+     { id: 1, description: 'Lemons', isDone: true },
+     { id: 2, description: 'Oranges', isDone: true },
+     { ...newTodo },
+   ];

+   const getTodoListStub = jest
+     .spyOn(api, 'getTodoList')
+     .mockResolvedValueOnce(todoList)
+     .mockResolvedValueOnce(updatedTodoList);

+   const appendTodoItemStub = jest
+     .spyOn(api, 'appendTodoItem')
+     .mockResolvedValue();

+   // Act
+   renderWithQuery(<TodoListPage />);

+   const listItems = await screen.findAllByRole('listitem');

+   expect(listItems).toHaveLength(2);

+   await userEvent.click(screen.getByRole('button', { name: /add item/i }));

+   const descriptionInput = screen.getByRole('textbox');
+   await userEvent.type(descriptionInput, newTodo.description);
+   await userEvent.click(screen.getByRole('button', { name: /save/i }));

+   // Assert
+   const newListItem = await screen.findAllByRole('listitem');
+   expect(getTodoListStub).toHaveBeenCalledTimes(2);
+   expect(appendTodoItemStub).toHaveBeenCalledWith({
+     id: 0,
+     description: newTodo.description,
+     isDone: false,
+   });
+   expect(newListItem).toHaveLength(3);
+   expect(within(newListItem[2]).getByText('Apples')).toBeInTheDocument();
+ });
});
```

# About Basefactor + Lemoncode

We are an innovating team of Javascript experts, passionate about turning your ideas into robust products.

[Basefactor, consultancy by Lemoncode](http://www.basefactor.com) provides consultancy and coaching services.

[Lemoncode](http://lemoncode.net/services/en/#en-home) provides training services.

For the LATAM/Spanish audience we are running an Online Front End Master degree, more info: http://lemoncode.net/master-frontend
