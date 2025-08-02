
## A complete reference for all backend API endpoints available in the DocMagic project.

# Table of Contents

- [Authentication](#authentication)
- [Endpoints by Category](#endpoints-by-category)
  - [User Registration](#user-registration)
  - [User Sign In](#user-sign-in)
  - [Resume Analysis](#resume-analysis)
  - [Document Generation](#document-generation)
  - [Letter Creation](#letter-creation)
  - [Presentation Generation](#presentation-generation)
  - [Send Email](#send-email)
  - [Stripe Subscription](#stripe-subscription)
- [Global Error Codes](#global-error-codes)
- [Links and References](#links-and-references)

---

## Authentication

Most endpoints in DocMagic require authentication via Supabase Bearer tokens. Include this HTTP header for authenticated requests:

```
Authorization: Bearer 
```

- Sign up and sign in endpoints do **NOT** require authentication.
- Other endpoints return `401 Unauthorized` if the token is missing or invalid.

---

## Endpoints by Category

### User Registration

**Endpoint:**  
`POST /api/auth/register`

**Description:**  
Registers a new user account with name, email, and password. Sends a welcome email on success.

**Authentication:**  
Not required.

**Request Body:**

```
{
  "name": "Jane Doe",
  "email": "janedoe@example.com",
  "password": "SuperSecurePass123"
}
```

**Validation:**

- All fields are required.
- Email must be unique.
- Password must meet validation rules.

**Success Response:**

```
{
  "id": "user-uuid-string",
  "name": "Jane Doe",
  "email": "janedoe@example.com"
}
```

**Errors:**

- `400 Bad Request` — Missing required fields or user already exists.
- `500 Internal Server Error` — Server or Supabase error.

---

### User Sign In

**Endpoint:**  
`POST /api/auth/signin`

**Description:**  
Authenticates a user by email and password. Returns an authentication token.

**Authentication:**  
Not required.

**Request Body:**

```
{
  "email": "janedoe@example.com",
  "password": "SuperSecurePass123"
}
```

**Success Response:**

```
{
  "access_token": "",
  "user": {
    "id": "user-uuid-string",
    "email": "janedoe@example.com",
    "name": "Jane Doe"
  }
}
```

**Errors:**

- `400 Bad Request` — Missing email or password.
- `401 Unauthorized` — Invalid credentials.
- `500 Internal Server Error` — Server error.

---

### Resume Analysis

**Endpoint:**  
`POST /api/analyze/resume`

**Description:**  
Analyzes a resume file against a job description. Returns a match score and improvement suggestions.

**Authentication:**  
Not required.

**Request:**  
Content-Type: multipart/form-data

- `file` (File, required): Resume file.
- `jobDescription` (string, required): Job description text.

**Example Request (form fields):**

```
file: 
jobDescription: "Looking for a software engineer..."
```

**Success Response:**

```
{
  "success": true,
  "score": 85,
  "analysis": {
    "keywordMatch": {
      "found": ["software", "engineer", "react"],
      "missing": ["javascript"],
      "score": 75
    },
    "sectionScores": {
      "experience": 100,
      "education": 100,
      "skills": 100,
      "summary": 0
    },
    "formattingScore": 80
  },
  "improvements": {
    "critical": [
      "Add a dedicated summary section."
    ],
    "recommended": [
      "Improve formatting with clear headings..."
    ],
    "aiSuggestions": [
      "Consider adding these keywords: ..."
    ]
  }
}
```

**Errors:**

- `400 Bad Request` — Missing file or jobDescription.
- `500 Internal Server Error`.

---

### Document Generation

**Endpoint:**  
`POST /api/generate`

**Description:**  
Generates AI-powered documents such as resumes, letters, or presentations based on input data.

**Authentication:**  
Required.

**Request Body:**

```
{
  "type": "resume",
  "content": {
    "name": "Jane Doe",
    "experience": [
      {
        "company": "Tech Corp",
        "role": "Software Engineer",
        "years": 3
      }
    ],
    "skills": ["JavaScript", "React"]
  },
  "title": "Senior Developer Resume"
}
```

- `type` (string, required): "resume", "letter", "presentation".
- `content` (object, required).
- `title` (string, required).

**Success Response:**

```
{
  "id": "doc1234",
  "type": "resume",
  "title": "Senior Developer Resume",
  "url": "https://docmagic.app/docs/doc1234.pdf"
}
```

**Errors:**

- `400 Bad Request` — Invalid or missing fields.
- `401 Unauthorized` — Authentication error.
- `500 Internal Server Error`.

---

### Letter Creation

**Endpoint:**  
`POST /api/generate/letter`

**Description:**  
Generates an AI-powered formal or informal letter.

**Authentication:**  
Required.

**Request Body:**

```
{
  "fromName": "Alice Smith",
  "toName": "Bob Johnson",
  "letterType": "formal",
  "prompt": "Request for a recommendation letter"
}
```

- `fromName` (string, required).
- `toName` (string, required).
- `letterType` (string, optional): "formal" or "informal".
- `prompt` (string, required).

**Success Response:**

```
{
  "letter": "Dear Bob Johnson,\n\nI am writing to request a recommendation letter..."
}
```

**Errors:**

- `400 Bad Request`.
- `401 Unauthorized`.
- `500 Internal Server Error`.

---

### Presentation Generation

**Endpoint:**  
`POST /api/generate/presentation`

**Description:**  
Generates AI-powered presentation slide decks.

**Authentication:**  
Required.

**Request Body:**

```
{
  "prompt": "Marketing strategy for Q1 2025",
  "pageCount": 10,
  "template": "modern-business"
}
```

- `prompt` (string, required).
- `pageCount` (number, optional).
- `template` (string, optional).

**Success Response:**

```
{
  "presentationId": "pres5678",
  "url": "https://docmagic.app/presentations/pres5678"
}
```

**Errors:**

- `400 Bad Request`.
- `401 Unauthorized`.
- `500 Internal Server Error`.

---

### Send Email

**Endpoint:**  
`POST /api/send-email`

**Description:**  
Sends an email using DocMagic’s email service.

**Authentication:**  
Required.

**Request Body:**

```
{
  "to": "recipient@example.com",
  "subject": "Welcome!",
  "body": "Thank you for joining DocMagic!"
}
```

**Success Response:**

```
{
  "message": "Email sent successfully."
}
```

**Errors:**

- `400 Bad Request`.
- `401 Unauthorized`.
- `500 Internal Server Error`.

---

### Stripe Subscription

**Endpoint:**  
`POST /api/stripe/create-checkout`

**Description:**  
Creates a Stripe checkout session for subscription/payment.

**Authentication:**  
Required.

**Request Body:**

```
{
  "priceId": "price_abc123",
  "successUrl": "https://docmagic.app/success",
  "cancelUrl": "https://docmagic.app/cancel"
}
```

- `priceId` (string, required).
- `successUrl` (string, required).
- `cancelUrl` (string, required).

**Success Response:**

```
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_xyz"
}
```

**Errors:**

- `400 Bad Request`.
- `401 Unauthorized`.
- `500 Internal Server Error`.

---

## Global Error Codes

| Status Code | Meaning                                     |
|-------------|----------------------------------------------|
| 200         | OK (Request succeeded)                        |
| 400         | Bad Request (Missing/invalid input)           |
| 401         | Unauthorized (Invalid/missing token)          |
| 403         | Forbidden (Insufficient permissions)          |
| 404         | Not Found (Resource/endpoint not found)       |
| 422         | Unprocessable Entity (Validation failed)      |
| 500         | Internal Server Error                          |

---

## Links and References

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [DocMagic GitHub Issues](https://github.com/Muneerali199/DocMagic/issues)
- [DocMagic Project README](https://github.com/Muneerali199/DocMagic#readme)

---

This documentation helps new and experienced contributors quickly understand and use DocMagic’s backend API endpoints effectively.
```
