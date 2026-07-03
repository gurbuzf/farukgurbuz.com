# Agent Teams — Master Reference

Source: https://code.claude.com/docs/en/agent-teams (Claude Code docs, as of v2.1.186)

Status in this repo: **enabled** via [.claude/settings.json](../.claude/settings.json) (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"`).

## What it is

Agent teams coordinate multiple independent Claude Code sessions on one task. One session is the **lead** (coordinates, assigns tasks, synthesizes results); **teammates** work independently in their own context windows and can message each other directly — not just report back to the lead.

This is the key difference from subagents (the `Agent` tool used elsewhere in this project): subagents only report back to the caller; teammates share a task list and talk to each other.

| | Subagents | Agent teams |
|---|---|---|
| Context | Own window, results return to caller | Own window, fully independent |
| Communication | Reports to main agent only | Teammates message each other directly |
| Coordination | Main agent manages all work | Shared task list, self-coordination |
| Best for | Focused task, only the result matters | Complex work needing discussion/collaboration |
| Token cost | Lower | Higher — each teammate is a full Claude instance |

## When to use a team (vs. subagents or solo)

Good fits — parallel exploration genuinely adds value:
- **Research/review**: independent investigators, then compare/challenge findings
- **New modules/features**: teammates each own a separate piece, no overlap
- **Debugging with competing hypotheses**: parallel theories, adversarial cross-checking converges faster than one agent anchoring on the first plausible cause
- **Cross-layer work**: frontend/backend/tests each owned by a different teammate

Bad fits — coordination overhead not worth it:
- Sequential tasks, heavy inter-task dependencies
- Same-file edits (two teammates editing one file = overwrites)
- Small/routine tasks — a single session or an `Agent` subagent call is cheaper and simpler

## Enabling

```json
// settings.json (project, user, or local)
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```
Disabled by default. Without this var: no team is set up at session start, no team directories are written, Claude never spawns or proposes teammates. Requires a session restart to take effect.

## Starting a team

Just describe the task and desired teammates in natural language:

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Spawn three teammates to explore this from different angles:
one on UX, one on technical architecture, one playing devil's advocate.
```

Claude either spawns teammates because you asked, or proposes spawning them if it judges the task benefits from parallelism (you confirm before it proceeds — it never spawns without approval). It populates a shared task list, spawns teammates, and synthesizes findings when done.

Agent panel (below the prompt input) lists teammates:
- ↑/↓ — select a teammate
- Enter — open its transcript / message it directly
- Esc — interrupt its current turn
- (v2.1.181+) idle rows auto-hide after 30s, reappear on next turn — teammate is still running, just hidden

## Display modes

Set via `teammateMode` in `~/.claude/settings.json` or `claude --teammate-mode <mode>`.

- **`in-process`** (default since v2.1.179): all teammates run inside the main terminal, view/message via agent panel. Works everywhere, no setup.
- **`auto`**: split panes if already in tmux or iTerm2 w/ `it2` CLI, else falls back to in-process.
- **`tmux`**: forces split-pane mode, auto-picks tmux or iTerm2.
- **`iterm2`** (v2.1.186+): forces iTerm2 native split panes explicitly, requires [`it2` CLI](https://github.com/mkusaka/it2).

Split-pane mode requires tmux or iTerm2+`it2`; **not supported** in VS Code integrated terminal, Windows Terminal, or Ghostty (relevant on this Windows machine — stick to `in-process`, the default, unless using WSL+tmux).

## Controlling a team

### Specify teammates/models
```
Spawn 4 teammates to refactor these modules in parallel. Use Sonnet for each teammate.
```
Teammates don't inherit the lead's `/model` by default — set **Default teammate model** in `/config` (or pick "Default (leader's model)" to follow the lead). Teammates do inherit the lead's effort level (v2.1.186+, in-process and split-pane).

### Require plan approval
```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```
Teammate plans in read-only mode, sends a plan-approval request to the lead, lead approves/rejects with feedback (rejection → teammate revises and resubmits). Give the lead explicit approval criteria in the prompt if you want to shape its judgment (e.g. "only approve plans that include test coverage").

### Message a teammate directly
Every teammate is a full independent session. In-process: select in agent panel, Enter to view/type; `x` to stop; Ctrl+T toggles task list. Split-pane: click into its pane.

### Task list
Shared across the team; states: pending / in progress / completed; supports dependencies (blocked until dependency completes, auto-unblocks). Lead assigns explicitly, or teammates self-claim the next unblocked task. File locking prevents double-claim races.

### Shut down a teammate
```
Ask the researcher teammate to shut down
```
Sends a shutdown request; teammate can approve (graceful exit) or reject with an explanation. Team directories clean up automatically at session end — no manual cleanup step needed.

### Quality gates via hooks
- `TeammateIdle` — fires before a teammate goes idle; exit 2 to send feedback and keep it working
- `TaskCreated` — fires on task creation; exit 2 to block + feedback
- `TaskCompleted` — fires on task completion; exit 2 to block + feedback

## Architecture

| Component | Role |
|---|---|
| Team lead | Main session; spawns teammates, coordinates, synthesizes |
| Teammates | Separate Claude Code instances, own assigned tasks |
| Task list | Shared work items, claimed/completed by teammates |
| Mailbox | Inter-agent messaging |

Storage (local, session-derived name = `session-` + first 8 chars of session ID):
- Team config: `~/.claude/teams/{team-name}/config.json` — runtime state (session IDs, tmux pane IDs). **Never hand-edit or pre-author** — overwritten on next state update. No project-level equivalent exists; a `.claude/teams/teams.json` in a project is *not* recognized as config.
- Task list: `~/.claude/tasks/{team-name}/` — persists locally (never uploaded), so resumed sessions keep tasks. Retention follows `cleanupPeriodDays`.

Team config is removed when the session ends; task list directory persists.

### Reusable roles via subagent definitions
Reference any subagent type (project/user/plugin/CLI-defined) when spawning a teammate:
```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```
The teammate honors that definition's `tools` allowlist and `model`; the definition body is *appended* to the teammate's system prompt (not a replacement). `SendMessage` and task-management tools are always available regardless of `tools` restrictions. Caveat: a subagent definition's `skills` and `mcpServers` frontmatter fields are **ignored** for teammates — they load skills/MCP servers from project/user settings like any regular session.

### Permissions
Teammates start with the lead's permission mode (including `--dangerously-skip-permissions` if the lead has it). No per-teammate mode at spawn time; you can change an individual teammate's mode after spawning. A teammate cannot approve permission prompts or supply consent on your behalf — a denied action can't be relayed through another teammate to bypass the check. In auto mode, a relayed "approval" from another agent is treated as untrusted input, not real confirmation. All teammate permission prompts bubble up to the lead session — approve them there.

### Context and communication
Each teammate loads project context fresh (CLAUDE.md, MCP servers, skills) plus the spawn prompt — **it does not inherit the lead's conversation history**. This makes spawn-prompt completeness critical (see Best Practices below).
- Messages are delivered automatically to recipients — lead doesn't poll
- Idle teammates auto-notify the lead
- All agents see the shared task list
- Message one teammate by name; to reach everyone, send one message per recipient
- Ask the lead to name teammates predictably up front if you'll reference them later

### Token usage
Scales roughly linearly with number of active teammates — each is a full separate context window. Worth it for research/review/new-feature work; not for routine tasks. See `/en/costs#agent-team-token-costs` in the official docs for detailed guidance.

## Best practices

1. **Front-load context in the spawn prompt.** Teammates don't see the lead's conversation history, so a vague spawn prompt produces vague work. Example:
   ```
   Spawn a security reviewer teammate with the prompt: "Review the authentication
   module at src/auth/ for security vulnerabilities. Focus on token handling,
   session management, and input validation. The app uses JWT tokens stored in
   httpOnly cookies. Report any issues with severity ratings."
   ```
2. **Team size: start at 3–5.** Token cost scales linearly, coordination overhead grows, and returns diminish past a point. Three focused teammates usually beat five scattered ones.
3. **Size tasks to 5–6 per teammate.** Too small = coordination overhead exceeds benefit; too large = teammates go too long without check-in, risking wasted effort. If the lead isn't creating enough tasks, ask it to split work further.
4. **Explicitly wait when needed** — the lead sometimes starts implementing instead of delegating/waiting:
   ```
   Wait for your teammates to complete their tasks before proceeding
   ```
5. **Start with research/review tasks**, not parallel implementation, if new to agent teams — same value, less risk of file conflicts.
6. **Avoid file conflicts** — partition ownership so no two teammates touch the same file.
7. **Monitor and steer** — don't let a team run unattended for long; check in, redirect, synthesize as findings arrive.

## Troubleshooting

- **Teammates not appearing**: check agent panel (↑/↓ + Enter); an idle row may just be auto-hidden (30s) — message it by name to bring it back; confirm the task was actually complex enough that Claude decided to spawn a team; for split panes, verify `tmux` is on PATH (`which tmux`) or `it2` CLI + iTerm2 Python API is enabled.
- **Too many permission prompts**: all teammate prompts bubble to the lead. Pre-approve common operations in permission settings before spawning.
- **Teammate stuck on an error**: open its transcript (agent panel Enter, or click pane), give it direct instructions, or spawn a replacement.
- **Lead shuts down before work is done**: tell it to keep going / wait for teammates.
- **Orphaned tmux sessions**: `tmux ls` then `tmux kill-session -t <session-name>`.

## Limitations (experimental feature)

- **No session resumption for in-process teammates** — `/resume`/`/rewind` don't restore them; lead may try messaging teammates that no longer exist post-resume — tell it to respawn.
- **Task status can lag** — teammates sometimes fail to mark tasks complete, blocking dependents; check manually or nudge the lead.
- **Shutdown can be slow** — teammates finish their current turn/tool call first.
- **One team per session** — can't create multiple named teams or share a team across sessions.
- **No nested teams** — only the lead can spawn/manage teammates; teammates can't spawn their own.
- **Lead is fixed** — can't promote a teammate to lead or transfer leadership.
- **Permissions fixed at spawn** — set from the lead's mode; adjustable per-teammate only after spawning.
- **Split panes need tmux or iTerm2** — not supported in VS Code integrated terminal, Windows Terminal, or Ghostty. Default `in-process` mode works everywhere.

`CLAUDE.md` works normally for teammates — they read it from their working directory, so it's a reliable way to give all teammates shared project guidance.

## Quick-reference prompt patterns

**Parallel code review**
```
Spawn three teammates to review PR #142:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

**Competing-hypothesis debugging**
```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

**New feature, ownership split by layer**
```
Spawn 3 teammates to build feature X: one owns the API/backend, one owns the
frontend, one owns tests. Each works only in their own files. Coordinate
through the shared task list.
```

## Related approaches

- **Subagents** (`Agent` tool) — lightweight delegation within one session, no inter-agent coordination needed; use for focused research/verification tasks.
- **Git worktrees** — manual parallel sessions without automated team coordination.
- See official docs `/en/features-overview#compare-similar-features` for a full subagent-vs-agent-team comparison.
