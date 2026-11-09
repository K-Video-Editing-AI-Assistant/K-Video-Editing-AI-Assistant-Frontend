import { createBrowserRouter, Navigate } from 'react-router-dom';
import Upload from '@/pages/Upload/Upload';
import Analysis from '@/pages/Analysis/Analysis';
import Request from '@/pages/Request/Request';

// Each entry connects a URL path to a page
export const router = createBrowserRouter([
  // Visiting "/" sends the user straight to the first step
  { path: '/', element: <Navigate to='/upload' replace /> },
  { path: '/upload', element: <Upload /> },
  { path: '/analysis', element: <Analysis /> },
  { path: '/request', element: <Request /> },
]);
