import runExtension from 'roamjs-components/util/runExtension'
import {RoomChatOverlay} from './chat-popup'
import {sendAutocompleteConfiguration} from './autocomplete-configuration'
import {startEventWatcher} from './watch'

export default runExtension({
    run: async (args) => {
        const watchRoomId = 'matrix-watch-room-id'
        args.extensionAPI.settings.panel.create({
            tabTitle: 'roam-matrix',
            settings: [
                {
                    id: watchRoomId,
                    description: 'Room ID to watch',
                    name: 'Room ID',
                    action: {
                        type: 'input',
                        placeholder: '!room:matrix.org',
                    },

                },
            ],
        })

        const label = 'Page Chat'

        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: label,
            callback: async () => RoomChatOverlay({pageId: await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid()}),
        })

        // todo localstorage based on the graph name
        // todo what to do if there are several clients running?
        // @ts-ignore
        const roomIdToConfigure = window.matrixRxConfig.roomIdToWatch
        if (!roomIdToConfigure) {
            console.error('No roomIdToConfigure provided')
            return
        }

        await sendAutocompleteConfiguration(roomIdToConfigure)

        const stopWatching = await startEventWatcher(roomIdToConfigure)

        return () => {
            window.roamAlphaAPI.ui.commandPalette.removeCommand({label})
            stopWatching()
        }
    },
})
