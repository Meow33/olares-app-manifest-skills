# Compact example

This example shows the desired level of detail. It is not a template whose facts may be reused for another app.

```yaml
metadata:
  title: Jellyfin
  description: A free, privacy-focused media server
spec:
  fullDescription: |
    Jellyfin lets you organize and stream personal media across supported devices. Use it for movies, TV shows, music, books, and photos without a subscription.

    **Key features**

    - Browse movies and TV shows with artwork and metadata.
    - Stream music, books, photos, and other personal media.
    - Watch live TV and schedule recordings.
    - Access libraries through official and community-supported clients.

    **Storage**

    - Media files: `appCommon/jellyfin/media`
    - App data: `appData/jellyfin`
  upgradeDescription: |
    **Back up your Jellyfin data and configuration before upgrading.**

    This update upgrades Jellyfin Server to 10.11.11.

    **What's changed**

    - Fixed user-management and compatibility issues.

    For details, see the [Jellyfin 10.11.11 release notes](https://github.com/jellyfin/jellyfin/releases/tag/v10.11.11).
```

The release bullet above is intentionally broad. In real work, keep it only if the exact release notes support it.

