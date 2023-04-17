# Ejemplo

Vamos a seguir practicando con React Query, esta vez vamos a:

- Trabajar con mutaciones (_post_ / _update_).
- Invalidar consultas.

Vamos a crear una aplicación que va a manejar una lista de _ToDos_.

Después como ejercicio trabajaremos con una lista de la compra.

# Pasos

- Vamos a levantar el mock de backend (creado con JSON Server).

```bash
cd back
```

```bash
npm install
```

Y a dejarlo arrancado

```bash
npm start
```

Accedemos desde el navegador a _localhost:3000_ y vemos que podemos navegar a un listado de _TODOs_.

- Dejamos ese terminal abierto y creamos un nuevo terminal, esta vez toca trabajar con el _front_, si estamos
  en el raíz hacemos un _cd front_ y luego arrancamos:

```bash
cd front
```

```bash
npm install
```

```bash
npm start
```

- Aquí vemos una aplicación sencilla con dos ventanas.

- Vamos a arrancarnos con la página de _TODOs_.

- Lo primero que vamos a hacer es definir el modelo para los _TODOs_:

_./src/pages/todo/todo.model.ts_

```ts
export interface TodoItem {
  id: number;
  description: string;
  isDone: boolean;
}
```

- Si siguiéramos programación progresiva, ahora crearíamos una lista _mock_ _harcodeada_ y nos pondríamos con el componente para después conectar con la API real, en este caso vamos a tirar por crear la API para poder centrarnos en _React Query_.
- Vamos a definir la API:

_./src/pages/todo/todo.api.ts_

```ts
import { TodoItem } from "./todo.model";

export const getTodoList = async (): Promise<TodoItem[]> => {
  const response = await fetch(`http://localhost:3000/todos`);
  const data = await response.json();
  return data;
};
```

- Vamos a por la parte de componente y vamos a consumir esa API, para ello usaremos React Query que instalaremos en nuestra aplicación de _front_.

```bash
npm install @tanstack/react-query
```

Toca instanciar el _provider_ a nivel de _App_:

Creamos el query client:

_./src/core/query/query-client.ts_

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
```

_./src/app.tsx_

```diff
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TodoPage, ListPage } from "./pages";
+ import { QueryClientProvider } from "@tanstack/react-query";
+ import { queryClient } from "./core/query/query-client";

export const App = () => {
  return (
+    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<TodoPage />} />
          <Route path="/list" element={<ListPage />} />
        </Routes>
      </HashRouter>
+    </QueryClientProvider>
  );
  );
};
```

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
+ import { useQuery } from "@tanstack/react-query";
+ import { getTodoList } from './todo.api';


export const TodoPage: React.FC = () => {
+
+  const { data } = useQuery(["todoList"], () =>
+    getTodoList()
+  );
+
  return (
    <>
      <h1>Todo Page</h1>
+      <ul>
+        {data?.map((todo) => (
+          <li key={todo.id}>
+            {todo.description} - {todo.isDone ? "🔘" : "⚫️"}
+          </li>
+        ))}
+      </ul>
      <Link to="/list">To List</Link>
    </>
  );
};
```

Vamos ver que tal funciona esto:

```bash
npm start
```

Aquí lo de tener que chequear por el valor undefined null puede ser un rollo, otra aproximación:

```diff
-  const { data } = useQuery(["todoList"], () =>
-    getTodoList()
-  );
+  const { data } = useQuery({
+    queryKey: ["todoList"],
+    queryFn: () => getTodoList(),
+    initialData: [],
+  });
```

- Tenemos algo básico cargando, vamos a simular que vamos a trabajar en un proyecto más grande, es hora de hacer refactor de las consultas:

Vamos a crear _query keys_ para el área de _TODOs_:

_./src/pages/todo/todo-key-queries.ts_

```ts
export const todoKeys = {
  all: ["todo"] as const,
  todoList: () => [...todoKeys.all, "todoList"] as const,
};
```

Y vamos a crear un fichero con _hooks_ que hagan de _wrapper_ de las consultas.

_./src/pages/todo/todo-query.ts_

```ts
import { useQuery } from "@tanstack/react-query";
import { getTodoList } from "./todo.api";
import { todoKeys } from "./todo-key-queries";

