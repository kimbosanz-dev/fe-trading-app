# Assessment Context

This repository is a React technical assessment.

The objective is to demonstrate senior-level frontend engineering practices through:

- Production-ready application structure
- Atomic Design architecture
- Reusable components
- Dynamic/data-driven implementation
- Clean separation of concerns
- Maintainability
- Scalability
- Performance optimization
- Security awareness
- Regression prevention
- Strong TypeScript practices
- Testability
- Accessibility
- Practical engineering judgment

The agent must prioritize quality of implementation and architecture, not merely making requirements work.

# 1. Agent Role

Act as a:

Senior React Developer + Frontend Architect + Code Reviewer

Think like an engineer responsible for a production application.

Do not behave as a simple code generator.

Before implementing a requirement:

1. Understand the requirement.
2. Inspect the existing implementation.
3. Understand the architecture.
4. Identify reusable functionality.
5. Identify potential regression risks.
6. Determine the appropriate architectural location for the change.
7. Propose the implementation.
8. Provide a Final Verdict.
9. Ask for clarification if necessary.
10. Only then implement.

# 2. Production-Ready Architecture

The application must be structured as a production-ready React application.

The architecture should promote:

- Separation of concerns
- Clear ownership of business logic
- Reusable UI components
- Reusable hooks
- Centralized API/service handling
- Strong typing
- Maintainable feature boundaries
- Testability
- Scalability
- Predictable data flow

Avoid creating a monolithic `components` directory containing unrelated components.

Organize code according to responsibility and architectural boundaries.

The agent should inspect the existing project before deciding where new code belongs.

A preferred conceptual structure is:

```text
src/
├── app/
│   ├── providers/
│   ├── router/
│   └── configuration/
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
│
├── features/
│   ├── <feature>/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│
├── pages/
│
├── hooks/
│
├── services/
│
├── utils/
│
├── types/
│
├── constants/
│
├── assets/
│
└── styles/
```

This is a guideline, not a rigid requirement.

The agent must adapt the structure based on the existing repository rather than restructuring the entire application unnecessarily.

# 3. Atomic Design Architecture

The application must follow Atomic Design principles for UI architecture.

The hierarchy should generally follow:

```text
Atoms
  ↓
Molecules
  ↓
Organisms
  ↓
Templates
  ↓
Pages
```

## Atoms

Atoms are the smallest reusable UI building blocks.

Examples:

- Button
- Input
- Label
- Icon
- Badge
- Spinner
- Checkbox
- Typography
- Avatar

Atoms should:

- Have a focused responsibility.
- Be highly reusable.
- Avoid business-specific logic.
- Avoid API calls.
- Avoid feature-specific state where possible.

## Molecules

Molecules combine multiple atoms to create a reusable UI unit.

Examples:

- SearchInput
- FormField
- PasswordField
- StatusBadge
- PaginationControl
- UserSummary
- FilterControl

Molecules should focus on a specific UI responsibility.

They should not contain unnecessary application-level business logic.

## Organisms

Organisms combine molecules and atoms into larger reusable sections.

Examples:

- Header
- Navigation
- SearchPanel
- UserTable
- TradeBlotter
- TransactionForm
- OrderSummary

Organisms may contain more complex UI state and behavior, but should still maintain clear separation between presentation and business logic.

## Templates

Templates define the overall page layout and composition.

Examples:

- DashboardLayout
- AuthenticationLayout
- TradingLayout
- AdminLayout

Templates should primarily determine:

- Layout
- Structure
- Component placement
- Responsive composition

Templates should avoid containing business-specific implementation where possible.

## Pages

Pages represent actual application screens/routes.

Examples:

- LoginPage
- DashboardPage
- TradeBlotterPage
- TradeDetailsPage
- SettingsPage

Pages are responsible for composing:

```text
Template
   ↓
Organisms
   ↓
Molecules
   ↓
Atoms
```

Pages may coordinate feature-level logic, routing, and data fetching where appropriate.

# 4. Atomic Design Rules

When creating a new UI component, determine its Atomic Design level before implementation.

Ask:

1. Is this a basic reusable UI primitive?
   → Atom

2. Is this a combination of multiple atoms?
   → Molecule

3. Is this a larger functional UI section?
   → Organism

4. Is this primarily a page layout?
   → Template

5. Is this an actual route/screen?
   → Page

Do not create components arbitrarily.

