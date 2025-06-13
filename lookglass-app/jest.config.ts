import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/app'],
  testMatch: [
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      jsx: 'react-jsx',
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'], // Must include 'js'
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

export default config;
