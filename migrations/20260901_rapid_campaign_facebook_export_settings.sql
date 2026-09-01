create or replace function public.org_admin_update_facebook_export_settings(p_rollout uuid,p_settings jsonb)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare v_org uuid;
begin
  select organisation_id into v_org from public.central_campaign_rollouts where id=p_rollout;
  if v_org is null or not public.is_org_global_admin(v_org) then raise exception 'Not authorised'; end if;
  update public.central_campaign_rollouts
  set package = coalesce(package,'{}'::jsonb) || jsonb_build_object('facebook_export',coalesce(p_settings,'{}'::jsonb)),
      updated_at = now()
  where id=p_rollout;
  return true;
end $$;
revoke execute on function public.org_admin_update_facebook_export_settings(uuid,jsonb) from public,anon;
grant execute on function public.org_admin_update_facebook_export_settings(uuid,jsonb) to authenticated;
