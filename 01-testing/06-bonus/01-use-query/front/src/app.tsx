import './global.styles.css';
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TodoListPage } from '@/pages/todo-list';

export const queryClient = new QueryClient();
export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<TodoListPage />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
};
