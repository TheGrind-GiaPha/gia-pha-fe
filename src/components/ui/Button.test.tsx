import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children and disables when loading', () => {
    render(<Button isLoading>Đang lưu</Button>)

    const button = screen.getByRole('button', { name: /đang lưu/i })
    expect(button).toBeDisabled()
  })
})
