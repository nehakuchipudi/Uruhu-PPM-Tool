# Claude Code Model Selection Guidelines

**CRITICAL: These rules MUST be followed in every session. Do not skip or ignore.**

---

## MANDATORY SESSION START PROTOCOL

**THIS MUST BE YOUR FIRST RESPONSE IN EVERY NEW SESSION. NO EXCEPTIONS.**

Before doing ANY work, you MUST output the following status block:

```
┌─────────────────────────────────────────────────┐
│ SESSION INITIALIZED                             │
├─────────────────────────────────────────────────┤
│ Current Model: [OPUS / SONNET / HAIKU / UNKNOWN]│
│ Task Type Detected: [PLANNING / EXECUTION / LOOKUP]│
│ Model Match: [✓ CORRECT / ✗ MISMATCH]           │
└─────────────────────────────────────────────────┘
```

### How to Detect Current Model

Check your system information for model identifiers:
- **Opus indicators:** "opus", "claude-opus-4", "claude-opus-4-5-20251101"
- **Sonnet indicators:** "sonnet", "claude-sonnet-4", "claude-sonnet-4-20250514"
- **Haiku indicators:** "haiku", "claude-haiku-3", "claude-3-5-haiku-20241022"
- If model cannot be determined, set to UNKNOWN and ask user

### Model Detection Fallback

If you cannot determine the current model:
```
❓ MODEL DETECTION FAILED

I cannot determine which model I'm running as.
Please confirm: Are you using Opus, Sonnet, or Haiku?

Run `claude --version` or check your session config.
```

**Do NOT proceed with any work until model is confirmed.**

---

## Model Selection Rules

### Use Opus (claude-opus-4-5) for:

1. **Architectural Decisions & Design**
   - System architecture discussions
   - Technology stack recommendations
   - Design pattern selection
   - Database schema design
   - API design and contracts
   - Microservices vs monolith decisions
   - Scalability and performance architecture

2. **Specs & Task Breakdown**
   - Writing technical specifications
   - Breaking down features into tasks
   - Creating implementation plans
   - Defining acceptance criteria
   - Estimating complexity and dependencies

3. **Industry Standards Consultation**
   - Security best practices (OWASP, etc.)
   - Cloud architecture patterns (AWS Well-Architected, Azure, GCP)
   - Code quality standards (SOLID, DRY, clean architecture)
   - DevOps and CI/CD recommendations
   - Compliance requirements (GDPR, SOC2, etc.)

   **Cost consideration:** When providing architectural recommendations, always weigh the financial implications. Prefer pragmatic solutions that balance best practices with budget constraints. Flag when a recommendation has significant cost implications.

### Use Sonnet (claude-sonnet-4) for:

1. **Code Implementation**
   - Writing code based on approved specs
   - Implementing features from task breakdowns
   - Bug fixes and patches
   - Unit tests and integration tests
   - Code refactoring

2. **Moderate Complexity Tasks**
   - Multi-file changes
   - Debugging complex errors
   - Performance analysis and fixes
   - Code review and suggestions

### Use Haiku (claude-haiku-3) for:

**Haiku is ~12x cheaper than Sonnet. Use for simple, low-reasoning tasks.**

1. **Quick Lookups**
   - "What file contains the login function?"
   - "Where is the database config?"
   - "What's the port number in .env?"
   - "List all API routes"
   - "What dependencies are in package.json?"
   - "Show me the User model fields"

2. **File Traversing**
   - "Find all .tsx files in src/"
   - "What folders are in the project?"
   - "List all test files"
   - "Show directory structure"
   - "Find files modified today"

3. **Trivial Code Tasks**
   - Fix a typo in a string
   - Change a variable name (single file)
   - Update a version number
   - Add/remove a console.log
   - Fix an import path
   - Toggle a boolean flag
   - Update a hardcoded URL

4. **Trivial Config Tasks**
   - Change a port number
   - Add an env variable
   - Update .gitignore
   - Modify a single ESLint rule

5. **Simple Q&A**
   - "What does this function return?"
   - "What type is this variable?"
   - "Is this file imported anywhere?"

