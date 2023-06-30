type ConfigModelData = {
  key: string,
  value?: any
} | TestModeConfig;

interface TestModeConfig {
  key: "test_mode",
  value?: boolean,
}