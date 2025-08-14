// React Imports
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// MUI Import
import { useRouter } from 'next/navigation'

import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Switch from '@mui/material/Switch'
import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'

// Third Party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import AvatarWithBadge from './AvatarWithBadge'
import CustomTextField from '@core/components/mui/TextField'
import { cleareStorage } from '@configs/storage'
import type { ChatStoreType } from './index'
import { request } from '@/configs/request'

type Props = {
  userSidebar: boolean
  chatStore: ChatStoreType
  setUserSidebar: (open: boolean) => void
  isBelowLgScreen: boolean
  isBelowSmScreen: boolean
}

const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-x-hidden overflow-y-auto'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const UserProfileLeft = (props: Props) => {
  // Props
  const { userSidebar, setUserSidebar, isBelowLgScreen, isBelowSmScreen, chatStore } = props
  const { push } = useRouter()

  const [avatar, setAvatar] = useState<string>(
    `${process.env.NEXT_PUBLIC_API_URL_BASE}${chatStore?.profileUser?.avatar}`
  )

  // States
  const [notification, setNotification] = useState<boolean>(false)

  const handleNotification = () => {
    setNotification(!notification)
  }

  const handleLogout = () => {
    cleareStorage()
    push('/login')
  }

  const onPutUser = async (avatar: File) => {
    const formData = new FormData()

    formData.append('avatar', avatar)

    try {
      await request().put('/users/' + chatStore?.profileUser?.id, formData)
      setAvatar(URL.createObjectURL(avatar))
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const uploadImage = async () => {
    const fileInput = document.getElementById('upload-avatar') as HTMLInputElement

    if (fileInput && fileInput.files) {
      const file = fileInput.files[0]

      if (file) {
        await onPutUser(file)
      }
    }

    if (fileInput) {
      fileInput.click()
    }
  }

  useEffect(() => {
    if (chatStore?.profileUser?.avatar) {
      setAvatar(`${process.env.NEXT_PUBLIC_API_URL_BASE}${chatStore?.profileUser?.avatar}`)
    }
  }, [chatStore?.profileUser?.avatar])

  return (
    <>
      <Drawer
        open={userSidebar}
        anchor='left'
        variant='persistent'
        ModalProps={{ keepMounted: true }}
        onClose={() => setUserSidebar(false)}
        sx={{
          zIndex: 13,
          '& .MuiDrawer-paper': { width: isBelowSmScreen ? '100%' : '370px', position: 'absolute', border: 0 }
        }}
      >
        <IconButton className='absolute block-start-4 inline-end-4' onClick={() => setUserSidebar(false)}>
          <i className='tabler-x text-2xl' />
        </IconButton>
        <div className='flex flex-col justify-center items-center gap-4 mbs-6 pli-6 pbs-6 pbe-3'>
          <AvatarWithBadge
            alt={chatStore?.profileUser?.fullName}
            onClick={uploadImage}
            src={avatar}
            badgeColor='warning'
            className='bs-[84px] is-[84px]'
            badgeSize={12}
          />
          <input type='file' hidden id='upload-avatar' onChange={uploadImage} />
          <div className='text-center'>
            <Typography variant='h5'>{chatStore?.profileUser?.fullName}</Typography>
          </div>
        </div>
        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <div className='flex flex-col gap-6 p-6 pbs-3'>
            <div className='flex flex-col gap-1'>
              <Typography className='uppercase' color='text.disabled'>
                About
              </Typography>
              <CustomTextField
                fullWidth
                rows={3}
                multiline
                id='about-textarea'
                defaultValue={'profileUserData.about'}
              />
            </div>

            <div className='flex flex-col gap-1'>
              <Typography className='uppercase' color='text.disabled'>
                Settings
              </Typography>
              <List className='plb-0'>
                <ListItem
                  disablePadding
                  secondaryAction={<Switch checked={notification} onChange={handleNotification} />}
                >
                  <ListItemButton onClick={handleNotification} className='p-2'>
                    <ListItemIcon>
                      <i className='tabler-bell' />
                    </ListItemIcon>
                    <ListItemText primary='Notification' />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton className='p-2'>
                    <ListItemIcon>
                      <i className='tabler-trash' />
                    </ListItemIcon>
                    <ListItemText primary='Delete Account' />
                  </ListItemButton>
                </ListItem>
              </List>
            </div>
            <Button
              variant='contained'
              fullWidth
              className='mbs-auto'
              endIcon={<i className='tabler-logout' />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </ScrollWrapper>
      </Drawer>
      <Backdrop open={userSidebar} onClick={() => setUserSidebar(false)} className='absolute z-[12]' />
    </>
  )
}

export default UserProfileLeft
