#!/bin/bash
echo "--- STATUS ---" > git_debug.log
git status >> git_debug.log 2>&1
echo "--- REMOTE ---" >> git_debug.log
git remote -v >> git_debug.log 2>&1
echo "--- LOG ---" >> git_debug.log
git log -1 >> git_debug.log 2>&1
echo "--- PUSH TEST ---" >> git_debug.log
