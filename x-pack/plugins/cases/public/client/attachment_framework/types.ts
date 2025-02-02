/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type React from 'react';
import type { EuiCommentProps, IconType, EuiButtonProps } from '@elastic/eui';
import type {
  CommentRequestExternalReferenceType,
  CommentRequestPersistableStateType,
} from '../../../common/api';
import type { Case } from '../../containers/types';

export interface AttachmentAction {
  onClick: () => void;
  iconType: string;
  label: string;
  color?: EuiButtonProps['color'];
  isPrimary?: boolean;
}

export interface AttachmentViewObject<Props = {}> {
  timelineAvatar?: EuiCommentProps['timelineAvatar'];
  getActions?: (props: Props) => AttachmentAction[];
  event?: EuiCommentProps['event'];
  children?: React.LazyExoticComponent<React.FC<Props>>;
}

export interface CommonAttachmentViewProps {
  caseData: Pick<Case, 'id' | 'title'>;
}

export interface ExternalReferenceAttachmentViewProps extends CommonAttachmentViewProps {
  externalReferenceId: CommentRequestExternalReferenceType['externalReferenceId'];
  externalReferenceMetadata: CommentRequestExternalReferenceType['externalReferenceMetadata'];
}

export interface PersistableStateAttachmentViewProps extends CommonAttachmentViewProps {
  persistableStateAttachmentTypeId: CommentRequestPersistableStateType['persistableStateAttachmentTypeId'];
  persistableStateAttachmentState: CommentRequestPersistableStateType['persistableStateAttachmentState'];
}

export interface AttachmentType<Props> {
  id: string;
  icon: IconType;
  displayName: string;
  getAttachmentViewObject: () => AttachmentViewObject<Props>;
  getAttachmentRemovalObject?: (props: Props) => Pick<AttachmentViewObject<Props>, 'event'>;
}

export type ExternalReferenceAttachmentType = AttachmentType<ExternalReferenceAttachmentViewProps>;
export type PersistableStateAttachmentType = AttachmentType<PersistableStateAttachmentViewProps>;

export interface AttachmentFramework {
  registerExternalReference: (
    externalReferenceAttachmentType: ExternalReferenceAttachmentType
  ) => void;
  registerPersistableState: (
    persistableStateAttachmentType: PersistableStateAttachmentType
  ) => void;
}
