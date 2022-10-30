import runExtension from "roamjs-components/util/runExtension";
import {RoomChatOverlay} from './chat-popup'

export default runExtension({
  run: (args) => {
    args.extensionAPI.settings.panel.create({
      tabTitle: "roam-matrix",
      settings: [],
    });

    const label = "Page Chat"

    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: label,
      callback: async () => RoomChatOverlay({pageId: await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid()}),
    })
    console.log("roam-matrix loaded")

    return () => {
      window.roamAlphaAPI.ui.commandPalette.removeCommand({label})
    }
  },
});
