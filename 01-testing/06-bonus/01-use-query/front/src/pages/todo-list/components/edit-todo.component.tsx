import React from 'react';
import * as model from '../todo-list.model';
import classes from './edi-todo.module.css';

interface Props {
  item?: model.TodoItem;
  onSave: (item: model.TodoItem) => void;
  onCancel: () => void;
}

const itemOrDefault = (item: model.TodoItem) =>
  item ? { ...item } : model.createEmptyTodoItem();

export const EditTodo: React.FC<Props> = (props: Props) => {
  const { item, onSave, onCancel } = props;
  const [editItem, setEditItem] = React.useState(itemOrDefault(item));

  return (
    <>
      <label className={classes.done} htmlFor={`${item.id}`}>
        <input
          id={`${item.id}`}
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
