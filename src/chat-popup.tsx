import {Classes, Dialog} from '@blueprintjs/core'
import {Login, Room, Credentials} from 'matrix-rx'
import React from 'react';
import {createOverlayRender} from 'roamjs-components/util'
import {useState} from 'react'


interface ChatPopupProps {
    pageId: string;
}

// todo popup should be prompted by the lack of credentials
const saveCredentials = (credentials: Credentials) => {
    localStorage.setItem('matrix-credentials-roam', JSON.stringify(credentials))
}

export const loadCredentials = (): Credentials | undefined => {
    const credentials = localStorage.getItem('matrix-credentials-roam')
    return credentials ? JSON.parse(credentials) : undefined
}

export const ChatPopup = ({onClose, pageId}: { onClose: () => void; } & ChatPopupProps) => {


    return (
        <Dialog
            isOpen={true}
            onClose={onClose}
            canEscapeKeyClose
            backdropClassName={'autocomplete-dialog-backdrop'}
            className={'autocomplete-dialog'}
        >
            <div className={Classes.DIALOG_BODY + ' autocomplete-dialog-body'}>

                <h3>Chat {pageId}</h3>
                <Login onLogin={saveCredentials}>
                    <Room roomId={'!AtyuVyqNFWfJMwlbwR:matrix.org'}/>
                </Login>
            </div>
        </Dialog>
    )
}

// @ts-ignore
export const RoomChatOverlay = createOverlayRender<ChatPopupProps>('autocomplete-prompt', ChatPopup)
