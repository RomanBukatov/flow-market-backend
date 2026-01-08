import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Редирект на логин, но запоминаем, откуда пришли (чтобы потом вернуть)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};