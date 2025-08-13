'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import classnames from 'classnames'

import toast from 'react-hot-toast'

import Link from '@components/Link'
import CustomTextField from '@core/components/mui/TextField'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { request } from '@configs/request'
import type { Mode } from '@/@core/types'

const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12)
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const Register = ({ mode }: { mode: Mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')

  const [password, setPassword] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [fullNameError, setFullNameError] = useState('')

  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const validatePhone = (value: string) => {
    // faqat +998 format
    const uzbPhoneRegex = /^\+998\d{9}$/

    if (!value) return 'Telefon raqam majburiy'
    if (!uzbPhoneRegex.test(value)) return 'Telefon raqam formati: +998XXXXXXXXX'

    return ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const phoneErr = validatePhone(phone)
    const passwordErr = !password ? 'Parol majburiy' : ''
    const fullNameErr = !fullName ? 'To‘liq ism majburiy' : ''

    setPhoneError(phoneErr)
    setPasswordError(passwordErr)
    setFullNameError(fullNameErr)

    if (!phoneErr && !passwordErr && !fullNameErr) {
      try {
        const { data } = await request().post('/auth/register', {
          phone,
          password,
          fullName
        })

        console.log(data)
        toast.success('Ro‘yxatdan o‘tish muvaffaqiyatli amalga oshirildi')
        router.push('/login')
      } catch (error: any) {
        setPhoneError(error.response?.data?.message)
        toast.error(error.response?.data?.message)
      }
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px]'>
          <div className='flex flex-col gap-1'>
            Ro‘yxatdan o‘tish
            <Typography>Iltimos ro‘yxatdan o‘ting </Typography>
          </div>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Telefon raqam'
              placeholder='+998901234567'
              value={phone}
              onChange={e => setPhone(e.target.value)}
              error={!!phoneError}
              helperText={phoneError}
            />
            <CustomTextField
              fullWidth
              label='To‘liq ism'
              placeholder='Ismingizni kiriting'
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              error={!!fullNameError}
              helperText={fullNameError}
            />

            <CustomTextField
              fullWidth
              label='Parol'
              placeholder='••••••••'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                      <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button fullWidth variant='contained' type='submit'>
              Ro‘yxatdan o‘tish
            </Button>

            <div className='flex justify-center items-center gap-2'>
              <Typography>Avval ro‘yxatdan o‘tganmisiz? </Typography>
              <Typography component={Link} color='primary' href='/login'>
                Login
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
