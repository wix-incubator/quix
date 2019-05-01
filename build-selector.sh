#!/usr/bin/env bash

declare -A PATTERN_MAP

PATTERN_MAP[client]='^((quix-frontend/(client/|shared/))|\.travis\.yml)'
PATTERN_MAP[shared]='^(quix-frontend/shared|\.travis\.yml)'
PATTERN_MAP[service]='^((quix-frontend/(service/|shared/))|\.travis\.yml)'
PATTERN_MAP[backend]='^(quix-backend/|\.travis\.yml)'


git diff --name-only $1 | grep -qE ${PATTERN_MAP[$2]}