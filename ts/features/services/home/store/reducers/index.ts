import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { FeaturedItems } from "../../../../../../definitions/services/FeaturedItems";
import { Institution } from "../../../../../../definitions/services/Institution";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { featuredItemsGet, paginatedInstitutionsGet } from "../actions";

export type ServicesHomeState = {
  featuredItems: pot.Pot<FeaturedItems, NetworkError>;
  paginatedInstitutions: pot.Pot<InstitutionsResource, NetworkError>;
};

const INITIAL_STATE: ServicesHomeState = {
  featuredItems: pot.none,
  paginatedInstitutions: pot.none
};

const homeReducer = (
  state: ServicesHomeState = INITIAL_STATE,
  action: Action
): ServicesHomeState => {
  switch (action.type) {
    // Fetch Institutions actions
    case getType(paginatedInstitutionsGet.request):
      if (pot.isNone(state.paginatedInstitutions)) {
        return {
          ...state,
          paginatedInstitutions: pot.noneLoading
        };
      }

      return {
        ...state,
        paginatedInstitutions: pot.toUpdating(state.paginatedInstitutions, {
          count: 0,
          institutions: [],
          ...action.payload
        })
      };
    case getType(paginatedInstitutionsGet.success):
      if (action.payload.offset === 0) {
        return {
          ...state,
          paginatedInstitutions: pot.some(action.payload)
        };
      }

      const currentInstitutions = pot.getOrElse(
        pot.map(
          state.paginatedInstitutions,
          res => res.institutions as Array<Institution>
        ),
        []
      );

      return {
        ...state,
        paginatedInstitutions: pot.some({
          ...action.payload,
          institutions: [...currentInstitutions, ...action.payload.institutions]
        })
      };
    case getType(paginatedInstitutionsGet.failure):
      return {
        ...state,
        paginatedInstitutions: pot.toError(
          state.paginatedInstitutions,
          action.payload
        )
      };
    // Get FeaturedItems actions
    case getType(featuredItemsGet.request):
      if (pot.isNone(state.featuredItems)) {
        return {
          ...state,
          featuredItems: pot.noneLoading
        };
      }

      return {
        ...state,
        featuredItems: pot.toUpdating(state.featuredItems, {
          items: []
        })
      };
    case getType(featuredItemsGet.success):
      return {
        ...state,
        featuredItems: pot.some(action.payload)
      };
    case getType(featuredItemsGet.failure):
      return {
        ...state,
        featuredItems: pot.toError(state.featuredItems, action.payload)
      };
  }
  return state;
};

export default homeReducer;

export const homeSelector = (state: GlobalState) =>
  state.features.services.home;

export const paginatedInstitutionsPotSelector = createSelector(
  homeSelector,
  home => home.paginatedInstitutions
);

export const paginatedInstitutionsSelector = createSelector(
  paginatedInstitutionsPotSelector,
  pot.toUndefined
);

export const featuredItemsPotSelector = createSelector(
  homeSelector,
  home => home.featuredItems
);

export const featuredItemsSelector = createSelector(
  featuredItemsPotSelector,
  pot.toUndefined
);

export const isLoadingPaginatedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, paginatedInstitutionsPotSelector, pot.isLoading);

export const isUpdatingPaginatedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, paginatedInstitutionsPotSelector, pot.isUpdating);

export const isErrorPaginatedInstitutionsSelector = (state: GlobalState) =>
  pipe(state, paginatedInstitutionsPotSelector, pot.isError);

export const isLoadingFeaturedItemsSelector = (state: GlobalState) =>
  pipe(state, featuredItemsPotSelector, pot.isLoading);

export const isUpdatingFeaturedItemsSelector = (state: GlobalState) =>
  pipe(state, featuredItemsPotSelector, pot.isUpdating);

export const isErrorFeaturedItemsSelector = (state: GlobalState) =>
  pipe(state, featuredItemsPotSelector, pot.isError);

/**
 * Returns the current page of the paginated institutions.
 *
 * | count | offset | limit | result |
 * |------:|-------:|------:|-------:|
 * | 55    | 0      | 20    | 0      |
 * | 55    | 20     | 20    | 1      |
 * | 55    | 40     | 20    | 2      |
 * | 55    | 60     | 20    | -1     |
 */
export const paginatedInstitutionsCurrentPageSelector = createSelector(
  paginatedInstitutionsPotSelector,
  paginatedInstitutions =>
    pot.getOrElse(
      pot.map(paginatedInstitutions, ({ count: total, limit, offset }) =>
        offset >= total ? -1 : offset / limit
      ),
      0
    )
);

export const paginatedInstitutionsLastPageSelector = createSelector(
  paginatedInstitutionsPotSelector,
  paginatedInstitutionsCurrentPageSelector,
  (paginatedInstitutionsPot, currentPage) =>
    pot.getOrElse(
      pot.map(
        paginatedInstitutionsPot,
        ({ count: total, limit }) => (currentPage + 1) * limit >= total
      ),
      false
    )
);
