# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository is currently empty of source code — it contains only Claude Code configuration and reference documentation:

- `.claude/settings.json` — enables the experimental Agent Teams feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"`).
- `docs/agent-teams.md` — reference notes on how Agent Teams works (spawning/coordinating multiple Claude Code sessions, task lists, teammate messaging, etc.). Consult this file before spawning or coordinating a multi-agent team in this repo.

There is no build system, package manifest, source directory, README, or test suite yet. There are no commands to build, lint, or test.

This directory is not a git repository.

When actual project code is added here, update this file with real build/lint/test commands and architecture notes rather than speculative ones.
