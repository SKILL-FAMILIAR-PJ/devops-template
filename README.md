# RSF DevOps Template

A comprehensive collection of reusable GitHub Actions workflows and composite actions for modern JavaScript/TypeScript projects with automated CI/CD pipelines.

## 🚀 Features

- **Automated Quality Gates**: Lint, type-check, and SonarQube analysis
- **Semantic Versioning**: Automated releases with conventional commits
- **Multi-Environment Deployment**: Support for dev/qa/stg/prod environments
- **Storybook Integration**: Build and deploy Storybook to S3/CloudFront
- **Teams Notifications**: Deployment status notifications to Microsoft Teams
- **Flexible Configuration**: Customizable commands and parameters

## 📁 Repository Structure

```
actions/
├── common/
│   └── notify-teams/        # Microsoft Teams notifications
├── front-end/
│   ├── build-storybook/     # Build and upload Storybook artifacts
│   ├── deploy-s3/           # Deploy to AWS S3 with environment folders
│   ├── lint-and-typecheck/  # ESLint and TypeScript validation
│   ├── semantic-release/    # Automated versioning and releases
│   ├── setup-node/          # Node.js environment setup with caching
│   └── sonarqube-analysis/  # SonarQube code quality analysis
└── workflows/
    └── front-end/
        ├── branch-release.yml   # Automated releases from main branch
        ├── pr-quality-gate.yml  # Pull request validation pipeline
        └── tag-deployment.yml   # Tag-based deployment workflow
```

## 🔧 Composite Actions

### [`setup-node`](actions/front-end/setup-node/action.yml)

Sets up Node.js environment with dependency caching.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/front-end/setup-node@main
  with:
    node-version: "20"
    install-command: "yarn install --immutable"
```

**Inputs:**

- `node-version` (optional): Node.js version (default: '20')
- `install-command` (optional): Package installation command (default: 'yarn install --immutable')

### [`lint-and-typecheck`](actions/front-end/lint-and-typecheck/action.yml)

Runs ESLint and TypeScript type checking.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/front-end/lint-and-typecheck@main
  with:
    lint-command: "yarn lint"
    typecheck-command: "yarn tsc"
    skip-lint: "false"
    skip-typecheck: "false"
```

**Inputs:**

- `lint-command` (optional): Linting command (default: 'yarn lint')
- `typecheck-command` (optional): Type checking command (default: 'yarn tsc')
- `skip-lint` (optional): Skip linting step (default: 'false')
- `skip-typecheck` (optional): Skip type checking step (default: 'false')

### [`sonarqube-analysis`](actions/front-end/sonarqube-analysis/action.yml)

Performs SonarQube code quality analysis with quality gate checks.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/front-end/sonarqube-analysis@main
  with:
    sonar-token: ${{ secrets.SONAR_TOKEN }}
    sonar-host-url: ${{ secrets.SONAR_HOST_URL }}
    wait-for-quality-gate: "false"
```

**Inputs:**

- `sonar-token` (required): SonarQube authentication token
- `sonar-host-url` (optional): SonarQube server URL
- `wait-for-quality-gate` (optional): Wait for quality gate result (default: 'false')
- `working-directory` (optional): Working directory (default: '.')

### [`build-storybook`](actions/front-end/build-storybook/action.yml)

Builds Storybook and uploads artifacts with optional version updates.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/front-end/build-storybook@main
  with:
    build-command: "yarn build-storybook"
    artifact-name: "storybook-static"
    update-version: "true"
    retention-days: "7"
```

**Inputs:**

- `build-command` (optional): Storybook build command (default: 'yarn build-storybook')
- `artifact-name` (optional): Name for uploaded artifact (default: 'storybook-static')
- `update-version` (optional): Update version in package.json (default: 'true')
- `retention-days` (optional): Artifact retention days (default: '7')

### [`deploy-s3`](actions/front-end/deploy-s3/action.yml)

Deploys artifacts to S3 with tag-specific and environment-specific folders.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/front-end/deploy-s3@main
  with:
    artifact-name: "storybook-static"
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: "us-east-1"
    s3-bucket: "my-deployment-bucket"
    s3-folder: "storybook"
    environment: "DEV"
