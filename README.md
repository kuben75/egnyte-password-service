# Password Strength Microservice

A secure, and production-ready microservice built with NestJS for evaluating password entropy and detecting known data breaches. Designed with enterprise-grade security standards, specifically catering to clients in regulated industries (HIPAA, FedRAMP).

<div align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white" alt="Swagger" />
</div>
<br/>

##  Key Decisions & Assumptions

### 1. Framework & Architecture
**NestJS** was chosen as the core framework. Its out-of-the-box support for TypeScript, Dependency Injection, and decorators allows for a highly structured, scalable, and testable codebase. It provides an enterprise-ready architecture that strongly resonates with established paradigms found in C# and .NET environments (which I'm using daily), ensuring rapid development and maintainability.

### 2. Password Entropy (zxcvbn vs. Regex)
Instead of relying on rigid Regular Expressions (which often force users to create hard-to-remember passwords like `P@ssw0rd1!`), this service uses Dropbox's **zxcvbn** library. It calculates true entropy by checking passwords against dictionaries, common patterns, and spatial key placements, aligning with modern NIST guidelines.

### 3. Data Breach Detection (k-Anonymity)
To meet the stringent security requirements of healthcare and finance sectors, passwords must be checked against known breaches without ever exposing the user's actual password.
*   **Decision:** Integration with the *Have I Been Pwned* (HIBP) API using the **k-Anonymity** model.
*   **Implementation:** The service hashes the password (SHA-1) locally and sends only the first 5 characters (prefix) over the network. The actual password never leaves server.

### 4. Edge Cases & Fail-Open Strategy
*   **Predictable Input Penalization:** If a user submits their email, the system automatically splits the string and severely penalizes passwords containing prefix of the email or the username.
*   **Fail-Open:** If the external HIBP API experiences downtime, the system catches the error and gracefully falls back to local entropy analysis, ensuring the end-user registration process is not blocked by third-party outages.

##  AI Collaboration

In alignment with modern development practices, Artificial Intelligence was actively utilized throughout this project's lifecycle as an accelerator and pair-programming partner:
*   **Rapid Prototyping:** Accelerating the boilerplate setup of NestJS modules and Docker configurations.
*   **Test Generation:** Assisting in drafting comprehensive Jest unit tests for edge cases.
*   **Security Brainstorming:** Validating architectural concepts regarding HIPAA/FedRAMP compliance (e.g., confirming the k-Anonymity approach for HIBP integration).
*   **Code Refactoring:** Assisting in restructuring **password.service.ts** class to avoid violating the Single Responsibility Principle, thereby preventing it from becoming a "God Object" and maintaining architectural clarity.

##  Production Readiness

This microservice includes several layers of defense for a production environment:
*   **Docker Multi-Stage Build:** Ensures the final production image is lightweight and stripped of development dependencies.
*   **Rate Limiting:** `@nestjs/throttler` is globally applied (max 5 requests/min per IP) to prevent Brute-Force and DDoS attacks.
*   **HTTP Security Headers:** `helmet` is active to mask the technology stack footprint and protect against XSS.
*   **Strict Input Validation:** `ValidationPipe` with whitelist enforcement rejects mass-assignment attacks and malformed JSON payloads immediately.

## How to Run

### Option 1: Docker (Recommended)
The easiest way to run the service using the production-optimized container.
```bash
docker-compose up -d
```

The service will be available on http://localhost:3000, but I didn't create a frontend for it so currently recommended option is to use Swagger UI (http://localhost:3000/api-docs).

### Option 2: Local Development
1. Clone the repository:
```bash
git clone https://github.com/kuben75/egnyte-password-service.git

npm install

npm run start:dev
```
## API Documentation
Once the application is running, the interactive OpenAPI (Swagger) documentation is available at: http://localhost:3000/api-docs

You can execute evaluation requests directly from the browser UI.

## Running Tests
The business logic and controllers are covered by Unit Tests using the AAA pattern. External dependencies are mocked for reliability.

```bash
npm run test
```
