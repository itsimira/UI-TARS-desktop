import { FunctionComponent, useState } from 'react';
import { Input } from '@renderer/components/ui/input';
import { Button } from '@renderer/components/ui/button';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@renderer/components/ui/form';
import { useUserStore } from '@renderer/store/user';
import { LoginResponse } from '@ui-tars/shared/types';
import { useNavigate } from 'react-router';

interface LoginFormProps {
  toSignup: () => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: FunctionComponent<LoginFormProps> = ({ toSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useUserStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();

  const form = useForm<LoginFormValues>({
    // @ts-ignore
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const userData: LoginResponse = await window.api.auth.login(data);

      setUser(userData.user);
      setToken(userData.token);

      navigate('/');
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <Form {...form}>
        <form
          id="login"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    className="h-12 bg-zinc-100 border-0 placeholder:text-zinc-400 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    className="h-12 bg-zinc-100 border-0 placeholder:text-zinc-400 shadow-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="flex flex-col items-center space-y-4 pt-2">
        <span className="text-sm text-destructive">{error}</span>
      </div>

      <div className="flex items-center justify-center">
        <span className="text-sm">
          {`Don't have an account?`}{' '}
          <Button onClick={toSignup} variant="link" className="text-sm">
            Sign Up
          </Button>
        </span>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button form={'login'} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </div>
  );
};
