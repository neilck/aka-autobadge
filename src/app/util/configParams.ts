/**
 * @file util/configParms.ts
 * @summary Configuration parameters helper functions.
 */

export interface ConfigParam {
  name: string;
  value: string;
}

/**
 * Retrieves the value of a configuration parameter by name from the provided array of configuration parameters.
 *
 * @param {string} name - The name of the configuration parameter to retrieve.
 * @param {ConfigParam[]} configParams - An array of configuration parameters.
 * @returns {string | undefined} The value of the configuration parameter if found, otherwise undefined.
 */
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
