export default {
  path: "@epic-gamer-wheel-org/wheel",
  name: "wheel",
  embeds: [
    {
      slug: "wheel-viewer",
      url: "https://wheel-spin.pages.dev/",
      contentPageType: "youtubeLive",
      windowProps: {
        title: "Spin the Wheel",
        tooltipDescription: "Submit wheel entries",
        initialDimensions: {
          width: 600,
          height: 500,
        },
        isResizable: true,
        resizeBounds: {
          minWidth: 500,
          minHeight: 500,
        },
        //TODO: iconUrl
      },
    },
    {
      slug: "wheel-moderator",
      url: "https://wheel-spin.pages.dev/moderator/",
      contentPageType: "youtubeLive",
    },
    {
      slug: "wheel-admin-streamer",
      url: "https://wheel-spin.pages.dev/admin/",
      contentPageType: "youtubeLive",
    },
  ],
};
