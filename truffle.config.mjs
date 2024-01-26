export default {
  path: "@gamers-4074/wheel",
  name: "wheel",
  embeds: [
    {
      slug: "wheel-viewer",
      url: "https://wheel-spin.pages.dev/",
      contentPageType: "youtube",
      isLoginRequired: true,
      iconUrl: "https://wheel-spin.pages.dev/wheel.svg",
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
      },
    },
    {
      slug: "wheel-moderator",
      url: "https://wheel-spin.pages.dev/moderator/",
      iconUrl: "https://wheel-spin.pages.dev/wheel.svg",
      contentPageType: "quickActions",
      isLoginRequired: true,
    },
    {
      slug: "wheel-admin-streamer",
      url: "https://wheel-spin.pages.dev/admin/",
      iconUrl: "https://wheel-spin.pages.dev/wheel.svg",
      contentPageType: "appManagement",
      isLoginRequired: true,
    },
  ],
};
