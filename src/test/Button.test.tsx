import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('forwards aria-label to the native button', () => {
    render(<Button aria-label="Save settings">Save</Button>)
    expect(screen.getByRole('button', { name: 'Save settings' })).toBeDefined()
  })

  it('supports aria-pressed for toggle buttons', () => {
    render(
      <Button aria-label="Bookmark ayah" aria-pressed={true}>
        Bookmark
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Bookmark ayah' })
    expect(button.getAttribute('aria-pressed')).toBe('true')
  })
})
