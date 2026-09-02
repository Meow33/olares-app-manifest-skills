# Olares terminology for app manifests

Use a repository-provided approved glossary and non-translatable list when available; they are the maintained source of truth. These bundled rules provide the minimum safe baseline when those files are unavailable.

## Keep in English

- `Olares`
- `Olares OS`
- `Olares ID`
- `Olares Space`
- `LarePass`
- `Vault`
- `Profile`
- `Studio`
- `Wise`

Keep fixed technical spellings such as `Wi-Fi`, `CPU`, `GPU`, `API`, `HTTP`, `JSON`, `YAML`, `IPv4`, `IPv6`, `DNS`, and `GiB`.

Replace the legacy Olares product name `Terminus` in user-visible source copy unless the text intentionally refers to historical software, a package identifier, path, or API value.

## Localize when visible to users

Olares built-in app names are not protected brand terms. Translate them according to the approved target-locale glossary when they refer to the visible app or navigation destination:

- `Desktop`
- `Market`
- `Files`
- `Settings`
- `Control Hub`
- `Dashboard`

Do not translate the same words when they occur inside a path, command, API identifier, code span, or upstream product name.

## Context-sensitive terms

- In zh-CN, use `账户` for an account as a product object. Use `账号` for a login identifier or established credential-oriented wording.
- Translate the Olares `Files` app as `文件管理器` in zh-CN. Use `文件` for ordinary files.
- Use `登录` / `退出登录` for `Log in` / `Log out`; keep the English source terminology consistent rather than switching to `Sign in` / `Sign out`.
- Use `Security`, not `Safety`, for the Olares settings category concerning passwords, biometrics, and Vault.

If a manifest uses one of these terms outside its normal product context, inspect the surrounding sentence rather than applying a mechanical replacement.
