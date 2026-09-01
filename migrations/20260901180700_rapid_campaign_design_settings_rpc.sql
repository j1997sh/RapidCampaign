create or replace function public.org_admin_update_rapid_campaign_design(p_rollout uuid,p_branding jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.central_campaign_rollouts%rowtype;
begin
 select * into r from public.central_campaign_rollouts where id=p_rollout;
 if r.id is null or not public.is_org_global_admin(r.organisation_id) then raise exception 'Not authorised'; end if;
 update public.central_campaign_rollouts
 set package=jsonb_set(coalesce(package,'{}'::jsonb),'{branding}',coalesce(p_branding,'{}'::jsonb),true),updated_at=now()
 where id=p_rollout;
 update public.central_campaign_sites set branding=coalesce(p_branding,'{}'::jsonb),updated_at=now() where rollout_id=p_rollout;
 return jsonb_build_object('ok',true);
end $$;
grant execute on function public.org_admin_update_rapid_campaign_design(uuid,jsonb) to authenticated;
