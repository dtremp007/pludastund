#!/bin/sh
npx drizzle-kit migrate
node ./build/index.js
