/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Portal } from './pages/Portal';
import { Admin } from './pages/Admin';
import { Group } from './pages/Group';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/portal/admin" element={<Admin />} />
          <Route path="/portal/group/:groupId" element={<Group />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
