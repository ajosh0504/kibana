/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import {
  ConfigKey,
  DataStream,
  ScheduleUnit,
  MonitorFields,
  Validator,
  Validation,
} from '../types';

export const DIGITS_ONLY = /^[0-9]*$/g;
export const INCLUDES_VALID_PORT = /[^\:]+:[0-9]{1,5}$/g;
export const WHOLE_NUMBERS_ONLY = /^[0-9]+(.?[0]+)?$/;
export const FLOATS_ONLY = /^[0-9]+(.?[0-9]+)?$/;

type ValidationLibrary = Record<string, Validator>;

// returns true if invalid
export function validateHeaders<T>(headers: T): boolean {
  return Object.keys(headers).some((key) => {
    if (key) {
      const whiteSpaceRegEx = /[\s]/g;
      return whiteSpaceRegEx.test(key);
    } else {
      return false;
    }
  });
}

// returns true if invalid
export const validateTimeout = ({
  scheduleNumber,
  scheduleUnit,
  timeout,
}: {
  scheduleNumber: string;
  scheduleUnit: ScheduleUnit;
  timeout: string;
}): boolean => {
  let schedule: number;
  switch (scheduleUnit) {
    case ScheduleUnit.SECONDS:
      schedule = parseFloat(scheduleNumber);
      break;
    case ScheduleUnit.MINUTES:
      schedule = parseFloat(scheduleNumber) * 60;
      break;
    default:
      schedule = parseFloat(scheduleNumber);
  }

  return parseFloat(timeout) > schedule;
};

export const validJSONFormat = (value: string) => {
  let obj;

  try {
    obj = JSON.parse(value);
    if (!obj || typeof obj !== 'object') {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
};

// validation functions return true when invalid
const validateCommon: ValidationLibrary = {
  [ConfigKey.SCHEDULE]: ({ [ConfigKey.SCHEDULE]: value }) => {
    const { number, unit } = value as MonitorFields[ConfigKey.SCHEDULE];
    const parsedFloat = parseFloat(number);
    return !parsedFloat || !unit || parsedFloat < 1;
  },
  [ConfigKey.TIMEOUT]: ({
    [ConfigKey.MONITOR_TYPE]: monitorType,
    [ConfigKey.TIMEOUT]: timeout,
    [ConfigKey.SCHEDULE]: schedule,
  }) => {
    const { number, unit } = schedule as MonitorFields[ConfigKey.SCHEDULE];

    // Timeout is not currently supported by browser monitors
    if (monitorType === DataStream.BROWSER) {
      return false;
    }

    return (
      !timeout ||
      parseFloat(timeout) < 0 ||
      validateTimeout({
        timeout,
        scheduleNumber: number,
        scheduleUnit: unit,
      })
    );
  },
};

const validateHTTP: ValidationLibrary = {
  [ConfigKey.RESPONSE_STATUS_CHECK]: ({ [ConfigKey.RESPONSE_STATUS_CHECK]: value }) => {
    const statusCodes = value as MonitorFields[ConfigKey.RESPONSE_STATUS_CHECK];
    return statusCodes.length ? statusCodes.some((code) => !`${code}`.match(DIGITS_ONLY)) : false;
  },
  [ConfigKey.RESPONSE_HEADERS_CHECK]: ({ [ConfigKey.RESPONSE_HEADERS_CHECK]: value }) => {
    const headers = value as MonitorFields[ConfigKey.RESPONSE_HEADERS_CHECK];
    return validateHeaders<MonitorFields[ConfigKey.RESPONSE_HEADERS_CHECK]>(headers);
  },
  [ConfigKey.REQUEST_HEADERS_CHECK]: ({ [ConfigKey.REQUEST_HEADERS_CHECK]: value }) => {
    const headers = value as MonitorFields[ConfigKey.REQUEST_HEADERS_CHECK];
    return validateHeaders<MonitorFields[ConfigKey.REQUEST_HEADERS_CHECK]>(headers);
  },
  [ConfigKey.MAX_REDIRECTS]: ({ [ConfigKey.MAX_REDIRECTS]: value }) =>
    (!!value && !`${value}`.match(DIGITS_ONLY)) ||
    parseFloat(value as MonitorFields[ConfigKey.MAX_REDIRECTS]) < 0,
  [ConfigKey.URLS]: ({ [ConfigKey.URLS]: value }) => !value,
  ...validateCommon,
};

const validateTCP: Record<string, Validator> = {
  [ConfigKey.HOSTS]: ({ [ConfigKey.HOSTS]: value }) => {
    return !value || !`${value}`.match(INCLUDES_VALID_PORT);
  },
  ...validateCommon,
};

const validateICMP: ValidationLibrary = {
  [ConfigKey.HOSTS]: ({ [ConfigKey.HOSTS]: value }) => !value,
  [ConfigKey.WAIT]: ({ [ConfigKey.WAIT]: value }) =>
    !!value &&
    !DIGITS_ONLY.test(`${value}`) &&
    parseFloat(value as MonitorFields[ConfigKey.WAIT]) < 0,
  ...validateCommon,
};

const validateThrottleValue = (speed: string | undefined, allowZero?: boolean) => {
  if (speed === undefined || speed === '') return false;
  const throttleValue = parseFloat(speed);
  return isNaN(throttleValue) || (allowZero ? throttleValue < 0 : throttleValue <= 0);
};

const validateBrowser: ValidationLibrary = {
  ...validateCommon,
  [ConfigKey.SOURCE_INLINE]: ({ [ConfigKey.SOURCE_INLINE]: inlineScript }) => !inlineScript,
  [ConfigKey.DOWNLOAD_SPEED]: ({ [ConfigKey.DOWNLOAD_SPEED]: downloadSpeed }) =>
    validateThrottleValue(downloadSpeed),
  [ConfigKey.UPLOAD_SPEED]: ({ [ConfigKey.UPLOAD_SPEED]: uploadSpeed }) =>
    validateThrottleValue(uploadSpeed),
  [ConfigKey.LATENCY]: ({ [ConfigKey.LATENCY]: latency }) => validateThrottleValue(latency, true),
  [ConfigKey.PLAYWRIGHT_OPTIONS]: ({ [ConfigKey.PLAYWRIGHT_OPTIONS]: playwrightOptions }) =>
    playwrightOptions ? !validJSONFormat(playwrightOptions) : false,
  [ConfigKey.PARAMS]: ({ [ConfigKey.PARAMS]: params }) =>
    params ? !validJSONFormat(params) : false,
};

export type ValidateDictionary = Record<DataStream, Validation>;

export const validate: ValidateDictionary = {
  [DataStream.HTTP]: validateHTTP,
  [DataStream.TCP]: validateTCP,
  [DataStream.ICMP]: validateICMP,
  [DataStream.BROWSER]: validateBrowser,
};
