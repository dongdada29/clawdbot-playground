#!/usr/bin/env node
/**
 * GitHub Image Upload Skill for OpenClaw
 * 
 * Generates SVG diagram and uploads to GitHub, returns the raw URL.
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORK_DIR = process.env.OPENCLAW_WORKSPACE_DIR || "/Users/louis/workspace";

// Get GitHub token
function getGitHubToken() {
  // Check environment
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }
  
  // Check gh CLI auth
  return new Promise((resolve) => {
    const gh = spawn("gh", ["auth", "token"], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    
    let token = "";
    gh.stdout.on("data", (data) => {
      token += data.toString();
    });
    gh.on("close", () => {
      resolve(token.trim() || null);
    });
    gh.on("error", () => {
      resolve(null);
    });
  });
}

/**
 * Execute shell command
 */
function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      ...options
    });
    
    let stdout = "";
    let stderr = "";
    
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed: ${command} ${args.join(" ")}\n${stderr}`));
      }
    });
    
    child.on("error", reject);
  });
}

/**
 * Get current user from GitHub API
 */
async function getGitHubUser(token) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Upload file to GitHub
 */
async function uploadToGitHub(token, owner, repo, path, content, message) {
  // Get file SHA if exists
  let sha = null;
  try {
    const existingResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );
    
    if (existingResponse.ok) {
      const existing = await existingResponse.json();
      sha = existing.sha;
    }
  } catch (e) {
    // File doesn't exist, that's fine
  }
  
  // Upload file
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message: message || "Upload diagram",
    content: content,
    ...(sha && { sha })
  };
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${error}`);
  }
  
  return response.json();
}

/**
 * Generate PNG from SVG using canvas
 */
async function generatePNG(svgContent, outputPath) {
  // For now, save SVG directly (PNG conversion requires additional deps)
  // In production, you could use canvas or sharp library
  return outputPath.replace(/\.png$/i, '.svg');
}

/**
 * Main skill function
 */
async function runSkill(params) {
  const {
    svg,
    owner = "dongdada29",
    repo = "clawdbot-playground",
    path,
    message = "Upload diagram via OpenClaw skill"
  } = params;
  
  if (!svg) {
    throw new Error("Missing required parameter: svg");
  }
  
  if (!path) {
    throw new Error("Missing required parameter: path");
  }
  
  console.log(`[github-image-upload] Starting upload to ${owner}/${repo}/${path}`);
  
  // Get GitHub token
  let token = await getGitHubToken();
  
  if (!token) {
    throw new Error("GitHub token not found. Set GITHUB_TOKEN env var or run 'gh auth login'");
  }
  
  // Get user info (for verification)
  const user = await getGitHubUser(token);
  console.log(`[github-image-upload] Authenticated as: ${user.login}`);
  
  // Create temp file
  const tempSvgPath = join(WORK_DIR, `temp-${Date.now()}.svg`);
  try {
    // Write SVG to temp file
    writeFileSync(tempSvgPath, svg);
    
    // Base64 encode
    const content = await execCommand("base64", ["-i", tempSvgPath]);
    const base64Content = content.replace(/\s/g, '');
    
    // Upload to GitHub
    const svgPath = path.replace(/\.png$/i, '.svg');
    const result = await uploadToGitHub(token, owner, repo, svgPath, base64Content, message);
    
    console.log(`[github-image-upload] Uploaded successfully!`);
    
    return {
      success: true,
      url: result.content?.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${result.commit.sha}/${svgPath}`,
      html_url: result.content?.html_url || `https://github.com/${owner}/${repo}/blob/main/${svgPath}`,
      commit: result.commit?.sha,
      path: svgPath,
      owner: owner,
      repo: repo
    };
    
  } finally {
    // Clean up temp file
    if (existsSync(tempSvgPath)) {
      unlinkSync(tempSvgPath);
    }
  }
}

// Export for OpenClaw skill system
export default {
  name: "github-image-upload",
  description: "Generate SVG diagram and upload to GitHub",
  parameters: {
    type: "object",
    properties: {
      svg: {
        type: "string",
        description: "SVG content to upload"
      },
      owner: {
        type: "string",
        description: "GitHub repository owner",
        default: "dongdada29"
      },
      repo: {
        type: "string",
        description: "GitHub repository name",
        default: "clawdbot-playground"
      },
      path: {
        type: "string",
        description: "File path in repository (e.g., 'images/diagram.svg')"
      },
      message: {
        type: "string",
        description: "Commit message",
        default: "Upload diagram via OpenClaw skill"
      }
    },
    required: ["svg", "path"]
  },
  run: runSkill
};
