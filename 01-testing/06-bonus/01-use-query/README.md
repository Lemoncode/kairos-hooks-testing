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

+ const renderWithQuery = (component) => {
+   const queryClient = new QueryClient({
+     defaultOptions: { queries: { retry: false } },
+     logger: {
+       log: console.log,
+       warn: console.warn,
+       error: () => {},
+     },
+   });
+   return render(
+     <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
+   );
+ };

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

+ it('should add a third item when it calls to onAppendTodo', async () => {
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

But the most common scenario in a real world application is that we have a separate file for the useTodoList hook:

_./src/pages/todo-list/todo-list.hooks.ts_

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./todo-list.api";

const QUERY_KEY = "todoList";

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
```

_./src/pages/todo-list/todo-list.page.tsx_

```diff
import React from 'react';
- import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoItem, AppendTodo } from './components';
import { ReadOnlyMode, AppendMode } from './todo-list.constants';
+ import { useTodoList } from './todo-list.hooks';
- import * as api from './todo-list.api';
import * as model from './todo-list.model';
import classes from './todo-list.module.css';

- const QUERY_KEY = 'todoList';

- const useTodoList = () => {
-   const { data: todoList } = useQuery([QUERY_KEY], api.getTodoList);

-   const queryClient = useQueryClient();
-   const handleSaveSuccess = () => {
-     queryClient.invalidateQueries([QUERY_KEY]);
-   };

-   const { mutate: handleUpdateTodo } = useMutation(api.updateTodoItem, {
-     onSuccess: handleSaveSuccess,
-   });

-   const { mutate: handleAppendTodo } = useMutation(api.appendTodoItem, {
-     onSuccess: handleSaveSuccess,
-   });

-   return {
-     todoList,
-     onUpdateTodo: handleUpdateTodo,
-     onAppendTodo: handleAppendTodo,
-   };
- };

export const TodoListPage: React.FC = () => {
...

```

The current specs are still passing but now we can test the component in a simpler way:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
...
+ it('should display a todo list with two items when it calls to useTodoList', () => {
+   // Arrange
+   const todoList: model.TodoItem[] = [
+     { id: 1, description: 'Lemons', isDone: true },
+     { id: 2, description: 'Oranges', isDone: false },
+   ];
+   const onUpdateTodoSpy = jest.fn();
+   const onAppendTodoSpy = jest.fn();

+   const useTodoListStub = jest.spyOn(hooks, 'useTodoList').mockReturnValue({
+     todoList,
+     onUpdateTodo: onUpdateTodoSpy,
+     onAppendTodo: onAppendTodoSpy,
+   });

+   // Act
+   render(<TodoListPage />);

+   const listItems = screen.queryAllByRole('listitem');

+   // Assert
+   expect(useTodoListStub).toHaveBeenCalled();
+   expect(
+     within(listItems[0]).getByText('Todo completed')
+   ).toBeInTheDocument();
+   expect(within(listItems[0]).getByText('Lemons')).toBeInTheDocument();
+   expect(within(listItems[1]).getByText('Pending todo')).toBeInTheDocument();
+   expect(within(listItems[1]).getByText('Oranges')).toBeInTheDocument();
+ });
});
```

And move the rest of the `react-query` dependency to the hooks spec file:

_./src/pages/todo-list/todo-list.hooks.spec.tsx_

```typescript
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import * as api from "./todo-list.api";
import * as model from "./todo-list.model";
import { useTodoList } from "./todo-list.hooks";

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

describe("useTodoList specs", () => {
  it("should display a todo list with two items when it loads data from API", async () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: "Lemons", isDone: true },
      { id: 2, description: "Oranges", isDone: false },
    ];
    const getTodoListStub = jest
      .spyOn(api, "getTodoList")
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
```

## Appendix - Two fetches

In this section we are going to implement a new feature that allows us to fetch the archived todo list.

_./src/pages/todo-list/todo-list.hooks.ts_

```diff
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './todo-list.api';

const QUERY_KEY = 'todoList';
+ const ARCHIVED_QUERY_KEY = 'archivedTodoList';

export const useTodoList = () => {
  const { data: todoList } = useQuery([QUERY_KEY], api.getTodoList);
+ const { data: archivedTodoList } = useQuery(
+   [ARCHIVED_QUERY_KEY],
+   api.getArchivedTodoList
+ );

  ...

  return {
    todoList,
    onUpdateTodo: handleUpdateTodo,
    onAppendTodo: handleAppendTodo,
+   archivedTodoList,
  };
};

```

Update page component:

_./src/pages/todo-list/todo-list.page.tsx_

```diff
import React from 'react';
import { TodoItem, AppendTodo } from './components';
import { ReadOnlyMode, AppendMode } from './todo-list.constants';
import { useTodoList } from './todo-list.hooks';
import * as model from './todo-list.model';
import classes from './todo-list.module.css';

export const TodoListPage: React.FC = () => {
- const { todoList, onUpdateTodo, onAppendTodo } = useTodoList();
+ const { todoList, onUpdateTodo, onAppendTodo, archivedTodoList } = useTodoList();
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleUpdate = (item: model.TodoItem) => {
    onUpdateTodo(item);
    setEditingId(ReadOnlyMode);
  };

  const handleAppend = (item: model.TodoItem) => {
    onAppendTodo(item);
    setEditingId(ReadOnlyMode);
  };

  const handleCancel = () => {
    setEditingId(ReadOnlyMode);
  };

  return (
    <main>
      <ul className={classes.todoList}>
        {todoList?.map((todo) => (
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
+     <h2>Archived</h2>
+     <ul className={classes.todoList}>
+       {archivedTodoList?.map((todo) => (
+         <li key={todo.id}>
+           <TodoItem
+             todo={todo}
+             editingId={editingId}
+             onEnableEditMode={setEditingId}
+             onUpdate={handleUpdate}
+             onCancel={handleCancel}
+           />
+         </li>
+       ))}
+     </ul>
    </main>
  );
};

```

Run app:

```bash
npm start

```

Fix the first and the last specs:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
...

describe('TodoListPage specs', () => {
  it('should display an empty todo list and button to add new item on init', () => {
    // Arrange

    // Act
    renderWithQuery(<TodoListPage />);

    // Assert
+   const [todoListElement, archivedTodoListElement] =
+     screen.getAllByRole('list');

-   expect(screen.getByRole('list')).toBeInTheDocument();
+   expect(todoListElement).toBeInTheDocument();
+   expect(archivedTodoListElement).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /add item/i })
    ).toBeInTheDocument();
  });

...

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
+     archivedTodoList: [],
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
});

