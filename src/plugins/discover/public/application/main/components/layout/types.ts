/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Query, TimeRange, AggregateQuery } from '@kbn/es-query';
import type { DataView } from '@kbn/data-views-plugin/public';
import type { ISearchSource } from '@kbn/data-plugin/public';
import { SavedSearch } from '@kbn/saved-search-plugin/public';
import { DiscoverStateContainer } from '../../services/discover_state';
import type { InspectorAdapters } from '../../hooks/use_inspector';

export interface DiscoverLayoutProps {
  inspectorAdapters: InspectorAdapters;
  navigateTo: (url: string) => void;
  onChangeDataView: (id: string) => void;
  onUpdateQuery: (
    payload: { dateRange: TimeRange; query?: Query | AggregateQuery },
    isUpdate?: boolean
  ) => void;
  resetSavedSearch: () => void;
  savedSearch: SavedSearch;
  searchSource: ISearchSource;
  stateContainer: DiscoverStateContainer;
  persistDataView: (dataView: DataView) => Promise<DataView | undefined>;
  updateAdHocDataViewId: (dataView: DataView) => Promise<DataView>;
  updateDataViewList: (newAdHocDataViews: DataView[]) => void;
}
