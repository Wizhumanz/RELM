import '@testing-library/jest-dom/extend-expect'

import { render } from '@testing-library/svelte'

//TODO: ParseError when Sass styles in component
import Index from '../routes/index.svelte'

test('shows proper heading when rendered', () => {
  const { getByText } = render(Index)
  expect(getByText('Hello World!')).toBeInTheDocument()
})