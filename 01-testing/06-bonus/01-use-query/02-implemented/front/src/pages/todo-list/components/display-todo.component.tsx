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
      <span aria-hidden>{item.isDone ? '✅' : '⭕️'}</span>
      <span className="visually-hidden">
        {item.isDone ? 'Todo completed' : 'Pending todo'}
      </span>
      <span>{item.description}</span>
      <button className={classes.editButton} onClick={() => onEdit(item.id)}>
        Edit
      </button>
    </>
  );
};
