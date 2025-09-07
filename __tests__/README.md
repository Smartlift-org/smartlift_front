# SmartLift Frontend Unit Tests

This directory contains the complete unit testing suite for the SmartLift React Native frontend application.

## Overview

The testing implementation provides comprehensive coverage for all critical services, ensuring code reliability and facilitating future development and maintenance.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Testing utilities for React Native components
- **Jest Extended**: Additional Jest matchers
- **TypeScript**: Full TypeScript support for tests

## Test Structure

```
__tests__/
├── README.md                 # This documentation
├── setup.js                  # Global test setup and mocks
└── services/                 # Service layer tests
    ├── authService.test.ts
    ├── routineService.test.ts
    ├── workoutService.test.ts
    ├── challengeService.test.ts
    ├── chatService.test.ts
    ├── userStatsService.test.ts
    ├── adminService.test.ts
    └── exerciseService.test.ts

__mocks__/
├── apiResponses.js           # Mock API response data
├── @react-native-async-storage/
│   └── async-storage.js      # AsyncStorage mock
└── @react-navigation/
    └── native.js             # React Navigation mocks
```

## Coverage Areas

### Phase 1: Critical Services ✅
- **authService**: Authentication, registration, password management
- **routineService**: CRUD operations, exercise management, search
- **workoutService**: Workout lifecycle, sets management, statistics

### Phase 2: Secondary Services ✅
- **challengeService**: Challenge management, progress tracking
- **chatService**: Messaging, conversations, search functionality
- **userStatsService**: User statistics, BMI, progress calculations
- **adminService**: Admin management, user/coach operations
- **exerciseService**: Exercise CRUD, filtering, muscle groups

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests silently (CI mode)
npm run test:ci

# Update snapshots
npm run test:update-snapshots

# Run specific test file
npm test authService

# Run tests matching pattern
npm test routine
```

### Coverage Thresholds

The project maintains high coverage standards:
- **Statements**: 80% minimum
- **Branches**: 75% minimum  
- **Functions**: 80% minimum
- **Lines**: 80% minimum

## Test Features

### Global Mocks
- **AsyncStorage**: Complete storage mock with get/set/remove operations
- **React Navigation**: Navigation hooks and components
- **WebSocket & Action Cable**: Real-time communication mocks
- **Expo Modules**: Platform-specific functionality mocks

### API Response Mocks
Comprehensive mock data for:
- Authentication responses
- User profiles and statistics
- Routines, workouts, and exercises
- Challenges and leaderboards
- Chat conversations and messages
- Admin management data
- Error scenarios and edge cases

### Test Patterns

#### Service Testing Structure
```typescript
describe('ServiceName', () => {
  beforeEach(() => {
    // Setup mocks and clear previous calls
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      // Test implementation
    });

    it('should handle error case', async () => {
      // Error scenario testing
    });
  });
});
```

#### Mock Usage
```typescript
// API mocking
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: () => Promise.resolve(mockApiResponses.auth.loginSuccess)
});

// AsyncStorage mocking
const mockAsyncStorage = require('@react-native-async-storage/async-storage');
mockAsyncStorage.getItem.mockResolvedValue('mock-token');
```

## Configuration

### Jest Configuration (`jest.config.js`)
- React Native preset
- TypeScript transformation
- Module name mapping
- Coverage settings
- Timeout configuration

### Setup File (`setup.js`)
- Global mocks initialization
- Console warning suppression
- Testing library extensions
- Platform-specific mocks

## Best Practices

### Writing Tests
1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Follow the AAA pattern
3. **Mock Isolation**: Reset mocks between tests
4. **Error Testing**: Always test error scenarios
5. **Async Handling**: Properly handle async operations

### Mock Strategy
1. **Global Mocks**: For platform dependencies (AsyncStorage, Navigation)
2. **API Mocks**: For external service calls
3. **Module Mocks**: For specific functionality isolation
4. **Data Mocks**: For consistent test data

### Coverage Guidelines
1. **Critical Paths**: Ensure 100% coverage for authentication and data operations
2. **Error Handling**: Test all error scenarios and edge cases
3. **Integration Points**: Focus on service interactions
4. **Business Logic**: Cover all business rules and validations

## Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Ensure Jest types are installed
npm install --save-dev @types/jest

# Check tsconfig.json includes Jest types
"types": ["jest", "@testing-library/jest-native"]
```

#### Mock Issues
```bash
# Clear Jest cache
npm test -- --clearCache

# Reset modules
npm test -- --resetModules
```

#### Coverage Problems
```bash
# Generate detailed coverage report
npm run test:coverage -- --verbose

# Check uncovered lines
open coverage/lcov-report/index.html
```

## Continuous Integration

The tests are configured for CI environments:
- Silent mode execution
- Coverage reporting
- Exit on failure
- No watch mode

Example CI configuration:
```yaml
- name: Run tests
  run: npm run test:ci
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Future Enhancements

### Planned Additions
1. **Component Tests**: UI component testing with React Native Testing Library
2. **Hook Tests**: Custom hook testing with `@testing-library/react-hooks`
3. **Integration Tests**: Cross-service integration testing
4. **E2E Tests**: End-to-end testing with Detox

### Performance Testing
- Bundle size impact analysis
- Memory usage monitoring
- Async operation performance

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Maintain coverage thresholds
3. Add appropriate mocks for new dependencies
4. Update this documentation for significant changes
5. Ensure all tests pass before submitting PR

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