```

**Inputs:**

- `artifact-name` (required): Name of the artifact to download
- `aws-access-key-id` (required): AWS Access Key ID
- `aws-secret-access-key` (required): AWS Secret Access Key
- `aws-region` (required): AWS Region
- `s3-bucket` (required): S3 Bucket name
- `s3-folder` (required): S3 base folder path
- `environment` (required): Environment name (DEV, QA, etc.)
- `source-path` (optional): Local path to sync (default: './storybook')

### [`semantic-release`](actions/front-end/semantic-release/action.yml)

Automated semantic versioning and GitHub releases.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/front-end/semantic-release@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    release-command: "npx semantic-release"
```

**Inputs:**

- `github-token` (required): GitHub token for creating releases
- `release-command` (optional): Command to run semantic release (default: 'npx semantic-release')
- `working-directory` (optional): Working directory for the release (default: '.')

### [`notify-teams`](actions/common/notify-teams/action.yml)

Sends deployment notifications to Microsoft Teams.

```yaml
- uses: SKILL-FAMILIAR-PJ/devops-template/actions/common/notify-teams@main
  with:
    webhook-url: ${{ secrets.TEAMS_WEBHOOK_URL }}
    cf-domain: "https://d123456789.cloudfront.net"
    title-prefix: "✅ Deployed"
    theme-color: "2EB886"
```

**Inputs:**

- `webhook-url` (required): Microsoft Teams webhook URL
- `cf-domain` (required): CloudFront domain for the deployed app
- `title-prefix` (optional): Prefix for notification title (default: '✅ Deployed')
- `theme-color` (optional): Theme color for the notification (default: '2EB886')
- `environment` (optional): Environment name
- `tag` (optional): Deployment tag

## 📋 Reusable Workflows

### Branch Release Workflow

Automated releases triggered by pushes to the main branch.

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/branch-release.yml@main
    with:
      node-version: "20"
      skip-sonarqube: false
    secrets:
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      CI_WORKER_REPOSITORY_TOKEN: ${{ secrets.CI_WORKER_REPOSITORY_TOKEN }}
```

**Inputs:**

- `node-version` (optional): Node.js version (default: '20')
- `install-command` (optional): Package installation command
- `actions-repo` (optional): Repository containing reusable actions
- `actions-ref` (optional): Ref of actions repository
- `skip-sonarqube` (optional): Skip SonarQube analysis (default: false)

**Secrets:**

- `SONAR_TOKEN`: SonarQube authentication token
- `SONAR_HOST_URL`: SonarQube server URL
- `CI_WORKER_REPOSITORY_TOKEN`: GitHub token with repository write access

### PR Quality Gate Workflow

Validation pipeline for pull requests with lint, type-check, and SonarQube analysis.

```yaml
name: PR Quality Gate
on:
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/pr-quality-gate.yml@main
    with:
      node-version: "20"
      lint-command: "yarn lint"
      typecheck-command: "yarn tsc"
      skip-sonarqube: false
    secrets:
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

**Inputs:**

- `node-version` (optional): Node.js version (default: '20')
- `install-command` (optional): Package installation command
- `lint-command` (optional): Linting command (default: 'yarn lint')
- `typecheck-command` (optional): Type checking command (default: 'yarn tsc')
- `actions-repo` (optional): Repository containing reusable actions
- `actions-ref` (optional): Ref of actions repository
- `skip-sonarqube` (optional): Skip SonarQube analysis (default: false)

**Secrets:**

- `SONAR_TOKEN`: SonarQube authentication token
- `SONAR_HOST_URL`: SonarQube server URL

### Tag Deployment Workflow

Multi-environment deployment triggered by Git tags.

