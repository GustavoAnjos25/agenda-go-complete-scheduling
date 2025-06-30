
-- Criar enum para status dos agendamentos
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled');

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- duração em minutos
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver e editar seu próprio perfil" 
  ON public.profiles 
  USING (auth.uid() = id);

-- Políticas RLS para services (todos podem ver, só admins podem modificar)
CREATE POLICY "Todos podem ver serviços" 
  ON public.services 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar serviços" 
  ON public.services 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Políticas RLS para clients
CREATE POLICY "Usuários podem gerenciar seus próprios clientes" 
  ON public.clients 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Políticas RLS para appointments
CREATE POLICY "Usuários podem gerenciar seus próprios agendamentos" 
  ON public.appointments 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir alguns serviços de exemplo
INSERT INTO public.services (name, description, duration, price) VALUES
('Corte de Cabelo', 'Corte de cabelo masculino/feminino', 30, 25.00),
('Manicure', 'Cuidados com as unhas das mãos', 45, 20.00),
('Pedicure', 'Cuidados com as unhas dos pés', 60, 25.00),
('Escova', 'Escova modeladora', 40, 30.00),
('Barba', 'Corte e aparação de barba', 20, 15.00);
