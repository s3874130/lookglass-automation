// jest.config.js
module.exports = {
  preset: 'ts-jest', // use ts-jest preset for TypeScript support
  testEnvironment: 'jsdom', // simulate browser environment for React tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // setup file path
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // transform ts/tsx files with ts-jest
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // file extensions Jest will look for
  testPathIgnorePatterns: ['/node_modules/', '/dist/'], // ignore these folders
  transformIgnorePatterns: [
    "/node_modules/(?!(your-esm-dependency)/)" // default ignore node_modules except if you want to transform some ESM deps
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // path to your tsconfig
      isolatedModules: true,
    },
  },
};
