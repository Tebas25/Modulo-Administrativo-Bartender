import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { LoginDTO } from '../types/auth.dto';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const hookForm = useForm<LoginDTO>({ mode: 'onChange' });

  const handleSubmitLogin = hookForm.handleSubmit(
    async (formData: LoginDTO) => {
      try {
        setError('');
        setLoading(true);
        await login(formData);
        navigate('/home', { replace: true });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo iniciar sesión. Intenta de nuevo.',
        );
      } finally {
        setLoading(false);
      }
    },
  );

  const clearError = () => setError('');

  return {
    handleSubmitLogin,
    isLoading,
    error,
    clearError,
    register: hookForm.register,
    errors: hookForm.formState.errors,
  };
};
