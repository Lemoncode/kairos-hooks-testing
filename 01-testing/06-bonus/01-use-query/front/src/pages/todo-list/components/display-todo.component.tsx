import React from "react";
import { TodoItem } from "../todo-list.vm";

interface Props {
  item: TodoItem;
  onEdit: (id: number) => void;
}

export const DisplayTodo: React.FC<Props> = (props : Props) => {
  const { item, onEdit } = props;

  return (
    <>
      <div>{item.isDone ? "✅" : "⭕️"}</div>
      <div>{item.description}</div>
      <div>
        <button onClick={() => onEdit(item.id)}>Edit</button>
      </div>
    </>
  );
};
