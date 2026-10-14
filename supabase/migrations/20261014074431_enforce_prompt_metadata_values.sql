ALTER TABLE public.prompts
  ADD CONSTRAINT prompts_ai_target_check
    CHECK (ai_target IS NULL OR ai_target IN ('ChatGPT', 'Claude', 'Gemini', 'Grok')),
  ADD CONSTRAINT prompts_category_check
    CHECK (category IS NULL OR category IN ('Writing', 'Coding', 'Research', 'Image', 'Video', 'Marketing', 'Automation'));
