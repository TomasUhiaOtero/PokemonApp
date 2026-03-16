import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import App from '../../App.jsx'

describe('App', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })

  it('shows loading state', () => {
    render(<App />)
    const loadingText = screen.getByText('Catching Pokemon...')
    expect(loadingText).toBeDefined()
  })
})
