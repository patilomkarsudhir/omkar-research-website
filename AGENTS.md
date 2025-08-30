# AGENTS.md

## Project Overview

Academic research portfolio website for Omkar Sudhir Patil, showcasing work in Control Systems, AI, and Robotics. Built with Next.js 14 App Router, TypeScript, and Tailwind CSS. Features interactive research demonstrations, automated Google Scholar publication tracking, and mathematical visualizations.

**Domain Focus**: Control Theory, Neural Networks, PINNs (Physics-Informed Neural Networks), Robotics, Multi-agent Systems

## Architecture

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom components for research presentations
- **Interactive Demos**: D3.js for mathematical visualizations, custom HTML/JS for complex simulations
- **Data Layer**: Google Scholar API integration, JSON caching system
- **Automation**: Python scripts for publication tracking and data updates
- **Deployment**: Vercel with environment variables for Scholar API

## Build & Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Update Google Scholar cache
npm run update-scholar
```

## Development Environment

- **Node.js**: 18+ required
- **Package Manager**: npm (primary), yarn compatible
- **TypeScript**: Strict mode enabled
- **Python**: 3.8+ for automation scripts (optional for frontend development)

## Code Style & Standards

### TypeScript
- **Strict mode enabled** - all type errors must be resolved
- **No `any` types** - use proper typing or `unknown` with type guards
- **Interface over type** for object definitions
- **Functional components** with TypeScript interfaces for props

### React/Next.js Patterns
- **App Router** structure - use `app/` directory conventions
- **Server Components** by default, mark with 'use client' only when needed
- **Async Server Components** for data fetching
- **Custom hooks** for complex state logic

### Styling
- **Tailwind CSS** - utility-first approach
- **Responsive design** - mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Dark mode ready** - use `dark:` variants where applicable
- **Custom components** in `/app/components/` for reusable UI elements

### File Organization
```
app/
├── (routes)/           # Page routes
├── components/         # Reusable React components
├── lib/               # Utilities and configurations
└── api/               # API routes for data fetching

