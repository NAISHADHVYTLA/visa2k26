-- Add UPDATE policy for saved_cards table
CREATE POLICY "Users can update their own saved cards"
  ON public.saved_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);