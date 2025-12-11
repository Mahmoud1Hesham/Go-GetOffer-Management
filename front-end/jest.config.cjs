module.exports = {
  // Use the Node environment for these unit tests (no DOM required)
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: './babel.jest.config.cjs' }],
  },
  moduleNameMapper: {
    // Map '@/...' imports to the project's `src/` directory
    '^@\/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};
