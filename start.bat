@echo off
if "%ANTHROPIC_API_KEY%"=="" (
  set /p ANTHROPIC_API_KEY="Zadejte API klic Anthropic: "
)
node server.js
