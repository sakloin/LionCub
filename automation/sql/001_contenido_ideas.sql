-- ============================================================
-- 001_contenido_ideas.sql
-- Ideas de contenido generadas por IA o manualmente.
-- Estado: nueva → aprobada → publicada | descartada
-- Aplica RLS; sin política anon/authenticated → solo service-role.
-- Idempotente: usa IF NOT EXISTS / DO $$ EXCEPTION WHEN …
-- ============================================================

CREATE TABLE IF NOT EXISTS contenido_ideas (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fuente              text        NOT NULL,   -- 'ai' | 'manual' | 'tendencia'
  referente_url       text,                   -- URL de inspiración opcional
  red_objetivo        text        NOT NULL,   -- 'instagram' | 'tiktok' | 'facebook' | 'youtube'
  tipo_pieza          text        NOT NULL,   -- 'carrusel' | 'historia' | 'reel' | 'post'
  producto_categoria  text,
  formato             text,                   -- 'feed' | 'stories' | 'reel' | 'short'
  hook                text,                   -- texto de gancho
  idea_adaptacion     text,                   -- descripción completa de la idea
  estado              text        NOT NULL DEFAULT 'nueva',
  asset_url           text,                   -- URL en bucket 'contenido' tras generar
  post_id_externo     text,                   -- ID del post en la plataforma tras publicar
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- RLS activado; sin políticas = solo service-role puede leer/escribir
ALTER TABLE contenido_ideas ENABLE ROW LEVEL SECURITY;

-- Índice para filtrado por estado y red
CREATE INDEX IF NOT EXISTS idx_contenido_ideas_estado ON contenido_ideas (estado);
CREATE INDEX IF NOT EXISTS idx_contenido_ideas_red ON contenido_ideas (red_objetivo);