public/                # Static assets and standalone demos
scripts/               # Python automation scripts
data/                  # Cached JSON data
```

## Research-Specific Guidelines

### Academic Rigor & Mathematical Standards
- **LaTeX Mathematical Notation** - ALWAYS use LaTeX syntax for ALL mathematical expressions, even simple ones
  - Use `$\mathbf{x} \in \mathbb{R}^n$` instead of "x in R^n"
  - Write `$\dot{x} = f(x, u)$` instead of "x_dot = f(x, u)"
  - Complex expressions: `$\mathcal{L}_f h(x) = \nabla h(x) \cdot f(x)$`
  - Matrix notation: `$\mathbf{A} \in \mathbb{R}^{n \times m}$`, `$\det(\mathbf{A})$`, `$\|\mathbf{x}\|_2$`

- **Control Theory Precision** - maintain mathematical rigor expected in control systems research
  - State-space representations: `$\dot{\mathbf{x}} = \mathbf{A}\mathbf{x} + \mathbf{B}\mathbf{u}$`
  - Lyapunov stability: `$V(\mathbf{x}) > 0$` for `$\mathbf{x} \neq \mathbf{0}$` and `$\dot{V}(\mathbf{x}) < 0$`
  - Control Lyapunov Functions (CLFs), Control Barrier Functions (CBFs)
  - Proper use of supremum/infimum, essential supremum when discussing bounds

- **Deep Mathematical Reasoning** - think through implications and connections
  - Verify mathematical consistency across related equations
  - Check dimensional analysis for all physical quantities
  - Ensure proper mathematical context (domains, ranges, assumptions)
  - Consider edge cases and mathematical pathologies

### Academic Content Standards
- **Technical accuracy** - verify ALL mathematical formulations with rigorous scrutiny
- **Proof-level precision** - mathematical statements should be theorem-quality accurate
- **Citation format** - IEEE format for engineering, or venue-specific for publications
- **Terminology** - use precise mathematical and control-theoretic terminology
  - "asymptotically stable" vs "stable" vs "exponentially stable"
  - "almost everywhere" vs "everywhere" for measure-theoretic concepts
  - "positive definite" vs "positive semi-definite"

### Content Types with Mathematical Rigor
- **Research descriptions** - maintain graduate-level mathematical exposition
- **Mathematical derivations** - show key steps, state assumptions clearly
- **Theoretical results** - present with proper mathematical structure (theorem/proof style)
- **Interactive visualizations** - verify mathematical correctness at implementation level
- **Algorithm descriptions** - provide complexity analysis and convergence guarantees where applicable

### Control Theory & Robotics Specifics
- **System Models** - always specify system class (linear/nonlinear, time-invariant/variant)
- **Stability Analysis** - use proper Lyapunov theory terminology and notation
- **Optimization** - specify problem class (convex/non-convex, constrained/unconstrained)
- **Neural Networks** - maintain mathematical rigor in universal approximation discussions
- **Stochastic Systems** - proper probability notation and measure-theoretic foundations when needed

## Component Patterns

### Standard Components
- Use functional components with TypeScript interfaces
- Props should be explicitly typed
- Export both named and default where appropriate

```typescript
interface ComponentProps {
  title: string;
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ title, children }) => {
  return <div className="...">{children}</div>;
};
```

### Interactive Components
- Mark with 'use client' directive
- Handle loading states for data-heavy visualizations
- Implement proper error boundaries
- Optimize for mobile interaction
- **Mathematical Accuracy Requirements**:
  - Verify numerical stability of algorithms
  - Check convergence properties of iterative methods
  - Ensure proper scaling and numerical conditioning
  - Test edge cases (singularities, boundary conditions)
  - Validate against analytical solutions where available

## Mathematical Verification & Testing

### Rigorous Testing Standards
- **Analytical Verification** - compare numerical results against known analytical solutions
- **Convergence Testing** - verify convergence rates match theoretical predictions
- **Stability Testing** - test system behavior near equilibria and boundaries
- **Robustness Analysis** - test sensitivity to parameter variations
- **Dimensional Consistency** - verify all equations are dimensionally consistent

### Mathematical Implementation Guidelines
- **Numerical Precision** - use appropriate precision for mathematical computations
- **Algorithm Selection** - choose numerically stable algorithms (e.g., QR over normal equations)
- **Conditioning Checks** - monitor condition numbers for matrix operations
- **Error Propagation** - consider cumulative numerical errors in multi-step algorithms
- **Validation Against Literature** - cross-reference implementations with published algorithms

## Testing & Validation

### Pre-deployment Checks
- **Build validation**: `npm run build` must complete without errors
- **Type checking**: No TypeScript errors or warnings
- **Mathematical verification**: All equations and derivations mathematically sound
- **LaTeX rendering**: All mathematical notation renders correctly
- **Interactive demos**: Test all mathematical visualizations for numerical accuracy
- **Theoretical consistency**: Verify mathematical claims against established theory
- **Mobile responsiveness**: Verify on multiple screen sizes
- **Google Scholar integration**: Ensure publication data loads correctly
- **Citation accuracy**: Verify all academic citations and references

### Manual Testing
- All navigation links functional
- Interactive research demos working
- Contact form submissions (if applicable)
- Performance on mobile devices
- Cross-browser compatibility (Chrome, Firefox, Safari)

## API & Data Management

### Google Scholar Integration
- **Environment Variables**: `SCHOLAR_USER` for user ID
- **Cache System**: JSON files in `/data/` directory
- **Update Schedule**: Automated via scripts, manual trigger available
- **Rate Limiting**: Respect Google Scholar API limits

### Data Files
- **scholar-cache.json**: Cached publication data
- **selected.json**: Curated research highlights
- Do not modify cache files manually - use update scripts

## Security & Privacy

### Environment Variables
- **Never commit**: `.env` files or API keys
- **Vercel deployment**: Use Vercel dashboard for environment variables
- **Public variables**: Prefix with `NEXT_PUBLIC_` only for client-side access

### Content Security
- **No PII exposure**: Academic and professional information only
- **Research content**: Ensure proper attribution and copyright compliance
- **External links**: Verify all research paper links and citations

## Deployment

### Vercel Configuration
- **Automatic deployments** from main branch
- **Environment variables** configured in Vercel dashboard
- **Build settings**: Next.js default configuration
- **Domain**: Custom domain configured via Vercel

### Pre-deployment Checklist
1. All TypeScript errors resolved
2. Production build successful
3. Interactive demos tested
4. Mobile responsiveness verified
5. Google Scholar data updated
6. Environment variables configured

## Pull Request Guidelines

### PR Title Format
`[type]: brief description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`

Examples:
- `feat: add neural network visualization demo`
- `fix: mobile responsiveness for research grid`
- `docs: update research project descriptions`

### PR Requirements
- **No TypeScript errors** - build must pass
- **Test interactive demos** - ensure all visualizations work
- **Mobile testing** - verify responsive design
- **Academic accuracy** - review technical content for correctness
- **Performance check** - no significant performance regressions

### Review Focus Areas
1. **Mathematical rigor and correctness** - verify all equations, derivations, and theoretical claims
2. **Technical accuracy** of research content - check against authoritative sources
3. **LaTeX notation consistency** - ensure proper mathematical typesetting throughout
4. **Code quality** and TypeScript compliance
5. **Responsive design** implementation
6. **Interactive demo** functionality and numerical accuracy
7. **Academic presentation** standards and proper citation format
8. **Theoretical soundness** - verify mathematical assumptions and conditions
9. **Algorithmic correctness** - validate implementation against theoretical descriptions

## Automation Scripts

### Scholar Cache Update
- **Location**: `/scripts/update-scholar-cache.js`
- **Purpose**: Fetch latest publications from Google Scholar
- **Schedule**: Can be run manually or via automation
- **Dependencies**: Node.js, requires Scholar API access

### Maintenance
- **Log cleanup**: Automated log rotation for script logs
- **Cache validation**: Verify data integrity after updates
- **Performance monitoring**: Track build times and bundle sizes

## Troubleshooting

### Common Issues
- **Build failures**: Check TypeScript errors first
- **Demo not loading**: Verify JavaScript paths in `/public/` demos
- **Scholar data missing**: Run `npm run update-scholar`
- **Mobile display issues**: Check Tailwind responsive classes
- **Mathematical rendering issues**: Verify LaTeX syntax and MathJax/KaTeX configuration
- **Numerical instability**: Check algorithm conditioning and parameter ranges
- **Mathematical inconsistencies**: Cross-reference equations with theoretical foundations

### Mathematical Debugging
- **Equation verification**: Use computer algebra systems (Mathematica, Maple) for complex derivations
- **Numerical validation**: Compare against analytical solutions or established benchmarks
- **Dimensional analysis**: Verify physical units throughout all calculations
- **Limit behavior**: Check mathematical expressions in limiting cases
- **Parameter sensitivity**: Test robustness to parameter variations

### Debug Mode
- Use `npm run dev` for development with hot reload
- Check browser console for JavaScript errors
- Verify API routes in `/app/api/` for data issues

---

*This file is designed to help AI coding agents understand and operate within this academic research portfolio project with the mathematical rigor expected in control theory and robotics research. All mathematical content should meet publication-quality standards. For human-readable documentation, see README.md.*
