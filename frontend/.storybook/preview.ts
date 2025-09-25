import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import '../src/app/globals.css'
import { MockAuthProvider } from './MockAuthProvider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0f0f0f',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <MockAuthProvider>
        <Toaster position="top-right" />
        <Story />
      </MockAuthProvider>
    ),
  ],
};

export default preview;