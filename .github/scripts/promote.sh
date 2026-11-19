#!/usr/bin/env bash
# Shared by the "Promote to staging" and "Promote to production" workflows.
# Merges $HEAD into $BASE through a PR, using a merge commit.
#
# Needs: GH_TOKEN, GH_REPO, BASE, HEAD (and a full-history checkout).
set -euo pipefail

summary() { printf '%s\n' "$@" >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"; }
fail() {
  echo "::error::$1"
  summary "❌ $1"
  exit 1
}

[ -n "${HEAD:-}" ] && [ -n "${BASE:-}" ] || fail "HEAD and BASE must be set."
[ "$HEAD" != "$BASE" ] || fail "Can't merge $BASE into itself."
git rev-parse -q --verify "origin/$HEAD" >/dev/null || fail "Branch '$HEAD' isn't on GitHub. Push it first."
git rev-parse -q --verify "origin/$BASE" >/dev/null || fail "Branch '$BASE' doesn't exist."

changes=$(git log --no-merges --format='- %h %s' "origin/$BASE..origin/$HEAD")
if [ -z "$changes" ]; then
  summary "✅ Nothing to do: \`$BASE\` already has everything on \`$HEAD\`."
  exit 0
fi

pr=$(gh pr list --base "$BASE" --head "$HEAD" --state open --json number --jq '.[0].number // empty')
if [ -z "$pr" ]; then
  body=$(printf '%s\n\n%s\n\n%s\n' \
    "Merges \`$HEAD\` into \`$BASE\`:" \
    "$changes" \
    "Opened by the ${GITHUB_WORKFLOW:-promote} workflow, run by @${GITHUB_ACTOR:-unknown}. See DEPLOYING.md.")
  url=$(gh pr create --base "$BASE" --head "$HEAD" --title "Promote $HEAD to $BASE" --body "$body" 2>&1) ||
    fail "Couldn't open the PR: $url. If this is a permissions error, turn on Settings → Actions → General → 'Allow GitHub Actions to create and approve pull requests'."
  url=$(printf '%s\n' "$url" | tail -1)
  pr=${url##*/}
fi
echo "PR #$pr"

state() { gh pr view "$pr" --json mergeStateStatus --jq .mergeStateStatus; }

# GitHub computes mergeability in the background; wait for a real answer.
wait_state() {
  local s
  for _ in $(seq 1 30); do
    s=$(state)
    [ "$s" != "UNKNOWN" ] && { echo "$s"; return; }
    sleep 2
  done
  echo "$s"
}

for attempt in 1 2; do
  if gh pr merge "$pr" --merge; then
    summary "🚀 Merged \`$HEAD\` into \`$BASE\` (PR #$pr). Vercel is deploying it now." "" "$changes"
    exit 0
  fi

  s=$(wait_state)
  case "$s" in
    BEHIND)
      [ "$attempt" = 1 ] || break
      # Branch protection wants the branch up to date with $BASE first.
      echo "Branch is behind $BASE; updating it, then merging again."
      before=$(gh pr view "$pr" --json headRefOid --jq .headRefOid)
      gh api -X PUT "repos/$GH_REPO/pulls/$pr/update-branch" -f expected_head_sha="$before" >/dev/null
      for _ in $(seq 1 30); do
        [ "$(gh pr view "$pr" --json headRefOid --jq .headRefOid)" != "$before" ] && break
        sleep 2
      done
      wait_state >/dev/null
      ;;
    DIRTY)
      fail "PR #$pr has merge conflicts. Merge $BASE into $HEAD locally, fix them, push, and run this again."
      ;;
    *)
      break
      ;;
  esac
done

fail "Couldn't merge PR #$pr (GitHub says: ${s:-unknown}). Open it to see what's blocking."
