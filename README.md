# Olares app manifest skills

Two reusable skills help Olares engineers create and localize third-party app descriptions with natural-language requests:

- `olares-app-copy`: researches official sources and previews neutral English manifest copy.
- `olares-app-localize`: translates approved English copy into six target locales. It writes files only when explicitly requested.

## Register once

```bash
./register-skills.sh
```

The script links both skills into Codex, Cursor, and Claude Code. It is safe to run again after moving or updating this repository.

## Typical use

```text
Use $olares-app-copy for <app name>. Official repository: <URL>. Release notes: <URL>. Preview the English manifest copy; do not change files.
```

After reviewing the English result:

```text
Use $olares-app-localize to translate this approved English app description into zh-CN, fr-FR, de-DE, ja-JP, it-IT, and es-ES. Return the translations here; do not change files.
```

Engineers may write the request naturally in Chinese or English. “Generate,” “draft,” and “translate” use preview mode by default.

## Optional repository write

File changes require an explicit request:

```text
Use $olares-app-localize to write these translations into <repository path>. Inspect the repository layout first. If the destination convention is unclear, return the translations and proposed paths without creating files.
```

In write mode, the skill follows existing repository conventions and can run its validator. A repository path or attached file alone does not enable write mode.

The source tree under `skills/` is canonical. Edit it in the repository; registered links update automatically.

## 中文调用示例

生成英文源文案：

```text
使用 $olares-app-copy，根据以下应用资料生成英文应用描述。请保持客观中性，只在对话中展示结果，不要修改文件：<应用资料或链接>
```

生成六种译文：

```text
使用 $olares-app-localize，把下面已经确认的英文应用描述翻译成中、法、德、日、意、西六种语言。英文是源文案，不需要重复输出。只在对话中输出，不要创建文件：<英文文案>
```

明确要求写入仓库：

```text
使用 $olares-app-localize，把译文写入这个仓库：<路径>。先确认现有目录规范；如果无法确认，只输出译文和建议路径，不要创建文件。
```
