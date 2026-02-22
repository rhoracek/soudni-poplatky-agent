#!/bin/bash
if [ -z "$ANTHROPIC_API_KEY" ]; then
  read -p "Zadejte API klic Anthropic: " ANTHROPIC_API_KEY
  export ANTHROPIC_API_KEY
fi
node server.js