### NOT for Haiku (requires reasoning):
- "Why is this function slow?" → Sonnet
- "Find all security vulnerabilities" → Sonnet
- "How should I structure this feature?" → Opus
- Multi-file refactoring → Sonnet
- Debugging complex errors → Sonnet
- Writing new features → Sonnet
- Any task requiring analysis or judgment → Sonnet/Opus

**Rule of thumb:** If the task requires *thinking*, use Sonnet. If it requires *planning*, use Opus. If it's just *fetching or trivial edits*, use Haiku.

## Model Switching Protocol

**Claude cannot switch models automatically. You MUST prompt the user to switch when needed.**

### When to Prompt for Model Switch

**If on Sonnet and user requests:**
- Architecture design, tech stack decisions, or system design
- Specs, task breakdowns, or implementation plans
- Industry standards or best practices consultation

**Action:** Stop and respond with:
```
⚠️ MODEL SWITCH RECOMMENDED

This task requires architectural/planning work. For best results:
1. Run: claude --model opus
2. Or use: /model opus (if available)

Current model (Sonnet) is optimized for code execution, not planning.
Proceed anyway? (Results may be less thorough)
```

**If on Opus and user requests:**
- Code implementation from existing specs
- Bug fixes, refactoring, or routine edits
- File operations or simple changes

**Action:** Stop and respond with:
```
💰 COST OPTIMIZATION NOTICE

This is an implementation task. To save tokens:
1. Run: claude --model sonnet
2. Or use: /model sonnet (if available)

Current model (Opus) is more expensive and not needed for this task.
Proceed anyway? (Will work but costs more)
```

**If on Opus/Sonnet and user requests trivial tasks:**
- Simple file lookups or "where is X?"
- Trivial single-line edits
- Directory listing or file finding
- Simple config changes

**Action:** Stop and respond with:
```
💰 COST OPTIMIZATION NOTICE

This is a trivial lookup/edit task. To save tokens:
1. Run: claude --model haiku
2. Or use: /model haiku (if available)

Haiku is ~12x cheaper and sufficient for this task.
Proceed anyway? (Will work but costs more)
```

**If on Haiku and user requests complex tasks:**
- Multi-file implementation
- Debugging requiring analysis
- Any task needing reasoning

**Action:** Stop and respond with:
```
⚠️ MODEL UPGRADE RECOMMENDED

This task requires reasoning/analysis. For best results:
1. Run: claude --model sonnet (for implementation)
2. Run: claude --model opus (for architecture/planning)

Haiku is optimized for simple lookups, not complex tasks.
Proceed anyway? (Results may be incorrect or incomplete)
```

## Session Enforcement

At the start of EVERY session:
1. Identify current model (check system info)
2. Identify nature of user's request
3. If mismatch detected, IMMEDIATELY prompt for model switch BEFORE doing any work
4. Wait for user confirmation before proceeding

### Task Type Detection Keywords

**Opus tasks (planning/architecture):**
- "design", "architect", "plan", "spec", "breakdown", "strategy"
- "best practice", "recommend", "should I use", "which approach"
- "scalability", "security", "compliance", "standards"

**Sonnet tasks (implementation):**
- "implement", "code", "fix", "build", "create", "write"
- "refactor", "update", "change", "modify", "add"
- "test", "debug", "configure"

**Haiku tasks (lookups/trivial):**
- "where is", "find", "list", "show", "what is"
- "which file", "locate", "search for"
- Single-word edits: "change X to Y", "rename", "typo"
- "directory", "structure", "files in"

## Hybrid Task Handling

When a request contains BOTH planning AND implementation (e.g., "design and build a login system"):

**Action:** Split the task and respond with:
```
🔀 HYBRID TASK DETECTED

Your request contains both planning and implementation work:
- Planning phase: [describe planning portion]
- Implementation phase: [describe implementation portion]

RECOMMENDED APPROACH:
1. Start with Opus for the planning/design phase
2. Switch to Sonnet for implementation after plan is approved

How would you like to proceed?
A) Split into two sessions (recommended for cost optimization)
B) Do everything in current model (suboptimal but faster)
C) Just do planning now, implementation later
```

