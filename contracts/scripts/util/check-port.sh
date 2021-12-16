#!/bin/sh
YELLOW='\033[0;33m'
NC='\033[0m'
if nc -z localhost 8545 > /dev/null 2>&1; then
    >&2 echo "${YELLOW}Please close any existing connections on port 8545${NC}"
    exit 1 
fi
