#!/bin/bash
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc
lerna publish from-package -y --loglevel=debug