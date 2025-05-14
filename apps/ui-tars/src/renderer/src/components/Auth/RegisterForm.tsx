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
import { SignUpResponse } from '@ui-tars/shared/types';
import { useNavigate } from 'react-router';

interface RegisterFormProps {
  toLogin: () => void;
}

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export const RegisterForm: FunctionComponent<RegisterFormProps> = ({
  toLogin,
}) => {
  const { setUser, setToken } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    // @ts-ignore
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      const userData: SignUpResponse = await window.api.auth.signup({
        email: data.email,
        password: data.password,
      });

      setUser(userData.user);
      setToken(userData.token);

      navigate('/');
    } catch (err) {
      console.error('Signup failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <Form {...form}>
        <form
          id="signup"
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
                    autoComplete="new-password"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="new-password"
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

      <div className="flex items-center justify-center">
        <span className="text-sm">
          {`Already have account?`}{' '}
          <Button onClick={toLogin} variant="link" className="text-sm">
            Sign In
          </Button>
        </span>
      </div>

      <div className="flex flex-col items-center space-y-4 pt-2"></div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button form="signup" type="submit">
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );
};
