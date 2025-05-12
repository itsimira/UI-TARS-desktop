import { useLayoutEffect } from 'react';
import { ValidateResponse } from '@ui-tars/shared/types';
import { useUserStore } from '@renderer/store/user';
import { useNavigate } from 'react-router';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const store = useUserStore();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.api.auth.validate().then((data: ValidateResponse) => {
      if (data.valid) {
        store.setUser(data.user);
        navigate('/');
      } else {
        store.setUser(null);
        store.setToken(null);
        navigate('/login');
      }
    });
  }, [navigate, store.setUser, store.setToken]);

  return <>{children}</>;
}
