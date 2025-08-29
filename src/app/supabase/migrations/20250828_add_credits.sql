-- Tabla de créditos por usuario
create table if not exists public.usage_credits(
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.usage_credits enable row level security;

-- Políticas RLS: el usuario ve/actualiza SOLO su fila
create policy "select_own_credits"
  on public.usage_credits
  for select
  using (auth.uid() = user_id);

create policy "update_own_credits"
  on public.usage_credits
  for update
  using (auth.uid() = user_id);

-- Insert normalmente lo hará el service role (webhook). Pero por si acaso:
create policy "insert_self_row"
  on public.usage_credits
  for insert
  with check (auth.uid() = user_id);

-- Trigger para crear fila de créditos=0 al registrarse
create or replace function public.handle_new_user_credits()
returns trigger as $$
begin
  insert into public.usage_credits(user_id, credits)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.handle_new_user_credits();


create or replace function public.increment_credits_safe(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.usage_credits(user_id, credits) values (p_user_id, p_amount)
  on conflict (user_id) do update set credits = public.usage_credits.credits + excluded.credits,
  updated_at = now();
end;
$$;
-- Devuelve remaining
create or replace function public.consume_one_credit(p_user_id uuid)
returns table(remaining int)
language plpgsql
security definer
as $$
begin
  update public.usage_credits
  set credits = credits - 1,
      updated_at = now()
  where user_id = p_user_id
    and credits >= 1;

  if NOT FOUND then
    remaining := -1;
    return;
  end if;

  select credits into remaining from public.usage_credits where user_id = p_user_id;
  return;
end;
$$;
