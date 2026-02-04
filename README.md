# GitHub Image Upload Skill for OpenClaw

Generate SVG-based diagrams and upload to GitHub repository, returning the raw image URL.

## Installation

### Option 1: Clone to Skills Directory

```bash
# Clone to your OpenClaw skills directory
cd ~/openclaw/skills
git clone https://github.com/dongdada29/clawdbot-playground.git skills/github-image-upload
# Or clone directly
git clone https://github.com/dongdada29/clawdbot-playground.git github-image-upload
```

### Option 2: Copy Files Manually

Copy these files to your OpenClaw skills directory:

```
github-image-upload/
├── SKILL.md          # Skill documentation
├── index.js          # Main skill implementation  
├── package.json      # Package metadata
└── README.md         # This file
```

## Usage

```bash
# Generate and upload architecture diagram
github-image-upload owner:"dongdada29" repo:"clawdbot-playground" path:"images/test.svg" svg:"<svg>...</svg>"

# Simple version (uses default repo)
github-image-upload svg:"<svg>...</svg>" path:"images/my-diagram.svg"
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|---------|---------|-------------|
| `svg` | string | Yes | - | SVG content to upload |
| `owner` | string | No | "dongdada29" | GitHub repository owner |
| `repo` | string | No | "clawdbot-playground" | Repository name |
| `path` | string | Yes | - | File path in repo |
| `message` | string | No | "Upload diagram" | Commit message |

## Requirements

- `curl` - For GitHub API calls
- `base64` - Built-in on macOS/Linux
- GitHub Personal Access Token

## Setup GitHub Token

```bash
# Option 1: Environment variable
export GITHUB_TOKEN="ghp_xxxx"

# Option 2: GitHub CLI
gh auth login
```

## Example

```javascript
// In OpenClaw skill call
await skills.github_image_upload({
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">\
    <rect width="400" height="200" fill="#1a1a2e"/>\
    <text x="200" y="100" fill="white" text-anchor="middle">My Diagram</text>\
  </svg>',
  owner: "dongdada29",
  repo: "clawdbot-playground",
  path: "images/example.svg"
});

// Returns:
// {
//   "url": "https://raw.githubusercontent.com/dongdada29/clawdbot-playground/main/images/example.svg",
//   "html_url": "https://github.com/dongdada29/clawdbot-playground/blob/main/images/example.svg",
//   "commit": "abc123...",
//   "path": "images/example.svg"
// }
```

## License

MIT
