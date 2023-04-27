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
      <span>{item.isDone ? '✅' : '⭕️'}</span>
      <p>{item.description}</p>
      <button className={classes.editButton} onClick={() => onEdit(item.id)}>
        Edit
      </button>
    </>
  );
};
