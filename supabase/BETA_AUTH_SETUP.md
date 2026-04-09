# Beta Auth Setup

## 1. Apply SQL
- Run `supabase/01_auth_hardening.sql` in the Supabase SQL editor.
- This truncates `posts`, `comments`, and `user_coupons`, then re-enables RLS with minimum policies.
- Then run `supabase/02_community_engagement.sql`.
- This creates persistent tables for cross-user comments/likes on both real posts and seeded sample posts.
- If you already ran an older version of that SQL, run the latest file again so `authenticated` grants are applied to `community_comments` and `post_likes`.

## 2. Create invited users
- In Supabase Dashboard, create each beta user in `Authentication > Users`.
- Use the invited user's real email as the login ID.
- Set a temporary password and share it manually.
- Mark the email as confirmed before handing over the account if you do not want an email verification step.

## 3. Required metadata
- Add this to `user_metadata` for each user:
```json
{
  "display_name": "홍길동 사장님",
  "role": "owner"
}
```
- `display_name` is used both in the UI and in the RLS insert/update checks for `posts` and `comments`.
- For expert accounts, use:
```json
{
  "display_name": "전문가 김OO",
  "role": "expert"
}
```

## 4. Verify after setup
- Anonymous user can submit `waitlist`, but cannot read it.
- Unauthenticated users cannot read `posts`, `comments`, or `user_coupons`.
- Authenticated users can read community posts/comments.
- Authenticated users can only insert/update/delete rows where `author_id = auth.uid()`.
- Authenticated users can only read coupons where `user_id = auth.uid()`.
- Authenticated users can read `community_comments` and `post_likes`, but only write/delete their own rows.

## 5. Known follow-up
- `coupon-images` is still treated as a public bucket in the current frontend.
- XSS filtering and CSP/header hardening are not part of this patch.
