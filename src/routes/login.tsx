import LoginPage from '../components/LoginPage.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "PartsFlow CRM - Sign in" }
    ]
  })
})
