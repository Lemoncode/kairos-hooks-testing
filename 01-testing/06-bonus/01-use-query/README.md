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

_./src/todo-list.page.spec.tsx_

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

_./src/todo-list.page.spec.tsx_

```diff
import React from "react";
+ import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from "@testing-library/react";
import { TodoListPage } from "./todo-list.page";

+ export const queryClient = new QueryClient();
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

Loading data from API:

_./src/todo-list.page.spec.tsx_

```diff
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TodoListPage } from './todo-list.page';
...


```

# About Basefactor + Lemoncode

We are an innovating team of Javascript experts, passionate about turning your ideas into robust products.

[Basefactor, consultancy by Lemoncode](http://www.basefactor.com) provides consultancy and coaching services.

[Lemoncode](http://lemoncode.net/services/en/#en-home) provides training services.

For the LATAM/Spanish audience we are running an Online Front End Master degree, more info: http://lemoncode.net/master-frontend
