#!/bin/bash

echo "Source this file to setup private key"
SCRIPTPATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"


export GOOGLE_APPLICATION_CREDENTIALS="/Volumes/Keys/Firebase/the-busy-guardian.json"
export NODE_PATH="$NODE_PATH:$SCRIPTPATH/node_modules:$SCRIPTPATH/../public/js"