**Always recommend option A** but respect user choice.

### Multi-Terminal Workflow (Recommended)

For optimal cost efficiency, use parallel terminals:
```
Terminal 1 (Opus)   → Planning, architecture, specs
Terminal 2 (Sonnet) → Implementation, coding, debugging
Terminal 3 (Haiku)  → Quick lookups, trivial edits
```

This avoids context loss from model switching and keeps each terminal focused.

---

## User Override Protocol

When user says "proceed anyway" or chooses to continue with mismatched model:

### Per-Task Override (Default)
- Override applies ONLY to the current task
- For the NEXT task, re-evaluate and prompt again if mismatch detected
- State: "Proceeding with [MODEL] for this task. Will re-evaluate for next request."

### Session-Wide Override
User must explicitly say "use [model] for this entire session" or "stop asking about model switches"

If session-wide override granted:
```
✓ SESSION OVERRIDE ACTIVE

Using [MODEL] for all tasks this session.
To re-enable model recommendations, say "reset model recommendations"
```

### Override Logging
When proceeding with override, always note:
```
📝 Note: Proceeding with [MODEL] per user request.
   Optimal model for this task would be [OTHER MODEL].
```

---

## Non-Negotiable Rules

1. **NEVER skip the session start protocol** - Always output the status block first
2. **NEVER skip the model switch prompt** when a mismatch is detected
3. **NEVER proceed with work** if model is UNKNOWN
4. **ALWAYS check task type** before starting work
5. **ALWAYS mention cost implications** when recommending Opus
6. **ALWAYS offer to proceed** even if model is suboptimal (user choice)
7. **ALWAYS split hybrid tasks** and recommend optimal approach
8. **ALWAYS respect user overrides** but log them
9. **ALWAYS re-evaluate** on each new task unless session-wide override is active
10. **NEVER terminate or exit the Claude Code session** - Do NOT use commands, phrases, or actions that would end the session. The session should only end when the user explicitly closes it. Continue working and await further instructions instead of signaling completion.

---

## Quick Reference Card

| Task Type | Model | Keywords | Cost |
|-----------|-------|----------|------|
| Architecture | OPUS | design, architect, plan, strategy, scalability | $$$$ |
| Specs/Planning | OPUS | spec, breakdown, requirements, acceptance criteria | $$$$ |
| Standards | OPUS | best practice, compliance, security, OWASP | $$$$ |
| Implementation | SONNET | implement, code, build, create, write | $$ |
| Bug Fixes | SONNET | fix, patch, debug, resolve | $$ |
| Refactoring | SONNET | refactor, clean up, optimize code | $$ |
| Multi-file Changes | SONNET | update, modify, configure | $$ |
| Quick Lookups | HAIKU | where is, find, list, show, locate | $ |
| File Traversing | HAIKU | files in, directory, structure | $ |
| Trivial Edits | HAIKU | typo, rename, change X to Y | $ |
| Simple Config | HAIKU | port, env, gitignore | $ |

### Cost Comparison
```
OPUS   $$$$ (~$15/$75 per 1M tokens)  - Deep thinking
SONNET $$   (~$3/$15 per 1M tokens)   - Quality coding
HAIKU  $    (~$0.25/$1.25 per 1M tokens) - Fast trivial tasks
```

**Haiku is ~12x cheaper than Sonnet, ~60x cheaper than Opus.**

---

## Enforcement Hierarchy

1. **Session Start Protocol** - MUST execute before anything else
2. **Model Detection** - MUST confirm model before proceeding
3. **Task Classification** - MUST classify before starting work
4. **Mismatch Handling** - MUST prompt user if mismatch detected
5. **Override Handling** - MUST log and respect user overrides
6. **Work Execution** - Only proceed after steps 1-5 complete

**If any step fails, STOP and resolve before continuing.**

---

**Remember:** Opus for thinking and planning, Sonnet for doing and coding, Haiku for quick lookups and trivial tasks.
