/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import Boom from '@hapi/boom';

import type { CommentRequest } from '../../../common/api';
import type { AttachmentService } from '../../services';
import type { Limiter } from './types';
import { AlertLimiter } from './limiters/alerts';
import { FileLimiter } from './limiters/files';

export class AttachmentLimitChecker {
  private readonly limiters: Limiter[] = [new AlertLimiter(), new FileLimiter()];

  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly caseId: string
  ) {}

  public async validate(requests: CommentRequest[]) {
    for (const limiter of this.limiters) {
      const itemsWithinRequests = limiter.countOfItemsInRequest(requests);
      const hasItemsInRequests = itemsWithinRequests > 0;

      const totalAfterRequests = async () => {
        const itemsWithinCase = await limiter.countOfItemsWithinCase(
          this.attachmentService,
          this.caseId
        );

        return itemsWithinRequests + itemsWithinCase;
      };

      /**
       * The call to totalAfterRequests is intentionally performed after checking the limit. If the number in the
       * requests is greater than the max then we can skip checking how many items exist within the case because it is
       * guaranteed to exceed.
       */
      if (
        hasItemsInRequests &&
        (itemsWithinRequests > limiter.limit || (await totalAfterRequests()) > limiter.limit)
      ) {
        throw Boom.badRequest(limiter.errorMessage);
      }
    }
  }
}
