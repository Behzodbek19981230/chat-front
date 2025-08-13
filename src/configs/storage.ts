import Cookies from 'js-cookie'

const deleteCookieCompletely = (name: string, path = '/', domain = '') => {
  document.cookie = `${name}=; Path=${path}; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict`
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 UTC`
}

if (typeof window !== 'undefined') {
  // deleteCookieCompletely('access_token', '/', '.ecdn.uz')
}

export function getTokenCSR(): string | undefined {
  return Cookies.get('token_chat') ?? undefined
}

const cleareStorage = () => {
  const allCookies = Cookies.get()

  Object.keys(allCookies).forEach(cookieName => {
    Cookies.remove(cookieName)
  })

  if (typeof window !== 'undefined') {
    Cookies.remove(process.env.SECRET_COOKIE_NAME as string)
    deleteCookieCompletely('token_chat', '/', 'universal-uz.uz')
    deleteCookieCompletely('token_chat', '/', 'universal-uz.uz')
    deleteCookieCompletely('token_chat', '/')
  }
}

export { cleareStorage }
