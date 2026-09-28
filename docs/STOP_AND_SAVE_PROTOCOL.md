==================================================
STRICT STOP-AND-SAVE PROTOCOL — NON-NEGOTIABLE
==================================================

PROJECT DATA MUST NEVER EXIST ONLY IN THE CURRENT SESSION.

The coding agent MUST preserve work continuously in:
1. Working project directory
2. ZIP backup
3. Git commit
4. GitHub remote
5. Progress documentation

The priority order is:

SAVE FILES
→ VERIFY FILES
→ UPDATE ZIP
→ WRITE PROGRESS REPORT
→ GIT ADD
→ GIT COMMIT
→ GIT PUSH
→ VERIFY PUSH
→ ONLY THEN CONTINUE WORK

--------------------------------------------------
A. WHEN TO TRIGGER STOP-AND-SAVE
--------------------------------------------------

Immediately trigger the Stop-and-Save Protocol if ANY of these occurs:

1. You estimate that the available usage/context limit is getting close.

2. The current task cannot be completed within the available session.

3. A tool/API/dependency is blocking completion.

4. An external service is unavailable.

5. Tests are taking longer than expected and the session may end.

6. You have completed a meaningful implementation unit, even if the overall feature is unfinished.

7. You are unsure whether you will have enough remaining context to safely finish the current task.

8. You are asked to stop, pause, or hand off work.

9. Before starting a new major phase, if the previous phase has not yet been safely persisted.

WHEN IN DOUBT:
STOP AND SAVE.
Do not gamble with project state.

--------------------------------------------------
B. STOP-AND-SAVE PROCEDURE
--------------------------------------------------

When triggered, DO NOT start new implementation work.

Perform these steps IN THIS EXACT ORDER:

STEP 1 — SAVE CURRENT FILES

Save every modified/new file to disk.

Do not leave important implementation only in memory.

Check for:
- unsaved files
- temporary files containing useful work
- generated configuration
- migration files
- documentation
- tests
- scripts
- environment templates

Never save secrets.

--------------------------------------------------

STEP 2 — VERIFY WORKING TREE

Inspect the project status.

Identify:
- modified files
- newly created files
- deleted files
- untracked files
- incomplete files
- generated files that must be retained

Do NOT blindly discard changes.

If something is intentionally unfinished, keep it and document its state.

--------------------------------------------------

STEP 3 — UPDATE ZIP BACKUP

Immediately create/update the project ZIP backup.

The ZIP MUST contain the latest saved project state.

Before continuing, verify that the ZIP exists and contains the important project files.

The ZIP is a recovery backup, NOT a substitute for Git.

Use a clear naming convention such as:

yuva-energy-backup-YYYY-MM-DD-HHMM.zip

or, if maintaining a rolling backup:

yuva-energy-latest.zip

Never overwrite the only known good backup without first ensuring the new backup was created successfully.

--------------------------------------------------

STEP 4 — WRITE PROGRESS REPORT

Create or update:

docs/PROGRESS_REPORT.md

The report MUST contain:

# Current Session

## Date/Time
Record the current date/time.

## Current Phase
State the current development phase.

## Current Slice
State the exact slice/task being worked on.

## Completed
List everything successfully completed.

## Partially Completed
List work that exists but is incomplete.

## Not Started
List planned work that has not begun.

## Files Changed
List important files created/modified.

## Database Changes
List migrations/schema/table changes.

## External Data Sources
List sources integrated, partially integrated, or still pending.

## Tests
List tests run and their results.

## Known Issues
List blockers, failures, or limitations.

## Next Exact Action
State the FIRST concrete action the next session should perform.

## Recovery Instructions
Explain where the latest ZIP backup is and which Git commit contains the saved state.

NEVER write a vague report such as:
"Work in progress."

The next session must be able to continue from the report without guessing.

--------------------------------------------------
STEP 5 — GIT COMMIT

Stage all appropriate completed work.

Create a commit with a meaningful message.

Examples:

checkpoint: save weather ingestion progress

checkpoint: save satellite pipeline implementation

checkpoint: save backend foundation

checkpoint: save database audit

If the feature is incomplete, the commit MUST make that clear.

Do NOT pretend incomplete work is complete.

--------------------------------------------------
STEP 6 — PUSH TO GITHUB

Push the checkpoint commit to the configured GitHub remote.

The push MUST happen even if:
- the feature is incomplete
- tests remain
- integrations remain
- TODOs remain
- documentation is incomplete

A partial but safely pushed implementation is preferable to completed work that exists only locally.

--------------------------------------------------
STEP 7 — VERIFY REMOTE STATE

After pushing:

Verify that:
- the push succeeded
- the current commit exists on the remote
- no important intended changes remain only locally

If the push fails:

DO NOT continue development.

Instead:
1. diagnose the push failure,
2. preserve the local files,
3. update the progress report,
4. retry if safely possible,
5. otherwise clearly document the exact failure.

Never claim that work is safely backed up remotely unless the push actually succeeded.

--------------------------------------------------
STEP 8 — ONLY THEN RESUME
--------------------------------------------------

Only after:

✓ files saved
✓ working tree inspected
✓ ZIP created/updated
✓ progress report written
✓ commit created
✓ GitHub push successful
✓ remote state verified

may the agent continue development.

If usage/context is critically low, DO NOT resume.

End the session at the safe checkpoint.

==================================================
C. HARD STOP CONDITION
==================================================

If the agent believes the session may terminate before another meaningful unit can safely be completed:

DO NOT:
- start another feature
- start a large refactor
- start a migration without finishing its persistence
- begin a long integration
- leave generated files unsaved
- rely on conversation history as the backup

INSTEAD:

STOP
→ SAVE
→ ZIP
→ PROGRESS REPORT
→ COMMIT
→ PUSH
→ VERIFY
→ END

==================================================
D. INTERRUPTED TASK RULE
==================================================

If a task cannot be completed:

NEVER delete the partial implementation merely because it is incomplete.

Preserve the useful work.

Clearly mark it as:

STATUS: PARTIALLY COMPLETE

Then document:

- what works
- what does not work
- exact blocker
- files involved
- commands already attempted
- tests already run
- exact next step

Commit and push the partial state.

==================================================
E. NO-LOSS GUARANTEE
==================================================

The agent must assume that the current coding session could terminate unexpectedly at any moment.

Therefore:

DO NOT rely on:
- memory
- chat history
- terminal history
- uncommitted changes
- temporary files
- IDE state

The durable source of truth must always be:

GitHub repository
+
latest verified ZIP backup
+
PROGRESS_REPORT.md

==================================================
F. FINAL RULE
==================================================

WHEN USAGE IS LOW:

DO NOT TRY TO SQUEEZE IN "ONE LAST FEATURE."

SAVE THE PROJECT.

A safely persisted incomplete feature is ALWAYS preferable to losing an entire session's work.

The agent's responsibility is not only to build the project.

It is also to ensure that every completed piece of work survives the end of the session.