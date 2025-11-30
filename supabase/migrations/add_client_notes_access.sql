-- =========================================================
-- ATUALIZAÇÃO: PERMITIR CLIENTES ACESSAREM NOTAS
-- =========================================================
-- Esta migration adiciona políticas RLS para permitir que clientes
-- vejam e criem notas em arquivos compartilhados com eles

-- =========================================================
-- POLÍTICAS RLS ADICIONAIS - FILE_NOTES (PARA CLIENTES)
-- =========================================================

-- Clientes podem ver notas de arquivos compartilhados com eles
CREATE POLICY "Clients can view notes on shared files"
ON public.file_notes
FOR SELECT
USING (
  -- Cliente pode ver se o arquivo está compartilhado com ele
  EXISTS (
    SELECT 1 FROM public.file_registry fr
    INNER JOIN public.shared_files sf ON sf.cloudfileid = fr.cloud_file_id
    WHERE fr.id = file_notes.file_registry_id
    AND sf.client_id = auth.uid()
  )
);

-- Clientes podem criar notas em arquivos compartilhados com eles
CREATE POLICY "Clients can create notes on shared files"
ON public.file_notes
FOR INSERT
WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.file_registry fr
    INNER JOIN public.shared_files sf ON sf.cloudfileid = fr.cloud_file_id
    WHERE fr.id = file_notes.file_registry_id
    AND sf.client_id = auth.uid()
  )
);

-- =========================================================
-- POLÍTICAS RLS ADICIONAIS - FILE_REGISTRY (PARA CLIENTES)
-- =========================================================

-- Clientes podem ver file_registry de arquivos compartilhados
CREATE POLICY "Clients can view registry of shared files"
ON public.file_registry
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shared_files sf
    WHERE sf.cloudfileid = file_registry.cloud_file_id
    AND sf.client_id = auth.uid()
  )
);

-- Clientes podem criar file_registry para arquivos compartilhados
-- (necessário quando cliente cria primeira nota em arquivo compartilhado)
CREATE POLICY "Clients can create registry for shared files"
ON public.file_registry
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shared_files sf
    WHERE sf.cloudfileid = file_registry.cloud_file_id
    AND sf.client_id = auth.uid()
    AND sf.architect_id = file_registry.architect_id
  )
);
