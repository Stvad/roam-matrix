import runExtension from "roamjs-components/util/runExtension";
import {RoomChatOverlay} from './chat-popup'

export default runExtension({
  run: (args) => {
    args.extensionAPI.settings.panel.create({
      tabTitle: "roam-matrix",
      settings: [],
    });

    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Page chat",
      callback: async () => RoomChatOverlay({pageId: await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid()}),
    })
    console.log("roam-matrix loaded")
  },
});
