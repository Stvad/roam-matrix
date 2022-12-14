import {Classes, Dialog} from '@blueprintjs/core'
import {Login, Room} from 'matrix-rx'
import React from 'react'
import {createOverlayRender} from 'roamjs-components/util'
import {saveCredentials} from './client'

interface ChatPopupProps {
    pageId: string | null | undefined;
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
                    <Room roomId={'!JKTtZkzPOSaVfMRZYN:matrix.org'}/>
                </Login>
            </div>
        </Dialog>
    )
}

// @ts-ignore
export const RoomChatOverlay = createOverlayRender<ChatPopupProps>('autocomplete-prompt', ChatPopup)
