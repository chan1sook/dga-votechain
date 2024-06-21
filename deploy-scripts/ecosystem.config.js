module.exports = {
  apps: [
    {
      name: "DGAFrontend",
      port: "3058",
      exec_mode: "cluster",
      instances: "1",
      script: "/usr/dga-evote/server/index.mjs",
      max_memory_restart: "300M",
      time: true,
    },
  ],
};
