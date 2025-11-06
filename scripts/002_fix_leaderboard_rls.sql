-- Corrigir a RLS policy para permitir leitura de atividades de outros usuários
-- Remover a política restrictiva anterior
drop policy if exists "activity_logs_select_own" on public.activity_logs;

-- Criar nova política que permite todos verem todos os activity logs (necessário para o ranking)
create policy "activity_logs_select_all" on public.activity_logs for select using (true);

-- Refreshar a visão materializada para atualizar rankings
refresh materialized view public.leaderboard;
