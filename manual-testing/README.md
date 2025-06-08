# Manual Testing Documentation

This directory contains manual testing procedures for Liminal Chat features.

## Structure

```
manual-testing/
├── README.md                    # This file
├── features/                    # Feature-specific test procedures
│   └── 002-openrouter-integration/
│       └── story-1-basic-provider.md
└── common/                      # Common test procedures (future)
    ├── setup.md
    └── smoke-tests.md
```

## Purpose

Manual testing documentation serves as:
1. Pre-implementation verification (TDD red phase)
2. Post-implementation validation (TDD green phase)
3. Regression testing procedures
4. User acceptance criteria

## Test Format

Each test document includes:
- Prerequisites
- Test steps with expected results
- Pre-implementation expectations (should fail)
- Post-implementation expectations (should pass)
- Sign-off sections

## Running Tests

1. Always start with prerequisites (starting services, etc.)
2. Follow test steps exactly as written
3. Document any deviations or issues
4. Complete sign-off sections with date/time