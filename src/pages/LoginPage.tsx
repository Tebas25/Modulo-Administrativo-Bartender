import { FloatingInput } from '../components/FloatingLabel.component';
import { Button } from '../components/Button.component';
import barImage from '../assets/bar_image.jpg';
import { useLoginForm } from '../hooks/useLoginForm';

export default function LoginScreen() {
  const { handleSubmitLogin, isLoading, error, clearError, register, errors } =
    useLoginForm();
  return (
    <div className="bg-bar-950 flex min-h-screen w-full">
      {/* Panel del formulario */}
      <div className="bg-bar-900 relative z-10 flex w-full flex-col justify-center px-8 py-12 md:w-[45%] md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="text-steel-300 mb-2 text-4xl font-bold lg:text-5xl">
            Panel de administrador
          </h1>
          <h2 className="text-steel-300 mb-6 text-3xl font-bold lg:text-4xl">
            Rony Bartender
          </h2>
          <p className="text-gold-500 mb-14 text-lg font-bold">
            Ingrese sus credenciales
          </p>

          <form className="space-y-10" onSubmit={handleSubmitLogin}>
            <div className="space-y-10">
              <FloatingInput
                label="Correo"
                type="email"
                helperText={errors.email?.message}
                status={errors.email || error ? 'error' : 'default'}
                {...register('email', {
                  required: 'Ingrese su Correo Electrónico',
                  onChange: clearError,
                })}
              />
              <FloatingInput
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                helperText={errors.password?.message}
                status={errors.password || error ? 'error' : 'default'}
                {...register('password', {
                  required: 'Ingrese su contraseña',
                  onChange: clearError,
                })}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>

      {/* Panel de imagen */}
      <div className="relative hidden md:block md:w-[55%]">
        <img
          src={barImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="bg-bar-950/40 absolute inset-0" />
      </div>
    </div>
  );
}