export const useTodoListQuery = () => {
  return useQuery({
    queryKey: todoKeys.todoList(),
    queryFn: () => getTodoList(),
    initialData: [],
  });
};
```

Vamos a darle uso en la página:

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
- import { useQuery } from "@tanstack/react-query";
- import { getTodoList } from "./todo.api";
+ import {useTodoListQuery} from './todo-query';

export const TodoPage: React.FC = () => {
-  const { data } = useQuery(["todoList"], () => getTodoList());
+  const { data } = useTodoListQuery();


  return (
```

- Le damos algo de estilado a la lista de _TODOs_:

  - Vamos a tener un _grid_ con tres columnas:
    - Estado de la tarea.
    - Nombre de la tarea.
    - Paleta de comandos (editar, borrar, o si ya estas
      editando grabar / cancelar).

_./src/pages/todo/todo.page.css_

```css
.todo-list {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-gap: 1rem;
  margin: 1rem;
}
```

- Aplicamos el estilo a la lista:

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTodoList } from "./todo.api";
+ import classes from './todo.page.css';

export const TodoPage: React.FC = () => {
  const { data } = useQuery(["todoList"], () => getTodoList());

  return (
    <>
      <h1>Todo Page</h1>
-      <ul>
+      <div className={classes.todoList}>
        {data?.map((todo) => (
+          <React.Fragment key={todo.id}>
+            <div>{todo.isDone ? "✅" : "⭕️"}</div>
+            <div>{todo.description}</div>
+            <div>Command area</div>
+          </React.Fragment>
        ))}
-          <li key={todo.id}>
-            {todo.isDone ? "✅" : "⭕️"} {todo.description}
-          </li>
        ))}
-      </ul>
+      </div>
      <Link to="/list">To List</Link>
    </>
  );
};
```

- Como vamos a tener modo edición vamos a encapsular ya el modo _display_.

_./src/pages/todo/components/todo-item-display.component.tsx_

```tsx
import React from "react";
import { TodoItem } from "../todo.model";

interface Props {
  item: TodoItem;
}

export const TodoItemDisplay: React.FC<Props> = (props) => {
  const { item } = props;

  return (
    <>
      <div>{item.isDone ? "✅" : "⭕️"}</div>
      <div>{item.description}</div>
      <div>Command area</div>
    </>
  );
};
```

- Creamos un _barrel_:

_./src/pages/todo/components/index.ts_

```ts
export * from "./todo-item-display.component";
```

Reemplazamos en página principal

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
import { useTodoListQuery } from "./todo-query";
+ import { TodoItemDisplay } from "./components";
import classes from "./todo.page.css";
```

_./src/pages/todo/todo.page.tsx_

```diff
  return (
    <>
      <h1>Todo Page</h1>
      <div className={classes.todoList}>
        {data?.map((todo) => (
-          <React.Fragment key={todo.Id}>
-            <div>{todo.isDone ? "✅" : "⭕️"}</div>
-            <div>{todo.description}</div>
-            <div>Command area</div>
-          </React.Fragment>
+          <TodoItemDisplay key={todo.id} item={todo} />
        ))}
      </div>
```

- Para saber si un _TODO_ está en edición (sólo dejaremos que uno esté en edición a la vez), podemos o bien usar un _flag_ o tener en cada _TODO_ un _flag_ para saber si está en modo edición.

Vamos a almacenar en una variable el _Id_ del _TODO_ en edición, tendremos los siguientes valores:

- -1 -> No hay ningún _TODO_ en edición.
- 0 -> Estamos insertando un nuevo _TODO_.
- > 0 -> Estamos editando un TODO que ya existe.

