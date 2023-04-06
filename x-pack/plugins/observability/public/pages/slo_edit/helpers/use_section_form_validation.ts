/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { CreateSLOInput } from '@kbn/slo-schema';
import { FormState, UseFormGetFieldState, UseFormGetValues, UseFormWatch } from 'react-hook-form';

interface Props {
  getFieldState: UseFormGetFieldState<CreateSLOInput>;
  getValues: UseFormGetValues<CreateSLOInput>;
  formState: FormState<CreateSLOInput>;
  watch: UseFormWatch<CreateSLOInput>;
}

export function useSectionFormValidation({ getFieldState, getValues, formState, watch }: Props) {
  let isIndicatorSectionValid: boolean = false;

  switch (watch('indicator.type')) {
    case 'sli.kql.custom':
      isIndicatorSectionValid =
        (
          [
            'indicator.params.index',
            'indicator.params.filter',
            'indicator.params.good',
            'indicator.params.total',
            'indicator.params.timestampField',
          ] as const
        ).every((field) => !getFieldState(field).invalid) &&
        (['indicator.params.index', 'indicator.params.timestampField'] as const).every(
          (field) => !!getValues(field)
        );
      break;
    case 'sli.apm.transactionDuration':
      isIndicatorSectionValid =
        (
          [
            'indicator.params.service',
            'indicator.params.environment',
            'indicator.params.transactionType',
            'indicator.params.transactionName',
            'indicator.params.threshold',
          ] as const
        ).every((field) => !getFieldState(field, formState).invalid && getValues(field) !== '') &&
        !getFieldState('indicator.params.index', formState).invalid;
      break;
    case 'sli.apm.transactionErrorRate':
      isIndicatorSectionValid =
        (
          [
            'indicator.params.service',
            'indicator.params.environment',
            'indicator.params.transactionType',
            'indicator.params.transactionName',
          ] as const
        ).every((field) => !getFieldState(field, formState).invalid && getValues(field) !== '') &&
        (['indicator.params.index', 'indicator.params.goodStatusCodes'] as const).every(
          (field) => !getFieldState(field, formState).invalid
        );
      break;
    default:
      isIndicatorSectionValid = false;
      break;
  }

  const isObjectiveSectionValid = (
    [
      'budgetingMethod',
      'timeWindow.duration',
      'objective.target',
      'objective.timesliceTarget',
      'objective.timesliceWindow',
    ] as const
  ).every((field) => getFieldState(field).error === undefined);

  const isDescriptionSectionValid =
    !getFieldState('name').invalid &&
    getValues('name') !== '' &&
    !getFieldState('description').invalid;

  return {
    isIndicatorSectionValid,
    isObjectiveSectionValid,
    isDescriptionSectionValid,
  };
}
