# CodeRabbit Integration Test

This file tests CodeRabbit integration after repository move from personal to organization account.

## Test Scenarios
- [x] Repository moved from `leegmoore/liminal-chat` to `liminal-ai/liminal-chat`
- [x] CodeRabbit app reinstalled on organization
- [ ] CodeRabbit responds to PR comments
- [ ] CodeRabbit generates automated reviews
- [ ] Security scan triggers work via @coderabbitai mentions

## Configuration Details
- Organization: liminal-ai
- Repository: liminal-chat
- CodeRabbit config: `.coderabbit.yml` (comprehensive configuration for solo dev + Claude AI integration)

## Expected Behavior
CodeRabbit should automatically review this PR and respond to @coderabbitai security scan requests.

Test timestamp: 2025-08-17T$(date +%H:%M:%S)