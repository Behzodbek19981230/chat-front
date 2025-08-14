// hooks/useAuthRedirect.ts
'use client'

import { useEffect } from 'react'

import { useRouter, usePathname } from 'next/navigation'

import Cookies from 'js-cookie'

export default function useAuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const token = Cookies.get('token_chat')

  const isAuthPage = pathname.startsWith('/login')

  useEffect(() => {
    if (!token && !isAuthPage) {
      router.replace('/login')
    } else if (token && isAuthPage) {
      router.replace('/')
    }
  }, [token, isAuthPage, pathname, router])
}
