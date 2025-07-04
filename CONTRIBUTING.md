# Contributing to Personal Fitness Tracker

Thank you for your interest in contributing to this project! This is a code sample created for the MLH Fellowship application.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-fitness-tracker.git
   cd personal-fitness-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Code Style

- Use 4 spaces for indentation
- Follow ESLint configuration
- Add comments for complex logic
- Use meaningful variable names
- Follow RESTful API conventions

## Testing

Run the test suite before submitting changes:
```bash
npm test
```

## Database

The project uses SQLite for simplicity. The database is automatically created when you first run the application.

## API Documentation

All API endpoints are documented in the `TECHNICAL_DOCS.md` file.

## Submitting Changes

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Run the test suite
5. Submit a pull request

## Questions?

This project was created as a code sample for the MLH Fellowship application. For questions about the MLH Fellowship program, please visit [mlh.io](https://mlh.io).

---

**Note**: This is primarily a demonstration project for the MLH Fellowship application and may not be actively maintained for contributions.
