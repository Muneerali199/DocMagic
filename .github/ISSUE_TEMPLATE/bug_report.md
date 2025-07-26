name: 🐞 Bug Report
description: Report a reproducible bug or unexpected behavior.
title: "[Bug]: "
labels: [bug]
body:
  - type: textarea
    attributes:
      label: Description
      description: A clear and concise description of what the bug is.
      placeholder: "The submit button does nothing when clicked..."
    validations:
      required: true

  - type: textarea
    attributes:
      label: Steps to Reproduce
      description: What steps should someone follow to reproduce the issue?
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    attributes:
      label: Expected vs Actual Behavior
      description: What you expected to happen and what actually happened?
    validations:
      required: false

  - type: input
    attributes:
      label: Environment
      description: OS, browser, Node version, etc.
      placeholder: "e.g. Windows 11, Chrome 114, Node v18"
    validations:
      required: false
