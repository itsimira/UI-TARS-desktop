import { Route, HashRouter as Router, Routes } from 'react-router';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';

import './styles/globals.css';
import { AuthInitializer } from '@renderer/components/Auth/AuthInitializer';

const Home = lazy(() => import('./pages/home'));
const Settings2 = lazy(() => import('./pages/settings/Settings'));
const Launcher = lazy(() => import('./pages/launcher'));
const Widget = lazy(() => import('./pages/widget'));
const Login = lazy(() => import('./pages/login'));

export default function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        }
      >
        <AuthInitializer>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings2 />} />
            <Route path="/launcher" element={<Launcher />} />
          </Routes>
        </AuthInitializer>

        <Routes>
          <Route path="/widget" element={<Widget />} />
        </Routes>
        <Toaster
          position="top-right"
          offset={{ top: '48px' }}
          mobileOffset={{ top: '48px' }}
        />
      </Suspense>
    </Router>
  );
}
