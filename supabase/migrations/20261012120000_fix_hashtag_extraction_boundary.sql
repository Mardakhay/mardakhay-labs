-- Correct hashtag extraction for rows that were left without extracted tags.
-- The negative lookahead prevents accepting a 32-character prefix of a longer tag.
update public.prompts
set hashtags = coalesce(
  array(
    select tag
    from (
      select distinct lower(substring(match[2] from 1 for 32)) as tag
      from regexp_matches(
        content,
        '(^|\s)#([A-Za-z][A-Za-z0-9_-]{0,31})(?![A-Za-z0-9_-])',
        'g'
      ) as match
    ) extracted_tags
    order by tag
  ),
  '{}'::text[]
)
where hashtags = '{}'::text[];
