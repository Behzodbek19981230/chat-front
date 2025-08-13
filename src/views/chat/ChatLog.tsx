// React Imports
import { useRef, useEffect } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import type { ChatStoreType } from '@views/chat/index'

type ChatLogProps = {
  chatStore: ChatStoreType
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}

// Wrapper for the chat log to handle scrolling
const ScrollWrapper = ({
  children,
  isBelowLgScreen,
  scrollRef,
  className
}: {
  children: ReactNode
  isBelowLgScreen: boolean
  scrollRef: MutableRefObject<null>
  className?: string
}) => {
  if (isBelowLgScreen) {
    return (
      <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
        {children}
      </div>
    )
  } else {
    return (
      <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }: ChatLogProps) => {
  // Props
  console.log(chatStore)
  const { profileUser, contacts, chats, activeUser } = chatStore

  console.log(contacts)

  // Refs
  const scrollRef = useRef(null)

  // Function to scroll to bottom when new message is sent
  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        // @ts-ignore
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        // @ts-ignore
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (activeUser && chats && chats.length) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStore])

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef}>
      <CardContent className='p-0'>
        {activeUser &&
          chats.map((msgGroup, index) => {
            const isSender = msgGroup.senderId === profileUser?.id
            const isSeen = msgGroup.readBy.some(user => user !== activeUser?.id)
            const isDelivered = !isSeen && msgGroup.readBy.length > 0

            return (
              <div key={index} className={classnames('flex gap-4 p-6', { 'flex-row-reverse': isSender })}>
                {!isSender ? (
                  contacts.find(contact => contact.id === activeUser?.id)?.avatar ? (
                    <Avatar
                      alt={contacts.find(contact => contact.id === activeUser?.id)?.title}
                      src={contacts.find(contact => contact.id === activeUser?.id)?.avatar}
                      className='is-8 bs-8'
                    />
                  ) : (
                    <CustomAvatar color={'warning'} skin='light' size={32}>
                      {getInitials(contacts.find(contact => contact.userId === activeUser?.id)?.title as string)}
                    </CustomAvatar>
                  )
                ) : profileUser?.avatar ? (
                  <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
                ) : (
                  <CustomAvatar alt={profileUser?.fullName} src={profileUser?.avatar} size={32} />
                )}
                <div
                  className={classnames('flex flex-col gap-2', {
                    'items-end': isSender,
                    'max-is-[65%]': !isBelowMdScreen,
                    'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
                    'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
                  })}
                >
                  <Typography
                    className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
                      'bg-backgroundPaper rounded-e rounded-b': !isSender,
                      'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b': isSender
                    })}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msgGroup.content}
                  </Typography>

                  <div className='flex items-center gap-2'>
                    {isSeen ? (
                      <i className='tabler-checks text-success text-base' />
                    ) : (
                      isDelivered && <i className='tabler-check text-base' />
                    )}
                    {msgGroup.createdAt ? (
                      <Typography variant='caption'>
                        {new Date(msgGroup.createdAt).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </Typography>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
      </CardContent>
    </ScrollWrapper>
  )
}

export default ChatLog
