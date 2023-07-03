type ConfigModelData = {
  key: string,
  value?: any,
  protected: boolean,
} | TestModeConfig;

interface TestModeConfig {
  key: "test_mode",
  value?: boolean,
  protected: false,
}