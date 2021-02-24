#!/bin/bash
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc
lerna publish from-package --no-verify-access -y --loglevel=debug