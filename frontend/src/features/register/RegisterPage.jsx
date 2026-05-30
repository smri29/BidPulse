import React from 'react';

import Reveal from '../../components/ui/Reveal';
import RegisterHero from './components/RegisterHero';
import RegisterForm from './components/RegisterForm';
import { useRegisterForm } from './useRegisterForm';

const RegisterPage = () => {
  const registerForm = useRegisterForm();

  return (
    <div className="min-h-screen bg-[#eef4fb] px-4 py-8 md:px-6 md:py-10">
      <Reveal className="mx-auto w-full max-w-5xl">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.78fr_1fr] lg:gap-7">
          <RegisterHero />
          <RegisterForm {...registerForm} />
        </div>
      </Reveal>
    </div>
  );
};

export default RegisterPage;
