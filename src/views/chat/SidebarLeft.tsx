// React Imports
import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { AppDispatch } from '@/redux-store'

// Slice Imports
import { addNewChat } from '@/redux-store/slices/chat'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import UserProfileLeft from './UserProfileLeft'
import AvatarWithBadge from './AvatarWithBadge'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { formatDateToMonthShort } from './utils'
import { request } from '@configs/request'
import useSWR from 'swr'
import { ChatStoreType } from '@views/chat/index'
import moment from 'moment'
import toast from 'react-hot-toast'



type Props = {
  chatStore:any,
  getActiveUserData: (id: number,chatId:number) => void
  dispatch: AppDispatch
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
}

type RenderChatType = {
  chatStore: ChatStoreType
  getActiveUserData: (id: number,chatId:number) => void
  setSidebarOpen: (value: boolean) => void
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  isBelowMdScreen: boolean
}

// Render chat list
const renderChat = (props: RenderChatType) => {
  // Props
  const { chatStore, getActiveUserData, setSidebarOpen, backdropOpen, setBackdropOpen, isBelowMdScreen,isChatActive } = props

  const contact=chatStore?.contacts

    return contact?.map(itm=>(
      <li
        key={itm?.id}
        className={classnames('flex items-start gap-4 pli-3 plb-2 cursor-pointer rounded mbe-1', {
          'bg-primary shadow-primarySm': isChatActive,
          'text-[var(--mui-palette-primary-contrastText)]': isChatActive
        })}
        onClick={() => {
          getActiveUserData(itm.userId,itm.id)
          isBelowMdScreen && setSidebarOpen(false)
          isBelowMdScreen && backdropOpen && setBackdropOpen(false)
        }}
      >
        <AvatarWithBadge
          src={itm.avatar}
          isChatActive={isChatActive}
          alt={itm.title}
          badgeColor={itm.online ? 'success' : 'secondary'}
          color={'warning'}
        />
        <div className='min-is-0 flex-auto'>
          <Typography color='inherit'>{itm.title}</Typography>

            <Typography variant='body2' color={isChatActive ? 'inherit' : 'text.secondary'} className='truncate'>
              {itm.lastMessage}
            </Typography>
        </div>
        <div className='flex flex-col items-end justify-start'>
          <Typography
            variant='body2'
            color='inherit'
            className={classnames('truncate', {
              'text-textDisabled': !isChatActive
            })}
          >
            {moment(itm.lastMessageTime).format('hh:mm A')}
          </Typography>
          {itm.unreadCount > 0 ? <CustomChip round='true' label={itm.unreadCount} color='error' size='small' /> : null}
        </div>
      </li>
    ))

}

// Scroll wrapper for chat list
const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const SidebarLeft = (props: Props) => {
  // Props
  const {
    chatStore,
    getActiveUserData,
    backdropOpen,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    messageInputRef
  } = props

  // States
  const [userSidebar, setUserSidebar] = useState(false)
  const [searchValue, setSearchValue] = useState<string | null>()
  const[contacts,setContacts]=useState<any[]>([])
  const fetchContacts = async (phone) => {
    try {
      if (!phone) {
        setContacts([])
        return
      }
      const res = await request()('/users', {
        params:{
          phone: phone
        }
      })

      setContacts(res.data)
      return
    }
    catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

const findChatId = async (id: number) => {
    try {
      const response = await request()(`/messages/chat`, {
        params: {
          userId: id
        }
      })
      return response.data
    }
    catch (error) {
    console.log('Error finding chat ID:', error.response.data.error)
      toast.error(error.response.data.error)
      return null
    }
}
  const handleChange = async (event: any, newValue: string | null) => {
    setSearchValue(newValue)
    if (newValue) {
      const contact = contacts.find(contact => contact?.phone === newValue)
      const chatId=await findChatId(contact?.id)

      if (contact && chatId) {
        getActiveUserData(contact.id,chatId.id)
      } else {
        // If contact not found, create a new chat
        const newChat = {
          id: Date.now(), // Use a unique ID for the new chat
          userId: contact?.id,
          fullName: contact?.fullName,
          avatar: contact?.avatar,
          phone: newValue,

        }
        setContacts(
          prevContacts => [...prevContacts, newChat]
        )

      }
    }




    isBelowMdScreen && setSidebarOpen(false)
    setBackdropOpen(false)
    setSearchValue(null)
    messageInputRef.current?.focus()
  }

  return (
    <>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className='bs-full'
        variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: isBelowMdScreen && sidebarOpen ? 11 : 10,
          position: !isBelowMdScreen ? 'static' : 'absolute',
          ...(isBelowSmScreen && sidebarOpen && { width: '100%' }),
          '& .MuiDrawer-paper': {
            overflow: 'hidden',
            boxShadow: 'none',
            width: isBelowSmScreen ? '100%' : '370px',
            position: !isBelowMdScreen ? 'static' : 'absolute'
          }
        }}
      >
        <div className='flex items-center plb-[18px] pli-6 gap-4 border-be'>
          <AvatarWithBadge
            alt={'chatStore.profileUser.fullName'}
            src={'chatStore.profileUser.avatar'}
            badgeColor='success'
            onClick={() => {
              setUserSidebar(true)
            }}
          />
          <div className='flex is-full items-center flex-auto sm:gap-x-3'>
            <Autocomplete
              fullWidth
              size='small'
              id='select-contact'
              options={contacts.map(contact => contact?.phone) || []}
              value={searchValue || null}
              onChange={handleChange}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  variant='outlined'
                  placeholder='Search Contacts'
                  onChange={
                    (e) => {
                      const value = e.target.value
                      setSearchValue(value)
                      fetchContacts(value)
                    }
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-search' />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => {
                const contact = contacts.find(contact => contact?.phone === option)

                return (
                  <li
                    {...props}
                    key={option.toLowerCase().replace(/\s+/g, '-')}
                    className={classnames('gap-3 max-sm:pli-3', props.className)}
                  >
                    {contact ? (
                      contact?.avatar ? (
                        <Avatar
                          alt={contact?.fullName}
                          src={contact?.avatar}
                          key={option.toLowerCase().replace(/\s+/g, '-')}
                        />
                      ) : (
                        <CustomAvatar
                          color={contact?.avatarColor as ThemeColor}
                          skin='light'
                          key={option.toLowerCase().replace(/\s+/g, '-')}
                        >
                          {getInitials(contact?.fullName)}
                        </CustomAvatar>
                      )
                    ) : null}
                 <div className='flex flex-col '>
                    {contact?.fullName}
                    <Typography>{option}</Typography>
                    </div>
                  </li>
                )
              }}
            />
            {isBelowMdScreen ? (
              <IconButton
                className='mis-2'
                size='small'
                onClick={() => {
                  setSidebarOpen(false)
                  setBackdropOpen(false)
                }}
              >
                <i className='tabler-x text-2xl' />
              </IconButton>
            ) : null}
          </div>
        </div>
        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <ul className='p-3 pbs-4'>
            {renderChat({
              chatStore,
              getActiveUserData,
              backdropOpen,
              setSidebarOpen,
              isBelowMdScreen,
              setBackdropOpen
            })}
          </ul>
        </ScrollWrapper>
      </Drawer>

      <UserProfileLeft
        userSidebar={userSidebar}
        setUserSidebar={setUserSidebar}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
      />
    </>
  )
}

export default SidebarLeft
