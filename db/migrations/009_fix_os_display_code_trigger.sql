-- Safely share the automatic display-code trigger across row types.
CREATE OR REPLACE FUNCTION os_assign_display_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'users' AND to_jsonb(NEW)->>'display_code' IS NULL THEN
    NEW.display_code := os_next_display_code(NEW.account_type, NEW.created_at);
  ELSIF TG_TABLE_NAME = 'tasks' AND to_jsonb(NEW)->>'task_code' IS NULL THEN
    NEW.task_code := os_next_display_code('task', NEW.created_at);
  ELSIF TG_TABLE_NAME = 'promotions' AND NEW.promotion_type = 'public_promo' AND to_jsonb(NEW)->>'discount_display_code' IS NULL THEN
    NEW.discount_display_code := os_next_display_code('discount', NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;
