-- =========================================================
-- SISTEMA DE NOTES - FILE REGISTRY E FILE NOTES
-- =========================================================

-- 1. Criar tabela file_registry (registra arquivos anotados)
CREATE TABLE IF NOT EXISTS public.file_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  architect_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  cloud_provider TEXT CHECK (cloud_provider IN ('google', 'dropbox')),
  cloud_file_id TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que cada arquivo do cloud seja único por arquiteto
  UNIQUE(architect_id, cloud_file_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_file_registry_architect ON public.file_registry(architect_id);
CREATE INDEX IF NOT EXISTS idx_file_registry_cloud_file ON public.file_registry(cloud_file_id);

-- 2. Criar tabela file_notes (armazena notas dos arquivos)
CREATE TABLE IF NOT EXISTS public.file_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_registry_id UUID REFERENCES public.file_registry(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_file_notes_file_registry ON public.file_notes(file_registry_id);
CREATE INDEX IF NOT EXISTS idx_file_notes_author ON public.file_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_file_notes_is_read ON public.file_notes(is_read);

-- =========================================================
-- TRIGGERS PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =========================================================

-- Trigger para file_registry
CREATE OR REPLACE FUNCTION public.handle_file_registry_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER file_registry_updated_at
BEFORE UPDATE ON public.file_registry
FOR EACH ROW
EXECUTE FUNCTION public.handle_file_registry_updated_at();

-- Trigger para file_notes
CREATE OR REPLACE FUNCTION public.handle_file_notes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER file_notes_updated_at
BEFORE UPDATE ON public.file_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_file_notes_updated_at();

-- =========================================================
-- ATIVAR RLS (ROW LEVEL SECURITY)
-- =========================================================

ALTER TABLE public.file_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_notes ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- POLÍTICAS RLS - FILE_REGISTRY
-- =========================================================

-- Arquitetos podem ver apenas seus próprios arquivos registrados
CREATE POLICY "Architects can view their own registered files"
ON public.file_registry
FOR SELECT
USING (architect_id = auth.uid());

-- Arquitetos podem inserir seus próprios arquivos
CREATE POLICY "Architects can insert their own registered files"
ON public.file_registry
FOR INSERT
WITH CHECK (architect_id = auth.uid());

-- Arquitetos podem atualizar seus próprios arquivos
CREATE POLICY "Architects can update their own registered files"
ON public.file_registry
FOR UPDATE
USING (architect_id = auth.uid());

-- Arquitetos podem deletar seus próprios arquivos
CREATE POLICY "Architects can delete their own registered files"
ON public.file_registry
FOR DELETE
USING (architect_id = auth.uid());

-- =========================================================
-- POLÍTICAS RLS - FILE_NOTES
-- =========================================================

-- Usuários podem ver notas de arquivos que pertencem a eles
CREATE POLICY "Users can view notes on their files"
ON public.file_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.file_registry
    WHERE file_registry.id = file_notes.file_registry_id
    AND file_registry.architect_id = auth.uid()
  )
);

-- Usuários podem criar notas em seus arquivos
CREATE POLICY "Users can create notes on their files"
ON public.file_notes
FOR INSERT
WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.file_registry
    WHERE file_registry.id = file_notes.file_registry_id
    AND file_registry.architect_id = auth.uid()
  )
);

-- Usuários podem atualizar suas próprias notas
CREATE POLICY "Users can update their own notes"
ON public.file_notes
FOR UPDATE
USING (author_id = auth.uid());

-- Usuários podem deletar suas próprias notas
CREATE POLICY "Users can delete their own notes"
ON public.file_notes
FOR DELETE
USING (author_id = auth.uid());
