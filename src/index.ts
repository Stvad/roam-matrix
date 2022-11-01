import runExtension from "roamjs-components/util/runExtension";
import {RoomChatOverlay} from './chat-popup'
import {sendAutocompleteConfiguration} from './autocomplete-configuration'

export default runExtension({
  run: async (args) => {
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

    await sendAutocompleteConfiguration()

    return () => {
      window.roamAlphaAPI.ui.commandPalette.removeCommand({label})
    }
  },
});
