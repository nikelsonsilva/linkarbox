-- Script para corrigir status de clientes que já se registraram
-- mas ainda aparecem como "pending"

-- Atualizar clientes que têm email registrado no auth.users para status "active"
UPDATE clients
SET 
  status = 'active',
  registered_at = COALESCE(registered_at, NOW()),
  invite_token = NULL
WHERE status = 'pending'
AND email IN (
  SELECT email FROM auth.users
);

-- Ver resultado
SELECT 
  id,
  name,
  email,
  status,
  registered_at,
  invite_sent_at
FROM clients
ORDER BY created_at DESC;
