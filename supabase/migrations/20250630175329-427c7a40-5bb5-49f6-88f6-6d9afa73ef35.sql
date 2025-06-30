
-- Criar tabela de profissionais
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  specialties TEXT[],
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de disponibilidade dos profissionais
CREATE TABLE public.professional_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 1=segunda, etc
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de serviços por profissional
CREATE TABLE public.professional_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(professional_id, service_id)
);

-- Adicionar campos faltantes na tabela appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS check_in_status TEXT DEFAULT 'pending';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para professionals
CREATE POLICY "Usuários podem gerenciar seus próprios dados profissionais" 
  ON public.professionals 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Todos podem ver profissionais ativos" 
  ON public.professionals 
  FOR SELECT 
  USING (status = 'active');

-- Políticas RLS para professional_availability
CREATE POLICY "Profissionais podem gerenciar sua disponibilidade" 
  ON public.professional_availability 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals 
      WHERE id = professional_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Todos podem ver disponibilidade de profissionais" 
  ON public.professional_availability 
  FOR SELECT 
  USING (true);

-- Políticas RLS para professional_services
CREATE POLICY "Profissionais podem gerenciar seus serviços" 
  ON public.professional_services 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals 
      WHERE id = professional_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Todos podem ver serviços de profissionais" 
  ON public.professional_services 
  FOR SELECT 
  USING (true);

-- Inserir alguns profissionais de exemplo
INSERT INTO public.professionals (user_id, name, specialties, phone, email) 
SELECT id, name, ARRAY['Corte', 'Barba'], phone, email 
FROM public.profiles 
WHERE NOT EXISTS (SELECT 1 FROM public.professionals WHERE user_id = profiles.id)
LIMIT 1;

-- Inserir disponibilidade padrão (segunda a sexta, 8h às 18h)
INSERT INTO public.professional_availability (professional_id, day_of_week, start_time, end_time)
SELECT p.id, generate_series(1, 5), '08:00:00', '18:00:00'
FROM public.professionals p
WHERE NOT EXISTS (
  SELECT 1 FROM public.professional_availability 
  WHERE professional_id = p.id
);

-- Associar todos os serviços aos profissionais existentes
INSERT INTO public.professional_services (professional_id, service_id)
SELECT p.id, s.id
FROM public.professionals p
CROSS JOIN public.services s
WHERE NOT EXISTS (
  SELECT 1 FROM public.professional_services ps
  WHERE ps.professional_id = p.id AND ps.service_id = s.id
);
