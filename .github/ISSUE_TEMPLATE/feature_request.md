name: 🚀 Feature Request
description: Suggest a new feature or enhancement.
title: "[Feature]: "
labels: [enhancement]
body:
  - type: textarea
    attributes:
      label: Feature Description
      description: Describe the feature you want to request.
      placeholder: "Add dark mode toggle in navbar..."
    validations:
      required: true

  - type: textarea
    attributes:
      label: Why is this feature needed?
      description: Explain why this feature would be useful.
    validations:
      required: false

  - type: textarea
    attributes:
      label: Additional Context
      description: Add any other context or screenshots about the feature request here.
    validations:
      required: false
