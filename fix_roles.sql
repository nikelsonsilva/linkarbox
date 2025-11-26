-- =========================================================
-- SCRIPT PARA CORRIGIR ROLES E ATUALIZAR TRIGGER
-- =========================================================

-- 1. Atualizar todas as contas existentes para 'architect'
--    (você pode modificar isso para atualizar apenas contas específicas)
UPDATE public.profiles 
SET role = 'architect' 
WHERE role = 'client';

-- 2. Recriar a função do trigger com a correção
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'role', 'client')  -- Pega o role dos metadados, ou 'client' se não existir
  );
  RETURN new;
END;
$$;

-- 3. Verificar os roles atualizados
SELECT id, email, display_name, role 
FROM public.profiles 
ORDER BY created_at DESC;
