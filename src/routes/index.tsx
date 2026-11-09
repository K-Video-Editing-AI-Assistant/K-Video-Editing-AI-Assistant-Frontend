import { createBrowserRouter, Navigate } from 'react-router-dom';
import Upload from '@/pages/Upload/Upload';

// Each entry connects a URL path to a page
export const router = createBrowserRouter([
  // Visiting "/" sends the user straight to the first step
  { path: '/', element: <Navigate to='/upload' replace /> },
  { path: '/upload', element: <Upload /> },
]);
