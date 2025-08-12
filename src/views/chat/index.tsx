'use client'

import { useEffect, useRef, useState } from 'react'
import Backdrop from '@mui/material/Backdrop'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'
import classNames from 'classnames'
import { useSettings } from '@core/hooks/useSettings'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'
import { request } from '@configs/request'
import { io, Socket } from 'socket.io-client'

import SidebarLeft from './SidebarLeft'
import ChatContent from './ChatContent'

export type ChatType = {
  chatId: number
  content: string
  createdAt: string
  id: number
  readBy: number[]
  senderId: number
}

export type ContactUserType = {
  avatar: string
  id: number
  isGroup: boolean
  lastMessage: string
  lastMessageTime: string
  title: string
  unreadCount: number
  userId: number
  online: boolean
}

export type ChatStoreType = {
  profileUser: {
    id: number | null
    fullName: string
    avatar: string
  } | null
  activeUser: {
    id: number | null
    fullName: string
    avatar: string
    avatarColor: string
    role: string
    online: boolean
  } | null
  chats: ChatType[]
  contacts: ContactUserType[]
}

const ChatWrapper = () => {
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatStore, setChatStore] = useState<ChatStoreType>({
    profileUser: null,
    activeUser: null,
    chats: [],
    contacts: []
  })
  const[activeChatId, setActiveChatId] = useState<number | null>(null)

  const messageInputRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  const { settings } = useSettings()
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  // socket ulanishi faqat bir marta
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL_BASE!)
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  // Foydalanuvchini online qilish va listener qo‘shish
  useEffect(() => {
    if (!chatStore.profileUser) return
    if (!socketRef.current) return

    socketRef.current.emit('user-online', chatStore.profileUser.id)

    const handleOnlineUsers = (users: number[]) => {
      setChatStore(prev => ({
        ...prev,
        contacts: Array.isArray(prev.contacts)
          ? prev.contacts.map(contact => ({
            ...contact,
            online: users.includes(contact.userId)
          }))
          : []
      }))
    }

    socketRef.current.on('online-users', handleOnlineUsers)

    return () => {
      socketRef.current?.off('online-users', handleOnlineUsers)
    }
  }, [chatStore.profileUser])

  useEffect(() => {
    if (!socketRef.current) return
    if (activeChatId && socketRef.current.connected) {
      socketRef.current.emit("join-chat", activeChatId);
    }

    return () => {
      // Chatdan chiqishda
      // @ts-ignore
      socketRef.current?.emit("leave-chat", activeChatId);
    };
  }, [activeChatId]);


  useEffect(() => {
    if (!socketRef.current) return

    socketRef.current.on("receive-message", (message) => {
      // @ts-ignore
      setChatStore(prev => {
        const updatedChats = [...prev.chats,{
          chatId: message.chatId,
          content: message.content,
          createdAt: new Date().toISOString(),
          id: message.id,
          readBy: [],
          senderId: message.senderId
        }];

        // Agar activeUserga tegishli bo'lsa, uni yangilash
        if (prev.activeUser?.id === message.senderId) {
          return {
            ...prev,
            chats: updatedChats,
            activeUser: {
              ...prev.activeUser,
              online: true // Online holatini yangilash
            }
          }
        }

        return {
          ...prev,
          chats: updatedChats
        }
      })



    });

    return () => socketRef.current?.off("receive-message");
  }, []);


  const fetchProfileUserData = async () => {
    const response = await request()('/auth/me')
    setChatStore(prev => ({
      ...prev,
      profileUser: {
        id: response.data.id,
        fullName: response.data.fullName,
        avatar: response.data.avatar
      }
    }))
  }

  const fetchChatData = async () => {
    const data = await request()('/messages/chats')
    setChatStore(prev => ({
      ...prev,
      contacts: data.data
    }))
  }

  const fetchActiveUserData = async (id: number) => {
    const response = await request()(`/messages/${id}/messages`)
    return response.data
  }

  const findUserId = async (id: number) => {
    const response = await request()(`/users/${id}`)
    return response.data
  }

  const sendMsgChats = async (chatId: number, msg: string) => {
    if (chatId) {
      // @ts-ignore
      socketRef.current?.emit("send-message", {
        chatId,
        senderId: chatStore.profileUser?.id,
        content: msg
      });
      await request().post(`/messages/send`, {
        content: msg,
        chatId
      })
      const activeUserData = await fetchActiveUserData(chatId)
      setChatStore(prev => ({
        ...prev,
        chats: activeUserData
      }))
    }
  }

  const sendMsg = async ({ chatId, msg }: { chatId: number; msg: string }) => {
    if (!chatId) {
      const newChat = await request().post(`/messages/start`, {
        userId: chatStore.activeUser?.id
      })
      await sendMsgChats(newChat.data.id, msg)
    } else {
      await sendMsgChats(chatId, msg)
    }
  }

  const activeUser = async (id: number, chatId: number) => {
    fetchChatData()
    setActiveChatId(chatId)
    const userData = await findUserId(id)
    const activeUserData = await fetchActiveUserData(chatId)
    setChatStore(prev => ({
      ...prev,
      activeUser: {
        id: userData.id,
        fullName: userData.fullName,
        avatar: userData.avatar,
        avatarColor: userData.avatarColor,
        role: userData.role,
        online:false,
        lastSeen: userData.lastSeen || null
      },
      chats: activeUserData
    }))
  }

  // dastlabki ma’lumotlarni olish
  useEffect(() => {
    if (!chatStore.contacts.length) {
      fetchChatData()
    }
    if (!chatStore.profileUser) {
      fetchProfileUserData()
    }

    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [chatStore.activeUser])

  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false)
    }
  }, [isBelowMdScreen])

  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true)
    }
  }, [isBelowSmScreen])

  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false)
    }
  }, [backdropOpen])

  return (
    <div
      className={classNames(commonLayoutClasses.contentHeightFixed, 'flex is-full overflow-hidden rounded relative', {
        border: settings.skin === 'bordered',
        'shadow-md': settings.skin !== 'bordered'
      })}
    >
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={activeUser}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
      />

      <ChatContent
        chatStore={chatStore}
        sendMsg={sendMsg}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  )
}

export default ChatWrapper
