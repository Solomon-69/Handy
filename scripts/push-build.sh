#!/bin/bash
# GitHub switched Actions off for the Handy fork, so builds run in Solomon-69/Handy-build.
# Pushes a one-commit snapshot of the current tree there and prints the run list.
set -e
cd "$(git rev-parse --show-toplevel)"
git remote get-url build >/dev/null 2>&1 || git remote add build https://github.com/Solomon-69/Handy-build.git
C=$(git commit-tree 'HEAD^{tree}' -m "build snapshot $(git rev-parse --short HEAD)")
git push -f build "${C}:refs/heads/overnight-8-nov"
sleep 8
gh run list -R Solomon-69/Handy-build -L 1
