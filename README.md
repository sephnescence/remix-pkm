# fontawesome / webawesome

This project will be using paid features from fontawesome and webawesome. You will have to configure your `.env`'s `FONTAWESOME_PACKAGE_TOKEN` value accordingly

# Notes

Refer to https://github.com/kiliman/remix-flat-routes?tab=readme-ov-file#conventions for how to name route files

# Resetting your database

You can run `npx prisma db fresh`. Alternatively, you can run these queries in this order

```
truncate "PkmContents";
truncate "PkmEpiphany";
truncate "PkmInbox";
truncate "PkmPassingThought";
truncate "PkmTodo";
truncate "PkmTrash";
truncate "PkmVoid";
truncate "PkmImage";
delete from "PkmHistory";
delete from "Space";
delete from "Storey";
delete from "Suite";
delete from "User";
```

# Ensuring all data is accounted for

While developing, ensure that all Locations (Suites, Storeys, and Spaces), Items, Images, and Contents are accounted for. e.g. they're configured correctly and will appear against the right model, so Items, Images, and Contents appear against the correct owners

```
drop table if exists temp_all_data;
select count(*) from temp_all_data;
select * from temp_all_data;
create temp table temp_all_data as (
	select id::text, "createdAt", 'Suite' as "table" from "Suite"
	union all select id::text, "createdAt", 'Storey' as "table" from "Storey"
	union all select id::text, "createdAt", 'Space' as "table" from "Space"
	union all
	select 'i_h_' || history_id::text || '__m_' || model_id::text as id , "createdAt", 'PkmEpiphany' as "table" from "PkmEpiphany"
	union all select 'i_h_' || history_id::text || '__m_' || model_id::text as id , "createdAt", 'PkmInbox' as "table" from "PkmInbox"
	union all select 'i_h_' || history_id::text || '__m_' || model_id::text as id , "createdAt", 'PkmPassingThought' as "table" from "PkmPassingThought"
	union all select 'i_h_' || history_id::text || '__m_' || model_id::text as id , "createdAt", 'PkmTodo' as "table" from "PkmTodo"
	union all select 'i_h_' || history_id::text || '__m_' || model_id::text as id , "createdAt", 'PkmTrash' as "table" from "PkmTrash"
	union all select 'i_h_' || history_id::text || '__m_' || model_id::text as id , "createdAt", 'PkmVoid' as "table" from "PkmVoid"
	union all
	select 'h_' || history_id::text || '__m_' || model_id::text as id, "createdAt", 'PkmHistory' as "table" from "PkmHistory"
	union all
	select image_id::text as id, "createdAt", 'PkmImage' as "table" from "PkmImage"
	union all
	select id::text as id, "createdAt", 'PkmContents' as "table" from "PkmContents"
)

drop table if exists temp_all_data_accounted_for;
select count(*) from temp_all_data_accounted_for;
select * from temp_all_data_accounted_for;
create temp table temp_all_data_accounted_for as (
	select 'Suite Model' as "record_type", id::text as "record_id", "createdAt" as "record_created_at", 'Suite' as "model_type", id::text as "model_id" from "Suite"
	union all select 'Storey Model' as "record_type", id::text as "record_id", "createdAt" as "record_created_at", 'Storey' as "model_type", id::text as "model_id" from "Storey"
	union all select 'Space Model' as "record_type", id::text as "record_id", "createdAt" as "record_created_at", 'Space' as "model_type", id::text as "model_id" from "Space"
	union all
	select 'Suite ' || model_type as "record_type", 'i_h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where suite_id is not null and storey_id is null and space_id is null and model_type in ('PkmEpiphany', 'PkmInbox', 'PkmPassingThought', 'PkmTodo', 'PkmTrash', 'PkmVoid')
	union all select 'Storey ' || model_type as "record_type", 'i_h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where suite_id is not null and storey_id is not null and space_id is null and model_type in ('PkmEpiphany', 'PkmInbox', 'PkmPassingThought', 'PkmTodo', 'PkmTrash', 'PkmVoid')
	union all select 'Space ' || model_type as "record_type", 'i_h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where suite_id is null and storey_id is not null and space_id is not null and model_type in ('PkmEpiphany', 'PkmInbox', 'PkmPassingThought', 'PkmTodo', 'PkmTrash', 'PkmVoid')
	union all
	select 'Suite History' as "record_type", 'h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where model_type = 'SuiteContents'
	union all select 'Storey History' as "record_type", 'h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where model_type = 'StoreyContents'
	union all select 'Space History' as "record_type", 'h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where model_type = 'SpaceContents'
	union all select 'Suite ' || model_type || ' History' as "record_type", 'h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where suite_id is not null and storey_id is null and space_id is null and model_type in ('PkmEpiphany', 'PkmInbox', 'PkmPassingThought', 'PkmTodo', 'PkmTrash', 'PkmVoid')
	union all select 'Storey ' || model_type || ' History' as "record_type", 'h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where suite_id is not null and storey_id is not null and space_id is null and model_type in ('PkmEpiphany', 'PkmInbox', 'PkmPassingThought', 'PkmTodo', 'PkmTrash', 'PkmVoid')
	union all select 'Space ' || model_type || ' History' as "record_type", 'h_' || history_id::text || '__m_' || model_id::text as "record_id", "createdAt" as "record_created_at", "model_type", 'h_' || history_id::text || '__m_' || model_id::text as "model_id" from "PkmHistory" where suite_id is null and storey_id is not null and space_id is not null and model_type in ('PkmEpiphany', 'PkmInbox', 'PkmPassingThought', 'PkmTodo', 'PkmTrash', 'PkmVoid')
	union all
	select
		case
			when model_id in (select id from "Suite") then 'Suite Image'
--			when model_id = 'cfe57969-cf72-4b9d-a57d-8dafbd3690c2' then 'Default Suite'
			when model_id in (select id from "Storey") then 'Storey Image'
--			when model_id = '6294a0e5-ddff-49c6-b6b9-0d102808f770' then 'Default Storey'
			when model_id in (select id from "Space") then 'Space Image'
--			when model_id = 'daa94ddd-a090-488f-a3fb-caad7249bb0c' then 'Default Suite'
			when model_id in (select i.model_id from "PkmEpiphany" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmEpiphany Image'
			when model_id in (select i.model_id from "PkmEpiphany" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmEpiphany Image'
			when model_id in (select i.model_id from "PkmEpiphany" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmEpiphany Image'
			when model_id in (select i.model_id from "PkmInbox" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmInbox Image'
			when model_id in (select i.model_id from "PkmInbox" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmInbox Image'
			when model_id in (select i.model_id from "PkmInbox" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmInbox Image'
			when model_id in (select i.model_id from "PkmPassingThought" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmPassingThought Image'
			when model_id in (select i.model_id from "PkmPassingThought" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmPassingThought Image'
			when model_id in (select i.model_id from "PkmPassingThought" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmPassingThought Image'
			when model_id in (select i.model_id from "PkmTodo" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmTodo Image'
			when model_id in (select i.model_id from "PkmTodo" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmTodo Image'
			when model_id in (select i.model_id from "PkmTodo" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmTodo Image'
			when model_id in (select i.model_id from "PkmTrash" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmTrash Image'
			when model_id in (select i.model_id from "PkmTrash" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmTrash Image'
			when model_id in (select i.model_id from "PkmTrash" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmTrash Image'
			when model_id in (select i.model_id from "PkmVoid" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmVoid Image'
			when model_id in (select i.model_id from "PkmVoid" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmVoid Image'
			when model_id in (select i.model_id from "PkmVoid" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmVoid Image'
			when model_id in (select model_id from "PkmEpiphany") then 'Orphaned PkmEpiphany Image'
			when model_id in (select model_id from "PkmInbox") then 'Orphaned PkmInbox Image'
			when model_id in (select model_id from "PkmPassingThought") then 'Orphaned PkmPassingThought Image'
			when model_id in (select model_id from "PkmTodo") then 'Orphaned PkmTodo Image'
			when model_id in (select model_id from "PkmTrash") then 'Orphaned PkmTrash Image'
			when model_id in (select model_id from "PkmVoid") then 'Orphaned PkmVoid Image'
			else 'Orphaned Image'
		end as "record_type"
		, image_id::text as "record_id", "createdAt" as "record_created_at", 'Image' as "model_type", "model_id"::text
	from "PkmImage"
	union all
	select
		case
			when model_id in (select id from "Suite") then 'Suite Contents'
--			when model_id = 'cfe57969-cf72-4b9d-a57d-8dafbd3690c2' then 'Default Suite Contents'
			when model_id in (select id from "Storey") then 'Storey Contents'
--			when model_id = '6294a0e5-ddff-49c6-b6b9-0d102808f770' then 'Default Storey Contentsy'
			when model_id in (select id from "Space") then 'Space Contents'
--			when model_id = 'daa94ddd-a090-488f-a3fb-caad7249bb0c' then 'Default Suite Contents'
			when model_id in (select i.model_id from "PkmEpiphany" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmEpiphany Contents'
			when model_id in (select i.model_id from "PkmEpiphany" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmEpiphany Contents'
			when model_id in (select i.model_id from "PkmEpiphany" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmEpiphany Contents'
			when model_id in (select i.model_id from "PkmInbox" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmInbox Contents'
			when model_id in (select i.model_id from "PkmInbox" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmInbox Contents'
			when model_id in (select i.model_id from "PkmInbox" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmInbox Contents'
			when model_id in (select i.model_id from "PkmPassingThought" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmPassingThought Contents'
			when model_id in (select i.model_id from "PkmPassingThought" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmPassingThought Contents'
			when model_id in (select i.model_id from "PkmPassingThought" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmPassingThought Contents'
			when model_id in (select i.model_id from "PkmTodo" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmTodo Contents'
			when model_id in (select i.model_id from "PkmTodo" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmTodo Contents'
			when model_id in (select i.model_id from "PkmTodo" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmTodo Contents'
			when model_id in (select i.model_id from "PkmTrash" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmTrash Contents'
			when model_id in (select i.model_id from "PkmTrash" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmTrash Contents'
			when model_id in (select i.model_id from "PkmTrash" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmTrash Contents'
			when model_id in (select i.model_id from "PkmVoid" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is null and space_id is null) then 'Suite PkmVoid Contents'
			when model_id in (select i.model_id from "PkmVoid" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is not null and storey_id is not null and space_id is null) then 'Storey PkmVoid Contents'
			when model_id in (select i.model_id from "PkmVoid" i join "PkmHistory" h on h.history_id = i.history_id and h.model_id = i.model_id where suite_id is null and storey_id is not null and space_id is not null) then 'Space PkmVoid Contents'
			when model_id in (select model_id from "PkmEpiphany") then 'Orphaned PkmEpiphany Contents'
			when model_id in (select model_id from "PkmInbox") then 'Orphaned PkmInbox Contents'
			when model_id in (select model_id from "PkmPassingThought") then 'Orphaned PkmPassingThought Contents'
			when model_id in (select model_id from "PkmTodo") then 'Orphaned PkmTodo Contents'
			when model_id in (select model_id from "PkmTrash") then 'Orphaned PkmTrash Contents'
			when model_id in (select model_id from "PkmVoid") then 'Orphaned PkmVoid Contents'
			else 'Orphaned Contents'
		end as "record_type"
		, id::text as "record_id", "createdAt" as "record_created_at", 'Contents' as "model_type", "content_id"::text as "model_id"
	from "PkmContents"
--	select 'Contents' as "record_type", id::text as "record_id", "createdAt" as "record_created_at", 'Contents' as "model_type", "content_id"::text as "model_id" from "PkmContents"
	-- Should separate by location as well
)

select tad.id, *
from temp_all_data_accounted_for tadaf
left join temp_all_data tad on tad.id = tadaf.record_id
where tad.id is null;

select tadaf.record_id, tadaf.record_type, *
from temp_all_data tad
left join temp_all_data_accounted_for tadaf on tadaf.record_id = tad.id
where tadaf.record_id is null;

select * from temp_all_data_accounted_for where record_created_at > '2024-07-13 09:49:03.385'::timestamptz;

delete from "PkmContents" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmEpiphany" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmInbox" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmPassingThought" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmTodo" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmTrash" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmVoid" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmImage" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "PkmHistory" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "Space" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "Storey" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
delete from "Suite" where "createdAt" > '2024-07-13 09:49:03.385'::timestamptz;
```
