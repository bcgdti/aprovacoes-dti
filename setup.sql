-- ════════════════════════════════════════════════════════════════
-- dti · Aprovações de conteúdo — setup do banco no Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em Run.
-- ════════════════════════════════════════════════════════════════

-- 1. Tabela da equipe (adicione pessoas aqui sem mexer no código)
create table if not exists equipe (
  id serial primary key,
  nome text not null unique,
  email text,
  ativo boolean default true,
  ordem integer default 0
);

insert into equipe (nome, email, ordem) values
  ('Alice',    'alice.goncalves@dtidigital.com.br',  1),
  ('Aline',    'aline.mendes@dtidigital.com.br',     2),
  ('Bruna',    'bruna.alvim@dtidigital.com.br',      3),
  ('Luís',     'luis.soares@dtidigital.com.br',      4),
  ('Pedro',    'pedro.martino@dtidigital.com.br',    5),
  ('Henrique', 'henrique.abinajm@dtidigital.com.br', 6),
  ('Marcela',  'marcela.assis@dtidigital.com.br',    7);

-- 2. Tabela de configuração (URL do Teams, etc.)
create table if not exists config (
  chave text primary key,
  valor text default ''
);

insert into config (chave, valor) values
  ('apps_script_notify_url', 'https://script.google.com/macros/s/AKfycbwvUFBgcb6xw3AI9-pZ5NqImh4rPh7Xls4NujtbnpO7XmaK-cg5Jw2V8N5OdCo_UzNAPA/exec');

-- 3. Tabela principal de conteúdos
create table if not exists conteudos (
  id                   text primary key,
  data_envio           text,
  autor                text,
  canal                text,
  tipo_aprovacao       text,
  titulo               text,
  conteudo             text,
  link_midia           text    default '',
  status               text    default 'Aguardando aprovação',
  check_ia             boolean default false,
  aprovador            text,
  data_postagem        text    default '',
  comentarios          text    default '',
  data_decisao         text    default '',
  notas                jsonb   default '[]'::jsonb,
  versao_corrigida     text    default '',
  aprovador_secundario text    default '',
  parecer_secundario   text    default '',
  comentario_secundario text   default '',
  precisa_externa      boolean default false,
  contato_externo      text    default '',
  status_externo       text    default '',
  comentario_externo   text    default '',
  data_externa         text    default '',
  created_at           timestamptz default now()
);

-- 4. Segurança (RLS)
-- O acesso real é controlado pelo Cloudflare Access (login por e-mail).
-- Dentro do app, todos os usuários autenticados têm as mesmas permissões.
alter table conteudos enable row level security;
alter table equipe     enable row level security;
alter table config     enable row level security;

create policy "conteudos_select" on conteudos for select to anon using (true);
create policy "conteudos_insert" on conteudos for insert to anon with check (true);
create policy "conteudos_update" on conteudos for update to anon using (true) with check (true);
create policy "conteudos_delete" on conteudos for delete to anon using (true);

create policy "equipe_select"    on equipe  for select to anon using (true);
create policy "config_select"    on config  for select to anon using (true);