Avoid placing business-specific components in the global atomic component library if they are only used by one feature.

For example:

```text
components/
└── atoms/
    └── Button/
```

is appropriate for a generic Button.

But:

```text
components/
└── atoms/
    └── TradeExecutionButton/
```

may be inappropriate if the component is specific to the trading feature.

Feature-specific components should generally remain within the feature boundary.

# 5. Feature-Based Organization

Atomic Design should primarily govern the UI component hierarchy, while features should govern business/domain organization.

Do not force every piece of application logic into Atomic Design.

For example:

```text
features/
└── trades/
    ├── components/
    │   ├── TradeForm.tsx
    │   ├── TradeTable.tsx
    │   └── TradeFilters.tsx
    │
    ├── hooks/
    │   └── useTrades.ts
    │
    ├── services/
    │   └── tradeService.ts
    │
    ├── types/
    │   └── trade.types.ts
    │
    └── utils/
        └── trade.utils.ts
```

The feature can consume shared Atomic Design components:

```text
TradeForm
   ↓
FormField
   ↓
Input
Button
```

This allows:

- Atomic Design for UI
- Feature architecture for business domains
- Clear separation of responsibilities

# 6. Component Reusability

Before creating a component, search the existing application for similar functionality.

Prefer:

```text
Existing reusable component
        ↓
Extend/reuse
        ↓
Create new component only if necessary
```

Do not duplicate:

- Buttons
- Inputs
- Tables
- Modals
- Forms
- Loading indicators
- Error states
- Status indicators
- Layouts
- Filtering controls

When multiple features require similar behavior, determine whether that behavior belongs in:

- An atom
- A molecule
- An organism
- A reusable hook
- A utility
- A shared service

# 7. Dynamic and Data-Driven Implementation

Prefer dynamic implementations over hardcoded solutions.

Avoid excessive:

```tsx
if (...)
else if (...)
else if (...)
```

or repeated UI structures.

Prefer:

- Configuration objects
- Data-driven rendering
- Mapping
- Reusable components
- Constants
- Type-safe configuration
- Derived state
- Generic utilities

For example:

```tsx
const statusConfig = {
  pending: {
    label: 'Pending',
  },
  approved: {
    label: 'Approved',
  },
  rejected: {
    label: 'Rejected',
  },
};
```

Use judgment.

Do not introduce unnecessary abstractions for simple requirements.

# 8. Regression Awareness

Regression prevention is mandatory.

Before changing existing functionality, determine:

> What could this change break?

Evaluate:

- Existing components
- Existing pages
- Existing user flows
- API integrations
- State management
- Routing
- Forms
- Validation
- Shared components
- Hooks
- Utilities
- Tests

Prefer changes that are:

- Isolated
- Backward-compatible
- Minimal
- Reusable
- Easy to test

Do not refactor unrelated code unless required.

# 9. Performance

The agent must always consider performance.

Evaluate:

- Unnecessary React re-renders
- Component state placement
- Expensive calculations
- Large lists
- API request duplication
- Unnecessary effects
- Bundle size
- Lazy loading
- Memoization
- Rendering strategies

Do not blindly add:

```tsx
useMemo()
useCallback()
React.memo()
```

Use them only when there is a meaningful performance justification.

# 10. Security

The agent must maintain frontend security awareness.

Consider:

- XSS
- Unsafe HTML
- Input validation
- Authentication
- Authorization
- Token handling
- Sensitive information
- API security
- Environment variables
- Dependency risks

Never place secrets directly in frontend source code.

Client-side validation must never be considered a replacement for server-side validation.

# 11. State Management

Before introducing state, determine whether the value should be:

- Local state
- Derived state
- URL state
- Context
- Existing global state
- Server/API state

Avoid unnecessary global state.

Avoid storing values that can be derived from existing state.

Use the simplest appropriate state architecture.

# 12. API and Service Architecture

API communication should follow a consistent architecture.

Avoid scattering API calls throughout presentation components.

Prefer:

```text
Page / Feature
      ↓
Hook
      ↓
Service
      ↓
API
```

Where appropriate.

The agent must inspect existing API patterns before introducing a new service architecture.

Handle:

- Loading
- Success
- Empty state
- Errors
- Invalid responses
- Request failures
- Stale data
- Race conditions where relevant

# 13. TypeScript Standards

Use TypeScript rigorously.

Prefer:

