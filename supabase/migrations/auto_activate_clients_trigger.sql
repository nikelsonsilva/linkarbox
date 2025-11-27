-- Trigger para atualizar automaticamente o status do cliente quando ele se registra
-- Este trigger será executado sempre que um novo usuário for criado no auth.users

-- Primeiro, criar a função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.auto_activate_client()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o cliente correspondente para 'active' quando um usuário auth for criado
    UPDATE public.clients
    SET 
        status = 'active',
        registered_at = COALESCE(registered_at, NOW()),
        invite_token = NULL
    WHERE email = NEW.email
    AND status = 'pending';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover o trigger se já existir
DROP TRIGGER IF EXISTS on_auth_user_created_activate_client ON auth.users;

-- Criar o trigger que executa após inserção na tabela auth.users
CREATE TRIGGER on_auth_user_created_activate_client
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_activate_client();

-- Também atualizar clientes que já se registraram mas ainda estão como pending
UPDATE public.clients
SET 
    status = 'active',
    registered_at = COALESCE(registered_at, NOW()),
    invite_token = NULL
WHERE status = 'pending'
AND email IN (
    SELECT email FROM auth.users
);

-- Verificar resultado
SELECT 
    id,
    name,
    email,
    status,
    registered_at,
    invite_sent_at
FROM public.clients
ORDER BY created_at DESC;
