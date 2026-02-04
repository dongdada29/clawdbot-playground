---
name: github-image-upload
description: Generate SVG diagram and upload to GitHub, return the raw image URL. Uses Canvas API to create architecture diagrams and GitHub API to upload.
metadata:
  {
    "openclaw": {
      "emoji": "📤",
      "requires": {
        "bins": ["curl"]
      }
    }
  }
---

# GitHub Image Upload Skill

Generate SVG-based diagrams and upload to GitHub repository, returning the raw image URL.

## What This Does

1. **Generate SVG Diagram** - Creates architecture diagrams using Canvas/SVG
2. **Upload to GitHub** - Uses GitHub API to upload image to specified repository
3. **Return URL** - Provides raw.githubusercontent.com URL for embedding

## Usage

```bash
# Generate and upload architecture diagram
github-image-upload owner:"dongdada29" repo:"clawdbot-playground" path:"images/test.png" svg:"<svg>...</svg>"

# Simple version (uses default repo)
github-image-upload svg:"<svg>...</svg>"

# With custom message
github-image-upload owner:"username" repo:"my-repo" path:"docs/diagram.png" svg:"<svg>...</svg>" message:"Add new architecture diagram"
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|---------|---------|-------------|
| `svg` | string | Yes | - | SVG content to upload |
| `owner` | string | No | "dongdada29" | GitHub repository owner |
| `repo` | string | No | "clawdbot-playground" | Repository name |
| `path` | string | Yes | - | File path in repo (e.g., "images/diagram.png") |
| `message` | string | No | "Upload diagram" | Commit message |

## Examples

### Architecture Diagram

```bash
# Create and upload Clawdbot architecture
github-image-upload svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="#1a1a2e"/><text x="200" y="100" fill="white" text-anchor="middle">Clawdbot Architecture</text></svg>' path:"images/clawdbot.svg"
```

### Returns

```json
{
  "url": "https://raw.githubusercontent.com/dongdada29/clawdbot-playground/main/images/clawdbot.svg",
  "html_url": "https://github.com/dongdada29/clawdbot-playground/blob/main/images/clawdbot.svg",
  "commit": "abc123..."
}
```

## Setup

### 1. GitHub Token

The skill uses the GitHub token from OpenClaw config or environment:

```bash
# Ensure GITHUB_TOKEN is set in environment
export GITHUB_TOKEN="ghp_xxxx"
```

Or configure in your GitHub CLI:

```bash
gh auth login
```

### 2. Repository Access

Make sure the target repository exists and you have push access.

## Requirements

- `curl` - For GitHub API calls
- `base64` - For image encoding (built-in on macOS/Linux)
- GitHub Personal Access Token with `repo` scope

## Notes

- Maximum file size: 100MB (GitHub API limit)
- Supports PNG, SVG, JPG, and other image formats
- Creates intermediate directories automatically
- Overwrites existing files at the same path