```

Update second spec mocking both lists:

_./src/pages/todo-list/todo-list.page.spec.tsx_

```diff
...

- it('should display a todo list with two items when it loads data from API', async () => {
+ it(`should display a todo list with two items and arhived todo list with three items when
+  it loads data from API`, async () => {
    // Arrange
    const todoList: model.TodoItem[] = [
      { id: 1, description: 'Lemons', isDone: true },
      { id: 2, description: 'Oranges', isDone: false },
    ];
+   const archivedTodoList: model.TodoItem[] = [
+     { id: 3, description: 'Eggs', isDone: true },
+     { id: 4, description: 'Oil', isDone: true },
+     { id: 5, description: 'Tuna', isDone: true },
+   ];

    const getTodoListStub = jest
      .spyOn(api, 'getTodoList')
      .mockResolvedValue(todoList);

+   const getArchivedTodoListStub = jest
+     .spyOn(api, 'getArchivedTodoList')
+     .mockResolvedValue(archivedTodoList);

    // Act
    renderWithQuery(<TodoListPage />);

+   const [todoListElement, archivedTodoListElement] =
+     screen.getAllByRole('list');

-   const listItems = await screen.findAllByRole('listitem');
+   const todoListItems = await within(todoListElement).findAllByRole('listitem');
+   const archivedTodoListItems = await within(archivedTodoListElement).findAllByRole('listitem');

    // Assert
    expect(getTodoListStub).toHaveBeenCalled();
-   expect(
-     within(listItems[0]).getByText('Todo completed')
-   ).toBeInTheDocument();
-   expect(within(listItems[0]).getByText('Lemons')).toBeInTheDocument();
-   expect(within(listItems[1]).getByText('Pending todo')).toBeInTheDocument();
-   expect(within(listItems[1]).getByText('Oranges')).toBeInTheDocument();
+   expect(
+     within(todoListItems[0]).getByText('Todo completed')
+   ).toBeInTheDocument();
+   expect(within(todoListItems[0]).getByText('Lemons')).toBeInTheDocument();
+   expect(within(todoListItems[1]).getByText('Pending todo')).toBeInTheDocument();
+   expect(within(todoListItems[1]).getByText('Oranges')).toBeInTheDocument();

+   expect(getArchivedTodoListStub).toHaveBeenCalled();
+   expect(archivedTodoListItems).toHaveLength(3);
+   expect(
+     within(archivedTodoListItems[0]).getByText('Todo completed')
+   ).toBeInTheDocument();
+   expect(
+     within(archivedTodoListItems[0]).getByText('Eggs')
+   ).toBeInTheDocument();
+   expect(
+     within(archivedTodoListItems[1]).getByText('Todo completed')
+   ).toBeInTheDocument();
+   expect(
+     within(archivedTodoListItems[1]).getByText('Oil')
+   ).toBeInTheDocument();
+   expect(
+     within(archivedTodoListItems[2]).getByText('Todo completed')
+   ).toBeInTheDocument();
+   expect(
+     within(archivedTodoListItems[2]).getByText('Tuna')
+   ).toBeInTheDocument();
  });

...

```

Apply the same changes to the hooks specs:

_./src/pages/todo-list/todo-list.hooks.spec.tsx_

```diff
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
+   const archivedTodoList: model.TodoItem[] = [
+     { id: 3, description: 'Eggs', isDone: true },
+     { id: 4, description: 'Oil', isDone: true },
+     { id: 5, description: 'Tuna', isDone: true },
+   ];

    const getTodoListStub = jest
      .spyOn(api, 'getTodoList')
      .mockResolvedValue(todoList);

+   const getArchivedTodoListStub = jest
+     .spyOn(api, 'getArchivedTodoList')
+     .mockResolvedValue(archivedTodoList);

    // Act
    const { result } = renderHook(() => useTodoList(), { wrapper });

    // Assert
    expect(getTodoListStub).toHaveBeenCalled();
+   expect(getArchivedTodoListStub).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.todoList).toEqual(todoList);
+     expect(result.current.archivedTodoList).toEqual(archivedTodoList);
    });
  });
});

```

# About Basefactor + Lemoncode

We are an innovating team of Javascript experts, passionate about turning your ideas into robust products.

[Basefactor, consultancy by Lemoncode](http://www.basefactor.com) provides consultancy and coaching services.

[Lemoncode](http://lemoncode.net/services/en/#en-home) provides training services.

For the LATAM/Spanish audience we are running an Online Front End Master degree, more info: http://lemoncode.net/master-frontend
