import '@testing-library/jest-dom/extend-expect'

import { render, fireEvent } from '@testing-library/svelte'

import { Index } from '../routes/index'

test('shows proper heading when rendered', () => {
  const { getByText } = render(Index)
  expect(getByText('Hello World!')).toBeInTheDocument()
})