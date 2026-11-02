import HomePage from '../components/HomePage.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/homepage')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "PartsFlow CRM — Dashboard" }
    ]
  })
})