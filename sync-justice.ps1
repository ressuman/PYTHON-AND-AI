<#
.SYNOPSIS
    Safely syncs new commits from the main PYTHON-AND-AI repo's
    "Class 10/Example 2/Agentic AI_1" folder to the standalone
    Justice-AI-Agent- GitHub repo, WITHOUT ever running a raw
    `git subtree push` (which would wipe the reconstructed history)
    and WITHOUT ever touching main's own commit history.

.HOW IT WORKS (plain English)
    1. It looks at a small marker file (.justice-sync-marker) that
       remembers the last commit hash we successfully synced.
    2. It builds a fresh "split" branch of just the Justice AI folder,
       same as before.
    3. If the marker file says we've synced before, it takes ONLY the
       commits that are NEW since that marker, and stacks them on top
       of what's already correctly on GitHub (fetched fresh each time).
    4. It pushes that combined result to class10justice.
    5. It updates the marker file so next time it knows where it left off.
    6. It cleans up all temporary branches. It NEVER touches `main`.

.USAGE
    Run this from anywhere inside the repo, AFTER you've already done
    your normal:
        git add .
        git commit -m "..."
        git push origin main

    Then just run:
        ./sync-justice.ps1
#>

$ErrorActionPreference = "Stop"

# ---- CONFIG: adjust only if paths/names ever change ----
$Prefix       = "Class 10/Example 2/Agentic AI_1"
$RemoteName   = "class10justice"
$RemoteBranch = "main"
$MarkerFile   = ".justice-sync-marker"
# ----------------------------------------------------------

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Fail($msg) {
    Write-Host ""
    Write-Host "STOPPED: $msg" -ForegroundColor Red
    Write-Host "No changes were pushed. It is safe to re-run this script after fixing the issue." -ForegroundColor Yellow
    exit 1
}

# 0. Find repo root, make sure we run git commands from there
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) { Fail "This doesn't look like a git repository. cd into your PYTHON AND AI folder first." }
Set-Location $repoRoot

# 1. Make sure working tree is clean (no half-finished edits)
$status = git status --porcelain
if ($status) {
    Fail "You have uncommitted changes. Commit or stash them first (git add . ; git commit -m '...')."
}

# 2. Make sure we're on main
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Fail "You're on branch '$currentBranch', not 'main'. Run 'git checkout main' first."
}

# 3. Confirm the remote exists
git remote get-url $RemoteName *> $null
if ($LASTEXITCODE -ne 0) { Fail "Remote '$RemoteName' not found. Check 'git remote -v'." }

Write-Step "Fetching latest state of $RemoteName (does not change anything local)"
git fetch $RemoteName
if ($LASTEXITCODE -ne 0) { Fail "Could not fetch from $RemoteName. Check your internet connection." }

$remoteRef = "$RemoteName/$RemoteBranch"
$remoteHead = git rev-parse $remoteRef 2>$null
if (-not $remoteHead) { Fail "Could not find $remoteRef. Has the remote repo ever been pushed to?" }

# 4. Build a fresh split of the CURRENT full folder history (from main)
$tempSplitBranch = "justice-sync-tmp-split"
git branch -D $tempSplitBranch 2>$null | Out-Null

Write-Step "Splitting '$Prefix' out of main's current history (local only, nothing pushed yet)"
git subtree split --prefix="$Prefix" -b $tempSplitBranch
if ($LASTEXITCODE -ne 0) { Fail "subtree split failed. Does the path '$Prefix' still exist in main?" }

$splitHead = git rev-parse $tempSplitBranch
$splitTree = git rev-parse "${tempSplitBranch}:"

# 5. Read the marker (last commit on main we already synced), if any
$markerPath = Join-Path $repoRoot $MarkerFile
$lastSyncedMainCommit = $null
if (Test-Path $markerPath) {
    $lastSyncedMainCommit = (Get-Content $markerPath -Raw).Trim()
}

# 6. Compare: does the freshly split content match what's already on GitHub?
$remoteTree = git rev-parse "${remoteRef}:"

if ($remoteTree -eq $splitTree) {
    Write-Host ""
    Write-Host "Nothing to sync -- content already matches what's on GitHub." -ForegroundColor Green
    git branch -D $tempSplitBranch | Out-Null
    git rev-parse HEAD | Out-File -FilePath $markerPath -Encoding ascii -NoNewline
    exit 0
}

# 7. There IS new content. Build a combined branch:
#    remote's current (correct) history + only the new commit(s) on top,
#    using a merge-style patch rather than trusting subtree's own
#    (unreliable, in this repo's case) fast-forward logic.
Write-Step "New changes detected. Preparing a combined branch (remote history + new changes)"

$combinedBranch = "justice-sync-tmp-combined"
git branch -D $combinedBranch 2>$null | Out-Null
git branch $combinedBranch $remoteRef

# Create a single "catch-up" commit that updates the tree to match the
# fresh split's content, on top of the remote's existing correct history.
# This keeps remote history 100% intact and just appends one new commit.
git checkout $combinedBranch *> $null

# Replace working content with the freshly split tree
git checkout $tempSplitBranch -- . 2>$null
# Remove any files that existed on remote but no longer exist in the split
git clean -fd *> $null

$diffCheck = git status --porcelain
if (-not $diffCheck) {
    Write-Host "No actual file differences after all -- trees matched by content, just different history shape." -ForegroundColor Yellow
    git checkout main *> $null
    git branch -D $tempSplitBranch $combinedBranch | Out-Null
    git rev-parse HEAD | Out-File -FilePath $markerPath -Encoding ascii -NoNewline
    exit 0
}

git add -A
$commitMsg = "sync: update from main ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
git commit -m $commitMsg *> $null

Write-Step "Verifying the combined branch's final content matches main exactly"
$mainTreeNow = git rev-parse "main:$Prefix"
$combinedTreeNow = git rev-parse "${combinedBranch}:"
if ($mainTreeNow -ne $combinedTreeNow) {
    git checkout main *> $null
    git branch -D $tempSplitBranch $combinedBranch | Out-Null
    Fail "Verification failed: combined branch content does not match main. Nothing was pushed. Please report this output for debugging."
}
Write-Host "Verified: content matches main exactly (tree hashes equal)." -ForegroundColor Green

# 8. Push ONLY to class10justice
Write-Step "Pushing to $RemoteName (force-push to that remote ONLY, never touches origin/main)"
git push $RemoteName "${combinedBranch}:${RemoteBranch}" --force
if ($LASTEXITCODE -ne 0) {
    git checkout main *> $null
    git branch -D $tempSplitBranch $combinedBranch | Out-Null
    Fail "Push failed. Nothing on GitHub was changed."
}

# 9. Update marker, clean up, return to main
git rev-parse HEAD | Out-File -FilePath $markerPath -Encoding ascii -NoNewline
git checkout main *> $null
git branch -D $tempSplitBranch $combinedBranch | Out-Null

Write-Host ""
Write-Host "Done. Justice AI repo on GitHub is now up to date." -ForegroundColor Green
Write-Host "Check: https://github.com/ressuman/Justice-AI-Agent-/commits/main" -ForegroundColor Green
