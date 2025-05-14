import { useLayoutEffect } from 'react';
import { ValidateResponse } from '@ui-tars/shared/types';
import { useUserStore } from '@renderer/store/user';
import { useNavigate, useLocation } from 'react-router';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const store = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    window.api.auth.validate().then((data: ValidateResponse) => {
      if (data.valid) {
        store.setUser(data.user);

        if (['/login', '/signup'].includes(location.pathname)) {
          navigate('/', { replace: true });
        }
      } else {
        store.setUser(null);
        store.setToken(null);
        navigate('/login');
      }
    });
  }, [location.pathname, navigate, store.setUser, store.setToken]);

  return <>{children}</>;
}
