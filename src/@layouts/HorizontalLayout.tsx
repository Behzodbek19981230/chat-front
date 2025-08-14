// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ChildrenType } from '@core/types'

// Context Imports

// Component Imports

// Util Imports
import { horizontalLayoutClasses } from './utils/layoutClasses'

// Styled Component Imports

type HorizontalLayoutProps = ChildrenType & {
  header?: ReactNode
  footer?: ReactNode
}

const HorizontalLayout = (props: HorizontalLayoutProps) => {
  // Props
  const { children } = props

  return (
    <div className={classnames(horizontalLayoutClasses.root, 'flex flex-auto')}>
      {/* <HorizontalNavProvider>
        <StyledContentWrapper className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col is-full')}>
          {header || null} */}
      {/* <LayoutContent> */}
      {children}
      {/* </LayoutContent> */}
      {/* {footer || null}
        </StyledContentWrapper>
      </HorizontalNavProvider> */}
    </div>
  )
}

export default HorizontalLayout