```yaml
name: Deploy
on:
  push:
    tags: ["v*"]

jobs:
  deploy-dev:
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/tag-deployment.yml@main
    with:
      environment: "dev"
      tag-pattern: "v*"
      s3-bucket: "my-storybook-bucket"
      s3-folder: "storybook"
      cf-domain: "https://d123456789.cloudfront.net"
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.DEV_AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.DEV_AWS_SECRET_ACCESS_KEY }}
      TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

**Inputs:**

- `environment` (required): Environment name (dev, qa, prod)
- `tag-pattern` (optional): Git tag pattern to trigger deployment
- `s3-bucket` (required): S3 bucket for deployment
- `s3-folder` (required): S3 folder path
- `cf-domain` (required): CloudFront domain
- `node-version` (optional): Node.js version
- `actions-repo` (optional): Repository containing reusable actions
- `actions-ref` (optional): Ref of actions repository

**Secrets:**

- `AWS_ACCESS_KEY_ID`: AWS access key for S3 deployment
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 deployment
- `TEAMS_WEBHOOK_URL`: Microsoft Teams webhook URL

## 🔐 Required Secrets

### Core Secrets

- `CI_WORKER_REPOSITORY_TOKEN`: GitHub token with repository write access
- `SONAR_TOKEN`: SonarQube authentication token
- `SONAR_HOST_URL`: SonarQube server URL

### AWS Deployment

- `AWS_ACCESS_KEY_ID`: AWS access key for S3 deployment
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 deployment

### Notifications

- `TEAMS_WEBHOOK_URL`: Microsoft Teams webhook URL for notifications

## 🛠️ Prerequisites

Your project should have:

- `package.json` with standard npm/yarn scripts
- Node.js/TypeScript configuration
- ESLint configuration
- Optional: `sonar-project.properties` for SonarQube
- Optional: Semantic Release configuration (`.releaserc.json` or `release.config.js`)

### Example package.json scripts:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "tsc": "tsc --noEmit",
    "build-storybook": "storybook build"
  }
}
```

## 📝 Example Project Setup

### Complete CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
    tags: ["v*"]
  pull_request:
    branches: [main]

jobs:
  # PR Quality Gate
  quality-gate:
    if: github.event_name == 'pull_request'
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/pr-quality-gate.yml@main
    with:
      node-version: "20"
      lint-command: "yarn lint"
      typecheck-command: "yarn tsc"
    secrets:
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  # Branch Release
  release:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/branch-release.yml@main
    with:
      node-version: "20"
    secrets:
      CI_WORKER_REPOSITORY_TOKEN: ${{ secrets.CI_WORKER_REPOSITORY_TOKEN }}
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  # Development Deployment
  deploy-dev:
    if: startsWith(github.ref, 'refs/tags/v') && contains(github.ref, 'dev')
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/tag-deployment.yml@main
    with:
      environment: "dev"
      s3-bucket: "my-dev-bucket"
      s3-folder: "storybook"
      cf-domain: "https://dev.example.com"
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.DEV_AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.DEV_AWS_SECRET_ACCESS_KEY }}
      TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}

  # Production Deployment
  deploy-prod:
    if: startsWith(github.ref, 'refs/tags/v') && !contains(github.ref, 'dev') && !contains(github.ref, 'qa')
    uses: SKILL-FAMILIAR-PJ/devops-template/.github/workflows/front-end/tag-deployment.yml@main
    with:
      environment: "prod"
      s3-bucket: "my-prod-bucket"
      s3-folder: "storybook"
      cf-domain: "https://prod.example.com"
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
      TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

### Semantic Release Configuration

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    [
      "@semantic-release/npm",
      {
        "npmPublish": false
      }
    ]
  ]
}
```

## 🏗️ S3 Deployment Structure

The deployment creates the following S3 structure:

```
s3://your-bucket/
├── storybook/
│   ├── DEV/
│   │   └── v1.2.3-dev.1/
│   ├── QA/
│   │   └── v1.2.3-qa.1/
│   └── PROD/
│       └── v1.2.3/
```

## 🔄 Workflow Triggers

### Branch Release

- Triggered on: Push to `main` branch
- Actions: Quality checks → SonarQube analysis → Semantic release

### PR Quality Gate

- Triggered on: Pull request to `main` branch
- Actions: Setup → Lint → Type check → SonarQube analysis

### Tag Deployment

- Triggered on: Git tag creation (matching pattern)
- Actions: Build Storybook → Deploy to S3 → Notify Teams

## 🎯 Best Practices

1. **Use conventional commits** for automatic semantic versioning
2. **Set up branch protection rules** requiring PR quality gates
3. **Use different AWS credentials** for each environment
4. **Configure SonarQube quality gates** for code quality enforcement
5. **Use environment-specific secrets** for secure deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with a sample project
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Maintained by**: SKILL-FAMILIAR-PJ Team  
**Repository**: `SKILL-FAMILIAR-PJ/devops-template`  
**Issues**: [GitHub Issues](https://github.com/SKILL-FAMILIAR-PJ/devops-template/issues)
