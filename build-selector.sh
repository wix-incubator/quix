#!/usr/bin/env bash

if [ -z $2 ]; then
  GIT_RANGE="HEAD^1"
  BUILD_TYPE=$1
else
  GIT_RANGE="$1"
  BUILD_TYPE="$2"
fi

echo GIT RANGE=$GIT_RANGE
echo BUILD_TYPE=$BUILD_TYPE

declare -A PATTERN_MAP

PATTERN_MAP[client]='^((quix-frontend/(client/|shared/))|\.travis\.yml)'
PATTERN_MAP[shared]='^(quix-frontend/shared|\.travis\.yml)'
PATTERN_MAP[service]='^((quix-frontend/(service/|shared/))|\.travis\.yml)'
PATTERN_MAP[backend]='^(quix-backend/|\.travis\.yml)'


git diff --name-only $GIT_RANGE | grep -qE ${PATTERN_MAP[$BUILD_TYPE]}