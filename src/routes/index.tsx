import LoginPage from '../components/LoginPage.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: LoginPage
})