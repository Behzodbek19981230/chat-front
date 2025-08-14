// MUI Imports
import Button from '@mui/material/Button'

// Type Imports
import { Toaster } from 'react-hot-toast'

import type { ChildrenType } from '@core/types'

import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'

import ScrollToTop from '@core/components/scroll-to-top'

// Util Imports

const Layout = async ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <Toaster />

      <HorizontalLayout header={<></>} footer={<></>}>
        {children}
      </HorizontalLayout>

      <ScrollToTop className='mui-fixed'>
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='tabler-arrow-up' />
        </Button>
      </ScrollToTop>
    </Providers>
  )
}

export default Layout
