# Contributing to Uhuru SDPM

Thank you for your interest in contributing to the Uhuru Service Delivery Portfolio Manager!

## Development Workflow

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/nehakuchipudi/uhuru-sdpm.git
   cd uhuru-sdpm
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up your environment**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - Configure any additional environment variables

5. **Start development**
   ```bash
   pnpm dev
   ```

### Code Standards

#### File Organization
- Place React components in `/src/app/components/`
- Use absolute imports with the `@` alias: `import { Component } from '@/app/components/Component'`
- Organize UI components in `/src/app/components/ui/`

#### TypeScript
- Define types in `/src/types/index.ts`
- Use proper TypeScript types (avoid `any`)
- Export interfaces for reusable types

#### Styling
- Use Tailwind CSS v4 classes
- Follow the design system in `/src/styles/theme.css`
- Maintain responsive design principles
- Don't override font sizes, weights, or line heights unless necessary

#### Components
- Use functional components with hooks
- Follow React best practices
- Ensure components are accessible
- Add proper prop types and documentation

#### Naming Conventions
- Components: PascalCase (e.g., `ProjectDetailPage.tsx`)
- Files: kebab-case or PascalCase for components
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### Commit Messages

Follow conventional commit format:
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(projects): add milestone tracking to Gantt chart

- Implemented drag-and-drop milestone positioning
- Added milestone completion status indicators
- Updated project timeline calculations

Closes #123
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main
   ```

2. **Test your changes**
   - Ensure the app builds: `pnpm build`
   - Test all affected features
   - Check responsive design

3. **Create a pull request**
   - Provide a clear description
   - Reference related issues
   - Include screenshots for UI changes
   - List breaking changes (if any)

4. **Code review**
   - Address reviewer feedback
   - Keep the discussion focused
   - Update the PR as needed

### Module Guidelines

#### Projects 2.0
- Follow existing project structure patterns
- Maintain Gantt chart functionality
- Update related dashboard components

#### Work Orders 2.0
- Ensure status transitions are valid
- Test photo upload functionality
- Validate completion workflows

#### Recurring Services
- Test schedule generation logic
- Verify frequency calculations
- Check integration with Work Schedule

#### Work Schedule
- Maintain SIPOC view structure
- Test source toggle functionality
- Ensure date navigation works correctly

#### Reports
- Follow table-based report patterns
- Test filtering and export features
- Validate cross-module data aggregation

#### AI Insights
- Ensure insights are actionable
- Test priority calculations
- Maintain dismissible UI patterns

### Testing

- Test on different screen sizes
- Verify cross-browser compatibility
- Check accessibility with screen readers
- Test keyboard navigation
- Validate form inputs

### Documentation

- Update README.md for new features
- Add inline code comments for complex logic
- Document API changes
- Update type definitions

### Questions?

If you have questions or need clarification:
- Check existing GitHub Issues
- Review the codebase for similar implementations
- Ask in your pull request
- Contact the maintainers

---

**Thank you for contributing to Uhuru SDPM!**

Dillon Morgan Consulting Inc.