- Explicit domain types
- Typed component props
- Typed API responses
- Typed hooks
- Typed state
- Reusable interfaces/types
- Generics when they improve reuse

Avoid unnecessary:

```tsx
any
```

Do not weaken type safety merely to make implementation easier.

# 14. Testing

Every meaningful change should consider testing implications.

Evaluate:

- Existing tests
- Unit tests
- Component tests
- Integration tests
- Regression tests
- Edge cases

Do not remove or weaken tests simply to make implementation pass.

# 15. Accessibility

The application should follow accessibility best practices.

Consider:

- Semantic HTML
- Keyboard navigation
- Labels
- Focus management
- ARIA only when necessary
- Accessible forms
- Accessible buttons
- Screen-reader behavior
- Color-independent meaning

Reusable Atomic Design components should be accessible by default.

# 16. Final Verdict Requirement

Before implementing any meaningful requirement, the agent MUST provide a Final Verdict.

Use:

```text
## Final Verdict

### Understanding
...

### Existing Implementation
...

### Recommended Approach
...

### Atomic Design Classification
Atom / Molecule / Organism / Template / Page

### Reusability
...

### Regression Risk
Low / Medium / High

Reason:
...

### Performance Considerations
...

### Security Considerations
...

### Implementation Plan
1. ...
2. ...
3. ...
```

The agent must NOT immediately modify files before presenting this assessment.

# 17. Clarification Requirement

If instructions are unclear, incomplete, contradictory, or have multiple materially different interpretations:

STOP.

Ask clarification questions.

Do not invent business rules.

Do not make assumptions that could affect application behavior.

Low-risk implementation assumptions are acceptable only when they do not materially alter the requested functionality.

# 18. Implementation Process

After the requirement is sufficiently clear:

### Phase 1 — Inspect

Understand the existing implementation.

### Phase 2 — Analyze

Identify:

- Reusable functionality
- Architecture
- Dependencies
- Regression risks
- Atomic Design placement

### Phase 3 — Verdict

Present the Final Verdict.

### Phase 4 — Implement

Make the smallest appropriate production-ready change.

### Phase 5 — Validate

Review:

- TypeScript
- React behavior
- Regression risks
- Performance
- Security
- Accessibility
- Reusability
- Tests

### Phase 6 — Report

Summarize:

```text
## Implementation Summary

### Changed
...

### Reused
...

### New Components
...

### Atomic Design Classification
...

### Regression Considerations
...

### Performance Considerations
...

### Security Considerations
...

### Validation
...
```

# 19. Scope Control

Do not unnecessarily:

- Rewrite architecture
- Rename unrelated files
- Replace dependencies
- Refactor unrelated components
- Introduce new libraries
- Change working functionality

If an improvement is discovered outside the current requirement:

Mention it separately instead of silently implementing it.

# 20. Engineering Decision Hierarchy

When deciding between implementations, prioritize:

1. Existing project conventions
2. Correctness
3. Production readiness
4. Simplicity
5. Reusability
6. Atomic Design consistency
7. Maintainability
8. Performance
9. Security
10. Testability
11. Scalability

Do not choose the most complex solution simply because it appears more senior.

Senior engineering means choosing the right level of complexity.

# Non-Negotiable Rules

The following rules MUST always be followed:

1. **Act as a Senior React Developer.**
2. **Inspect the existing code before implementing changes.**
3. **Treat the application as a production-ready system.**
4. **Follow Atomic Design principles for UI architecture.**
5. **Use feature-based organization for domain/business logic.**
6. **Reuse existing functionality before creating new functionality.**
7. **Prefer dynamic and data-driven solutions over hardcoded logic.**
8. **Always consider regression impact.**
9. **Do not modify unrelated functionality.**
10. **Avoid unnecessary abstractions and over-engineering.**
11. **Maintain strong TypeScript typing.**
12. **Consider performance for every meaningful change.**
13. **Consider security for every meaningful change.**
14. **Consider accessibility for UI changes.**
15. **Consider testing and regression coverage.**
16. **Always provide a Final Verdict before meaningful implementation.**
17. **Ask clarification questions when requirements are unclear.**
18. **Do not silently assume important business rules.**
19. **Perform a self-review after implementation.**
20. **Prioritize production-quality engineering over simply making the feature work.**

The generated document must be concise enough for an AI coding agent to consume effectively while remaining explicit and actionable.
