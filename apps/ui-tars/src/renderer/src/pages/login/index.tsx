import { LoginForm } from '@renderer/components/Auth/LoginForm';
import logo from '@resources/logo-full.png?url';
import { useState } from 'react';
import { RegisterForm } from '@renderer/components/Auth/RegisterForm';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-6">
          {/* App Logo */}
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800 to-black shadow-lg">
            <img src={logo} alt="logo" className="h-20" />
          </div>

          {/* App Name */}
          <h1 className="text-5xl font-bold tracking-tight">Pretendic</h1>

          <p className="text-center text-lg text-zinc-800">
            {activeTab === 'login'
              ? 'Sign in with your account to start automating your tasks'
              : 'Create a new account to get started with Pretendic'}
          </p>
        </div>

        <div className="mt-8">
          {activeTab === 'login' ? (
            <LoginForm toSignup={() => setActiveTab('signup')} />
          ) : (
            <RegisterForm toLogin={() => setActiveTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