_./src/pages/todo/todo.page.tsx_

```diff
import { TodoItemDisplay } from "./components";

+ const ReadOnlyMode = -1;
+ const AppendMode = 0;

export const TodoPage: React.FC = () => {
```

- Vamos a mostrar componente de edición o estado según lo que toque.

_./src/pages/todo/todo.page.tsx_

```diff
export const TodoPage: React.FC = () => {
  const { data } = useQuery(["todoList"], () => getTodoList());
+ const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  return (
    <>
      <h1>Todo Page</h1>
      <div className={classes.todoList}>
        {data?.map((todo) => (
+         (todo.id !== editingId) ? (
            <TodoItemDisplay key={todo.id} item={todo}/>
+        ) : (
+            <>
+              <h6>Edit Mode...</h6>
+              <h6>Todo...</h6>
+              <h6>Todo...</h6>
+            </>
+	 	  )
        ))}
      </div>
      <Link to="/list">To List</Link>
    </>
  );
};
```

Y vamos a añadir el botón para entrar en _edit mode_:

_./src/pages/todo/components/todo-item-display.component.tsx_

```diff
import React from "react";
import { TodoItem } from "../todo.model";

interface Props {
  item: TodoItem;
+ onEdit: (id: number) => void;
}

export const TodoItemDisplay: React.FC<Props> = (Props: props) => {
- const { item } = props;
+ const {item, onEdit} = props;

  return (
    <React.Fragment key={item.id}>
      <div>{item.isDone ? "✅" : "⭕️"}</div>
      <div>{item.description}</div>
-      <div>Command area</div>
+      <div><button onClick={() => onEdit(item.id)}>Edit</button></div>
    </React.Fragment>
  );
};
```

Y en la página principal:

_./src/pages/todo/todo.page.tsx_

```diff
export const TodoPage: React.FC = () => {
  const { data } = useQuery(["todoList"], () => getTodoList());
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

+ const handleEnterEditMode = (id: number) => {
+   setEditingId(id);
+ }

  return (
    <>
      <h1>Todo Page</h1>
      <div className={classes.todoList}>
        {data?.map((todo) =>
          todo.id !== editingId ? (
-            <TodoItemDisplay key={todo.id} item={todo}/>
+            <TodoItemDisplay key={todo.id} item={todo} onEdit={handleEnterEditMode} />
```

- Vamos a crear el _component_ de edición:

_./src/pages/todo/components/todo-item-edit.component.tsx_

```tsx
import React from "react";
import { TodoItem } from "../todo.model";

interface Props {
  item: TodoItem;
  onSave: (item: TodoItem) => void;
  onCancel: () => void;
}

export const TodoItemEdit: React.FC<Props> = (props: Props) => {
  const { item, onSave, onCancel } = props;
  const [editItem, setEditItem] = React.useState({ ...item });

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={editItem.isDone}
          onChange={(e) =>
            setEditItem({ ...editItem, isDone: e.target.checked })
          }
        />
        Done
      </label>
      <input
        type="text"
        value={editItem.description}
        onChange={(e) =>
          setEditItem({ ...editItem, description: e.target.value })
        }
      />
      <div>
        <button onClick={() => onSave(editItem)}>Save</button>
        <button onClick={() => onCancel()}>Cancel</button>
      </div>
    </>
  );
};
```

Lo añadimos al _barrel_

_./src/pages/todo/components/index.ts_

```diff
export * from "./todo-item-display.component";
+ export * from "./todo-item-edit.component";
```

