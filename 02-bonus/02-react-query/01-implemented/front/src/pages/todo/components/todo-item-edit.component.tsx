import React from "react";
import { TodoItem, createEmptyTodoItem } from "../todo.model";

interface Props {
  item?: TodoItem;
  onSave: (item: TodoItem) => void;
  onCancel: () => void;
}

const itemOrDefault = (item: TodoItem) =>
  item ? { ...item } : createEmptyTodoItem();

export const TodoItemEdit: React.FC<Props> = (props: Props) => {
  const { item, onSave, onCancel } = props;
  const [editItem, setEditItem] = React.useState(itemOrDefault(item));

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
