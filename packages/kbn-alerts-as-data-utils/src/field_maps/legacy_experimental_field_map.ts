/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ALERT_EVALUATION_THRESHOLD, ALERT_EVALUATION_VALUE } from '@kbn/rule-data-utils';

export const legacyExperimentalFieldMap = {
  [ALERT_EVALUATION_THRESHOLD]: {
    type: 'scaled_float',
    scaling_factor: 100,
    required: false,
  },
  [ALERT_EVALUATION_VALUE]: { type: 'scaled_float', scaling_factor: 100, required: false },
} as const;

export type ExperimentalRuleFieldMap = typeof legacyExperimentalFieldMap;