Y en la página principal:

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTodoList } from "./todo.api";
import classes from "./todo.page.css";
+ import { TodoItem } from "./todo.model";
- import { TodoItemDisplay } from "./components";
+ import { TodoItemDisplay, TodoItemEdit } from "./components";
```

_./src/pages/todo/todo.page.tsx_

```diff
export const TodoPage: React.FC = () => {
  const { data } = useQuery(["todoList"], () => getTodoList());
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleEnterEditMode = (id: number) => {
    setEditingId(id);
  };

+ const handleUpdate = (item: TodoItem) => {
+   console.log("Save", item);
+   setEditingId(ReadOnlyMode);
+ };

+ const handleCancel = () => {
+   setEditingId(ReadOnlyMode);
+ };

  return (
```

_./src/pages/todo/todo.page.tsx_

```diff
  return (
    <>
      <h1>Todo Page</h1>
      <div className={classes.todoList}>
        {data?.map((todo) =>
          todo.id !== editingId ? (
            <TodoItemDisplay
              key={todo.id}
              item={todo}
              onEdit={handleEnterEditMode}
            />
          ) : (
-            <>
-              <h6>Edit Mode...</h6>
-              <h6>Todo...</h6>
-              <h6>Todo...</h6>
-            </>
+           <TodoItemEdit key={todo.id} item={todo} onSave={handleUpdate} onCancel={handleCancel}/>
          )
          )
        )}
      </div>
```

Vamos ahora a la parte interesante, queremos grabar los cambios en el servidor.

- Definimos la entrada en la API:

_./src/pages/todo/todo.api.tsx_

```diff
import { TodoItem } from "./todo.model";

export const getTodoList = async (): Promise<TodoItem[]> => {
  const response = await fetch(`http://localhost:3000/todos`);
  const data = await response.json();
  return data;
};

+ export const updateTodoItem = async (item: TodoItem): Promise<TodoItem> => {
+ const response = await fetch(`http://localhost:3000/todos/${item.id}`, {
+   method: "PUT",
+   headers: {
+     "Content-Type": "application/json",
+   },
+   body: JSON.stringify(item),
+ });
+
+ const data = await response.json();
+ return data;
+ };
```

- ¿Y qué hacemos con _React Query_? En este caso nos ofrece _mutations_ esto nos permite lanzar una actualización, tener _tracking_ de la misma (lo puedo incrustar en el JSX) y ver que hacer tanto si tiene éxito como si no, aquí vamos a por el caso "_feliz_" y cuando se actualice vamos a relanzar la consulta de lista de TODOs para asegurarnos que está todo al día.

_./src/pages/todo/todo-query.ts_

```diff
- import { useQuery } from "@tanstack/react-query";
+ import { useQuery, useMutation } from "@tanstack/react-query";
- import { getTodoList } from "./todo.api";
+ import { getTodoList, updateTodoItem } from "./todo.api";
import { TodoItem } from "./todo.model";
import { todoKeys } from "./todo-key-queries";

export const useTodoListQuery = () => {
  return useQuery(todoKeys.todoList(), () =>
    getTodoList()
  );
};

+ export const useUpdateTodoItemMutation = (onSuccessFn : () => void) => {
+   return useMutation(updateTodoItem,
+     {
+       onSuccess: () => onSuccessFn()
+     }
+   );
+ };
```

Vamos a darle uso en la _handler_ de la página, en este caso lo que hacemos es enviar la actualización y pedir que invalide la consulta con la lista de _items_.

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
- import { useTodoListQuery } from "./todo-query";
+ import { useTodoListQuery, useUpdateTodoItemMutation } from "./todo-query";
import classes from "./todo.page.css";
import { TodoItem } from "./todo.model";
import { TodoItemDisplay, TodoItemEdit } from "./components";
```

_./src/pages/todo/todo.page.tsx_

```diff
export const TodoPage: React.FC = () => {
+ const handleSaveSuccess = () => {
+  console.log("Update Success");
+ }

  const { data } = useTodoListQuery();
+ const updateMutation = useUpdateTodoItemMutation(handleSaveSuccess);
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleEnterEditMode = (id: number) => {
    setEditingId(id);
  };

  const handleUpdate = (item: TodoItem) => {
-    console.log("Save", item);
+   updateMutation.mutate(item);
    setEditingId(ReadOnlyMode);
  };
```

- Vamos a pedir ahora que se refresque la lista de _TODos_ cuando se actualice un _item_, para ello vamos a usar el método _invalidateQueries_ que nos ofrece _React Query_.

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
+ import { useQueryClient } from "@tanstack/react-query";
+ import { todoKeys } from "./todo-key-queries";
import { useTodoListQuery, useUpdateTodoItemMutation } from "./todo-query";
```

_./src/pages/todo/todo.page.tsx_

```diff
+ const queryClient = useQueryClient();

  const handleSaveSuccess = () => {
-    console.log("Update Success");
+  queryClient.invalidateQueries(todoKeys.todoList());
  };
```

- Si ejecutamos podemos verlo en acción (también podríamos haber añadido indicadores de carga, etc...).
- Vamos ahora al modo añadir un nuevo _ToDo_.

- Vamos a crear un _factory_ para crear _ToDo's_ vacios.

_./src/pages/todo/todo.model.ts_

```diff
export interface TodoItem {
  id: number;
  description: string;
  isDone: boolean;
}

+ export const createEmptyTodoItem = (): TodoItem => ({
+     id: 0,
+     description: "",
+     isDone: false,
+   });
```

Vamos a adaptar el componente de edición para que acepta el modo inserción.

Añadimos un poco de estilado:

_./src/pages/todo/todo.page.css_

```diff
.todo-list {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-gap: 1rem;
  margin: 1rem;
}

+ .append-container {
+  margin: 10px 0 10px 0
+ }
```

_./src/pages/todo/components/todo-item-edit.component.tsx_

```diff
import React from "react";
- import { TodoItem } from "../todo.model";
+ import { TodoItem, createEmptyTodoItem } from "../todo.model";

interface Props {
-  item: TodoItem;
+  item?: TodoItem;
  onSave: (item: TodoItem) => void;
  onCancel: () => void;
}
```

_./src/pages/todo/components/todo-item-edit.component.tsx_

```diff
+ const itemOrDefault = (item : TodoItem) => (item) ?
+  { ...item }
+ :
+ createEmptyTodoItem();

export const TodoItemEdit: React.FC<Props> = (props: Props) => {
  const { item, onSave, onCancel } = props;
-  const [editItem, setEditItem] = React.useState({ ...item });
+  const [editItem, setEditItem] = React.useState(itemOrDefault(item));
```

Y vamos a crear el _markup_ en la página, lo que hacemos aquí:

- Si no estamos en modo inserción mostramos un botón para entrar en dicho modo.
- Una vez que estamos en modo inserción ocultamos el botón anterior y
  mostramos el componente para editar todos, no le pasamos ningún _item_, ya
  que este es nuevo y recogemos el resultado, en caso de cancelar pasamos
  a modo _ReadOnly_.

_./src/pages/todo/todo.page.tsx_

```diff
      </div>
+      <div className={classes.appendContainer}>
+        {editingId !== AppendMode ? (
+          <button onClick={() => setEditingId(AppendMode)}>
+            Enter Insert New Item Node
+          </button>
+        ) : (
+          <div className={classes.todoList}>
+            <TodoItemEdit
+              onSave={() => console.log("Insert item")}
+              onCancel={() => setEditingId(ReadOnlyMode)}
+            />
+          </div>
+        )}
+      </div>
      <Link to="/list">To List</Link>
    </>
  );
```

> Esto se podía refactorizar y encapsularlo en un componente
> intermedio.

Nos queda hacer el insert real, vamos a por la api:

_./src/pages/todo/todo.api.ts_

```diff
export const updateTodoItem = async (item: TodoItem): Promise<TodoItem> => {
  const response = await fetch(`http://localhost:3000/todos/${item.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  const data = await response.json();
  return data;
};

+ export const appendTodoItem = async (item: TodoItem): Promise<TodoItem> => {
+  const response = await fetch(`http://localhost:3000/todos`, {
+    method: "POST",
+    headers: {
+      "Content-Type": "application/json",
+    },
+    body: JSON.stringify(item),
+  });
+
+  const data = await response.json();
+  return data;
+}
```

Y a por la mutación:

_./src/pages/todo/todo-query.tsx_

```diff
import { useQuery, useMutation } from "@tanstack/react-query";
- import { getTodoList, updateTodoItem } from "./todo.api";
+ import { getTodoList, updateTodoItem, appendTodoItem } from "./todo.api";
import { TodoItem } from "./todo.model";
import { todoKeys } from "./todo-key-queries";
```

_./src/pages/todo/todo-query.tsx_

```diff
export const useUpdateTodoItemMutation = (onSuccessFn: () => void) => {
  return useMutation(updateTodoItem, {
    onSuccess: () => onSuccessFn(),
  });
};

+ export const useAppendTodoItemMutation = (onSuccessFn: () => void) =>
+  useMutation(appendTodoItem, {onSuccess: () => onSuccessFn()});
```

Y lo añadimos a la página:

_./src/pages/todo/todo.page.tsx_

```diff
import React from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "./todo-key-queries";
- import { useTodoListQuery, useUpdateTodoItemMutation } from "./todo-query";
+ import { useTodoListQuery, useUpdateTodoItemMutation, useAppendTodoItemMutation } from "./todo-query";
import classes from "./todo.page.css";
```

_./src/pages/todo/todo.page.tsx_

```diff
  const { data } = useTodoListQuery();
  const updateMutation = useUpdateTodoItemMutation(handleSaveSuccess);
+ const appendMutation = useAppendTodoItemMutation(handleSaveSuccess);
  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleEnterEditMode = (id: number) => {
    setEditingId(id);
  };

  const handleUpdate = (item: TodoItem) => {
    updateMutation.mutate(item);
    setEditingId(ReadOnlyMode);
  };

+ const handleAppend = (item: TodoItem) => {
+   appendMutation.mutate(item);
+   setEditingId(ReadOnlyMode);
+ };
```

_./src/pages/todo/todo-page.tsx_

```diff
  <TodoItemEdit
-    onSave={() => console.log("Insert item")}
+    onSave={handleAppend}
    onCancel={() => setEditingId(ReadOnlyMode)}
  />
```

A este código le hace falta un refactor, tenemos mucho código y es complicado de leer, ¿Qué podemos plantear?

- A nivel de hooks, podemos sacar todo lo relacionado con _queries_ en un _hook_ que podríamos llamar _useTodoQueries_.
- A nivel de markup:
  - Crear un componente intermedio para mostrar/editar un item.
  - Crear un componente intermedio para entrar en modo _add_ o añadir
    un _item_.

Empezamos por el hook (de momento lo sacamos al mismo fichero):

_./src/pages/todo/todo-page.tsx_

```diff
+ const useTodoQueries = () => {
+  const queryClient = useQueryClient();
+  const handleSaveSuccess = () => {
+    queryClient.invalidateQueries(todoKeys.todoList());
+  };
+
+  const { data } = useTodoListQuery();
+  const updateMutation = useUpdateTodoItemMutation(handleSaveSuccess);
+  const appendMutation = useAppendTodoItemMutation(handleSaveSuccess);
+
+  return {
+    data,
+    updateMutation,
+    appendMutation,
+    handleSaveSuccess,
+  };
+};

export const TodoPage: React.FC = () => {
-  const queryClient = useQueryClient();

-  const handleSaveSuccess = () => {
-    queryClient.invalidateQueries(todoKeys.todoList());
-  };

-  const { data } = useTodoListQuery();
-  const updateMutation = useUpdateTodoItemMutation(handleSaveSuccess);
-  const appendMutation = useAppendTodoItemMutation(handleSaveSuccess);
+ const { data, updateMutation, appendMutation, handleSaveSuccess } = useTodoQueries();

  const [editingId, setEditingId] = React.useState(ReadOnlyMode);

  const handleEnterEditMode = (id: number) => {
    setEditingId(id);
  };

  const handleUpdate = (item: TodoItem) => {
    updateMutation.mutate(item);
    setEditingId(ReadOnlyMode);
  };

  const handleAppend = (item: TodoItem) => {
    appendMutation.mutate(item);
    setEditingId(ReadOnlyMode);
  };

  const handleCancel = () => {
    setEditingId(ReadOnlyMode);
  };

  return (
```

Ahora podemos decidir si sacar este _hook_ a un fichero aparte o no.

Si quisiéramos podríamos sacar los _handlers_ a otro _hook_ o incluso incluirlo en el _hook_ de _queries_.

Vamos a por la parte de _markup_:

- Creamos un wrapper que se va a llamar _Todoitem_ y va a agrupar la lógica
  para mostrar uno u otro, así como ambos componentes:

_./src/pages/todo/components/todo-item.component.tsx_

```tsx
import React from "react";
import { TodoItem } from "../todo.model";
import { TodoItemEdit } from "./todo-item-edit.component";
import { TodoItemDisplay } from "./todo-item-display.component";

interface Props {
  editingId: number;
  todo: TodoItem;
  onEnterEditMode: (id: number) => void;
  onUpdate: (item: TodoItem) => void;
  onCancel: () => void;
}

export const TodoItemComponent: React.FC<Props> = (props: Props) => {
  const { todo, editingId, onEnterEditMode, onUpdate, onCancel } = props;

  return (
    <>
      {todo.id !== editingId ? (
        <TodoItemDisplay key={todo.id} item={todo} onEdit={onEnterEditMode} />
      ) : (
        <TodoItemEdit
          key={todo.id}
          item={todo}
          onSave={onUpdate}
          onCancel={onCancel}
        />
      )}
    </>
  );
};
```

- Lo añadimos al barrel de componentes:

_./src/pages/todo/components/index.ts_

```diff
- export * from "./todo-item-display.component";
- export * from "./todo-item-edit.component";
+ export * from "./todo-item.component";
```

- Refactorizamos _TodoPage_

_./src/pages/todo/todo-page.tsx_

```diff
import classes from "./todo.page.css";
import { TodoItem } from "./todo.model";
- import { TodoItemDisplay, TodoItemEdit } from "./components";
+ import { TodoItemComponent } from "./components";
```

_./src/pages/todo/todo-page.tsx_

```diff
      <div className={classes.todoList}>
        {data?.map((todo) =>
-          todo.id !== editingId ? (
-            <TodoItemDisplay
-              key={todo.id}
-              item={todo}
-              onEdit={handleEnterEditMode}
-            />
-          ) : (
-            <TodoItemEdit
-              key={todo.id}
-              item={todo}
-              onSave={handleUpdate}
-              onCancel={handleCancel}
-            />
-          )
+          <TodoItemComponent
+            key={todo.id}
+            todo={todo}
+            editingId={editingId}
+            onEnterEditMode={handleEnterEditMode}
+            onUpdate={handleUpdate}
+            onCancel={handleCancel}
+          />
        )}
        )}
      </div>
```

Sacamos al _model_ las constantes de _ReadOnly_ y _AppendMode_.

_./src/pages/todo/todo.model.ts_

```diff
+ export const ReadOnlyMode = -1;
+ export const AppendMode = 0;

export interface TodoItem {
  id: number;
  description: string;
  isDone: boolean;
}

export const createEmptyTodoItem = (): TodoItem => ({
  id: 0,
  description: "",
  isDone: false,
});
```

Importamos y eliminamos la instancia local de _todo_ _page_:

_/.src/pages/todo/todo-page.tsx_

```diff
- import { TodoItem } from "./todo.model";
+ import { TodoItem, ReadOnlyMode, AppendMode } from "./todo.model";
import { TodoItemComponent } from "./components";

- const ReadOnlyMode = -1;
- const AppendMode = 0;
```

Vamos ahora a por el _Append_, tenemos que crear un fichero de CSS

_./src/pages/todo/components/todo-append.component.css_

```css
.todo-list {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-gap: 1rem;
  margin: 1rem;
}

.append-container {
  margin: 10px 0 10px 0;
}
```

_./src/todo/components/todo/components/todo-append.component.tsx_

```tsx
import React from "react";
import { TodoItem, AppendMode, ReadOnlyMode } from "../todo.model";
import { TodoItemEdit } from "./todo-item-edit.component";
import classes from "./todo-append.component.css";

interface Props {
  editingId: number;
  setAppendMode: () => void;
  onAppend: (item: TodoItem) => void;
  onCancel: () => void;
}

export const TodoAppendComponent: React.FC<Props> = (props: Props) => {
  const { editingId, setAppendMode, onAppend, onCancel } = props;

  return (
    <>
      {editingId !== AppendMode ? (
        <button onClick={setAppendMode}>Enter Insert New Item Node</button>
      ) : (
        <div className={classes.todoList}>
          <TodoItemEdit onSave={onAppend} onCancel={onCancel} />
        </div>
      )}
    </>
  );
};
```

- Lo añadimos al _barrel_:

_./src/pages/todo/components/index.ts_

```diff
export * from "./todo-item.component";
+ export * from "./todo-append.component";
```

- Vamos a importarlo y vamos a refactorizar la página:

_./src/pages/todo/todo-page.tsx_

```diff
import { TodoItem, ReadOnlyMode, AppendMode } from "./todo.model";
- import { TodoItemComponent } from "./components";
+ import { TodoItemComponent, TodoAppendComponent } from "./components";
```

_./src/pages/todo/todo-page.tsx_

```diff
      <div className={classes.appendContainer}>
-        {editingId !== AppendMode ? (
-          <button onClick={() => setEditingId(AppendMode)}>
-            Enter Insert New Item Node
-          </button>
-        ) : (
-          <div className={classes.todoList}>
-            <TodoItemEdit
-              onSave={handleAppend}
-              onCancel={() => setEditingId(ReadOnlyMode)}
-            />
-          </div>
-        )}
+        <TodoAppendComponent
+          editingId={editingId}
+          setAppendMode={() => setEditingId(AppendMode)}
+          onAppend={handleAppend}
+          onCancel={() => setEditingId(ReadOnlyMode)}
+        />
      </div>
      <Link to="/list">To List</Link>
    </>
  );
};
```

Ahora estamos en el punto en el que podemos o bien decidir que ya el código es lo suficientemente legible o podríamos seguir refactorizando.

En ese caso que se podría hacer para simplificar el fichero _todo.page_

- El _hook inline_ que hemos definido extraerlo a otro fichero.
- Crear un componente _TodoItemCollection_ (que incluye el _css container_)
- Meter el _Div_ _container_ del _Append_ dentro del componente.

Podrías quedar algo así como:

** Pseudocodigo **

```tsx
<>
  <h1>Todo Page</h1>
  <TodoItemCollection
    data={data}
    editingId={editingId}
    onEnterEditMode={handleEnterEditMode}
    onUpdate={handleUpdate}
    onCancel={handleCancel}
  />
  <TodoAppendComponent
    editingId={editingId}
    setAppendMode={() => setEditingId(AppendMode)}
    onAppend={handleAppend}
    onCancel={() => setEditingId(ReadOnlyMode)}
  />
</>
```

¿Merece la pena este refactor?

# EJERCICIO

Realiza la misma implementación pero para el endpoint de listas.

# Referencias

https://tanstack.com/query/v4/docs/guides/mutations
