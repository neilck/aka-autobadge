export interface ConfigParam {
  name: string;
  value: string;
}

export const getConfigParamValue = (
  name: string,
  configParams: ConfigParam[]
) => {
  let value: string | undefined = undefined;
  for (let i = 0; i < configParams.length; i++) {
    const configParam = configParams[i];

    if (configParam.name === name && configParam.value) {
      return configParam.value;
    }
  }

  return value;
};
