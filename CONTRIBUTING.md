# Contributing to Image Scrambler

Thank you for your interest in contributing to Image Scrambler! This document provides guidelines and information for contributors.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/agbuddy7/image-scrambler/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/OS information

### Suggesting Enhancements

1. Check if the enhancement has been suggested
2. Create an issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach (optional)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run build: `npm run build`
6. Commit with clear messages: `git commit -m "Add amazing feature"`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/image-scrambler.git
cd image-scrambler

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Watch mode for development
npm run watch
```

## Project Structure

```
image-scrambler/
├── core/              # Core scrambling engine
│   ├── prng.js       # Seeded PRNG
│   ├── canvas-utils.js
│   ├── scrambler.js
│   ├── detector.js
│   └── unscrambler.js
├── extension/         # Browser extension
│   ├── popup/        # Extension popup
│   ├── content/      # Content scripts
│   ├── background/   # Service worker
│   └── options/      # Options page
├── web-app/          # Standalone web tool
└── tests/            # Unit tests
```

## Coding Standards

### JavaScript

- Use ES6+ features
- Use descriptive variable names
- Add JSDoc comments for functions
- Follow existing code style
- Keep functions small and focused

### Example:

```javascript
/**
 * Generate random integer between min and max
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random integer
 */
nextInt(min, max) {
  return Math.floor(this.next() * (max - min)) + min;
}
```

### CSS

- Use meaningful class names
- Follow BEM naming when appropriate
- Keep selectors specific but not overly nested
- Use CSS custom properties for theming

### HTML

- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Keep markup clean and readable

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Writing Tests

- Place tests in `tests/` directory
- Use descriptive test names
- Follow existing test patterns
- Test edge cases

Example:

```javascript
describe('SeededRandom', () => {
  test('should generate consistent random numbers with same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    
    expect(rng1.next()).toBe(rng2.next());
  });
});
```

## Commit Messages

Use clear, descriptive commit messages:

```
Good:
- "Add support for PNG images with transparency"
- "Fix detection issue with JPEG compression"
- "Improve scrambling performance for large images"

Bad:
- "Update"
- "Fix stuff"
- "WIP"
```

## Areas for Contribution

### Core Engine
- Performance optimizations
- Support for additional image formats
- Alternative scrambling algorithms
- Improved compression tolerance

### Browser Extension
- Firefox/Safari support
- Additional UI features
- Internationalization (i18n)
- Dark mode support

### Web App
- Mobile responsiveness improvements
- Batch processing
- Drag-and-drop enhancements
- Real-time preview

### Documentation
- Additional examples
- Video tutorials
- Translation to other languages
- API documentation

### Testing
- Additional unit tests
- Integration tests
- Browser compatibility testing
- Performance benchmarks

## Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainers privately
3. Include details about the vulnerability
4. Allow time for a fix before public disclosure

## Questions?

- Check existing [Issues](https://github.com/agbuddy7/image-scrambler/issues)
- Read the [README](README.md)
- Check the [Testing Guide](TESTING.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Image Scrambler! 🎉
