name: 📚 Documentation Improvement
description: Suggest improvements to existing documentation or missing docs.
title: "[Docs]: "
labels: [documentation]
body:
  - type: textarea
    attributes:
      label: What needs improvement?
      description: Describe the issue or gap in the documentation.
      placeholder: "Installation steps are missing for macOS..."
    validations:
      required: true

  - type: textarea
    attributes:
      label: Suggested Fix
      description: If you have a suggestion for how to improve the docs, share it here.
    validations:
      required: false

  - type: textarea
    attributes:
      label: Additional Information
      description: Add any screenshots, links, or references to help explain the issue.
    validations:
      required: false
