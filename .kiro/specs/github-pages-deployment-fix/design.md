# Design Document

## Overview

The GitHub Pages deployment failure is caused by the absence of an automated build and deployment workflow. The application is configured with the correct base path (`/vocab-lesson-builder/`) in `vite.config.js`, but there is no mechanism to build the React application and deploy the resulting static files to the `gh-pages` branch.

This design implements a GitHub Actions workflow that automatically builds and deploys the application whenever changes are pushed to the main branch, ensuring the GitHub Pages site stays synchronized with the codebase.

## Architecture

### Current State
- Vite-based React application with correct base path configuration
- Manual deployment instructions in DEPLOYMENT.md
- No automated CI/CD pipeline
- GitHub Pages enabled but serving empty/outdated content

### Target State
- GitHub Actions workflow triggered on push to main branch
- Automated build process using Vite
- Automated deployment to gh-pages branch
- GitHub Pages serving current application build

### Deployment Flow

```
Push to main → GitHub Actions Trigger → Install Dependencies → Build with Vite → Deploy to gh-pages → GitHub Pages Update
```

## Components and Interfaces

### 1. GitHub Actions Workflow File

**Location:** `.github/workflows/deploy.yml`

**Purpose:** Automate the build and deployment process

**Key Components:**
- Trigger configuration (on push to main)
- Node.js environment setup
- Dependency installation
- Build execution
- Deployment to gh-pages branch using peaceiris/actions-gh-pages

**Workflow Steps:**
1. Checkout code from repository
2. Setup Node.js environment (v18)
3. Install dependencies with npm ci
4. Build application with npm run build
5. Deploy dist directory to gh-pages branch

### 2. Build Configuration

**File:** `vite.config.js` (already configured)

**Current Configuration:**
```javascript
base: '/vocab-lesson-builder/'
```

This ensures all asset paths are correctly prefixed for GitHub Pages subdirectory deployment.

### 3. GitHub Pages Configuration

**Settings Required:**
- Source: Deploy from branch `gh-pages`
- Directory: `/` (root)

The workflow will create and maintain this branch automatically.

## Data Models

No data model changes required. The application's existing data structures remain unchanged.

## Error Handling

### Build Failures
- GitHub Actions will fail the workflow if build errors occur
- Error logs visible in Actions tab
- No deployment occurs if build fails
- Developers notified via GitHub notifications

### Deployment Failures
- Workflow fails if gh-pages deployment encounters errors
- Previous deployment remains active (no downtime)
- Retry by pushing new commit or re-running workflow

### Permission Issues
- Workflow uses GITHUB_TOKEN with automatic permissions
- No manual token configuration required
- Token scoped to repository only

## Testing Strategy

### Pre-Deployment Testing
1. Verify vite.config.js base path matches repository name
2. Test local build: `npm run build`
3. Test local preview: `npm run preview`
4. Verify dist directory contains expected files

### Post-Deployment Testing
1. Verify workflow completes successfully in Actions tab
2. Check gh-pages branch exists and contains built files
3. Access GitHub Pages URL and verify application loads
4. Test application functionality (create lesson, load lesson, etc.)
5. Verify asset paths resolve correctly (no 404s in console)
6. Test lesson sharing with short URLs

### Continuous Validation
- Monitor GitHub Actions for build failures
- Check GitHub Pages deployment status
- Verify application updates after each push to main

## Implementation Notes

### GitHub Actions Workflow Details

**Trigger:** Push events to main branch only
- Avoids unnecessary builds on feature branches
- Ensures only reviewed code is deployed

**Node Version:** 18
- Matches development environment
- Compatible with Vite 4.x

**Caching:** npm dependencies cached
- Faster workflow execution
- Reduced GitHub Actions minutes usage

**Deployment Action:** peaceiris/actions-gh-pages@v3
- Industry-standard GitHub Pages deployment action
- Handles gh-pages branch creation and updates
- Supports force push for clean deployments

### Security Considerations

- GITHUB_TOKEN automatically provided by GitHub Actions
- Token has write permissions to repository
- Token expires after workflow completion
- No secrets need to be manually configured

### Performance Considerations

- Workflow typically completes in 2-3 minutes
- GitHub Pages propagation takes 1-2 minutes
- Total deployment time: ~5 minutes from push to live

## Alternative Approaches Considered

### 1. Manual Deployment with git subtree
**Pros:** No workflow file needed
**Cons:** Manual process, error-prone, not automated
**Decision:** Rejected - automation is essential

### 2. Netlify/Vercel Deployment
**Pros:** Simpler setup, faster deployments
**Cons:** Requires external service, user already has GitHub Pages configured
**Decision:** Rejected - GitHub Pages is already the chosen platform

### 3. GitHub Actions with Custom Deployment Script
**Pros:** More control over deployment process
**Cons:** More complex, reinvents existing solutions
**Decision:** Rejected - peaceiris/actions-gh-pages is battle-tested

## Dependencies

- GitHub Actions (built into GitHub)
- peaceiris/actions-gh-pages@v3 (GitHub Action)
- Node.js 18
- Existing npm dependencies (no additions)

## Migration Path

1. Create `.github/workflows` directory
2. Add `deploy.yml` workflow file
3. Push to main branch
4. Workflow automatically runs
5. Verify deployment in GitHub Pages settings
6. Test application at GitHub Pages URL

No breaking changes. Existing local development workflow unchanged.
