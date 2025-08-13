'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

const Logo = () => {
  // Refs
  const logoTextRef = useRef<HTMLSpanElement>(null)

  // Hooks
  const { isHovered } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout])

  return (
    <div className='flex items-center'>
      {/*<VuexyLogo className='text-2xl text-primary' />*/}
      {/*<LogoText*/}
      {/*  color={color}*/}
      {/*  ref={logoTextRef}*/}
      {/*  isHovered={isHovered}*/}
      {/*  isCollapsed={layout === 'collapsed'}*/}
      {/*  transitionDuration={transitionDuration}*/}
      {/*>*/}
      {/*  {themeConfig.templateName}*/}
      {/*</LogoText>*/}
    </div>
  )
}

export default Logo
