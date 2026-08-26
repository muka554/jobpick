# Google OAuth Display-Name Configuration

## Status

JobPick’s Google OAuth flow is active, but the Google account chooser currently identifies the destination using the Supabase project host. This label is not rendered by the JobPick website and cannot be changed safely in the public JavaScript or Supabase redirect configuration. It is controlled by the OAuth branding for the Google Cloud project that owns the OAuth client.

## Required update

A Google Cloud project owner should sign in to the project, then open **Google Auth Platform → Branding** and set the application name to the approved public name, such as **JobPick**. The home page and privacy-policy links should point to `https://jobpick20.com/` and its public privacy page. Google documents that the consent-screen configuration defines what users see for the OAuth application.[1]

The existing OAuth redirect URI and Supabase provider configuration must remain unchanged. Altering those items is not necessary to change the displayed app name and could interrupt the working sign-in callback.

## Verification

After the branding change has been saved, begin a new Google sign-in from JobPick. The account chooser should refer to the selected public application name rather than the raw Supabase project host. Do not select a Google account or complete a sign-in merely to test the text unless separately authorized.

## Reference

[1] [Google: Configure the OAuth consent screen and choose scopes](https://developers.google.com/workspace/guides/configure-oauth-consent)
