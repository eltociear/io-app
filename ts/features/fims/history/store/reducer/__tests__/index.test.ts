import * as pot from "@pagopa/ts-commons/lib/pot";
import reducer, { FimsExportSuccessStates, INITIAL_STATE } from "..";
import {
  isError,
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { fimsHistoryExport, fimsHistoryGet } from "../../actions";
import { ConsentsResponseDTO } from "../../../../../../../definitions/fims/ConsentsResponseDTO";
import { Consent } from "../../../../../../../definitions/fims/Consent";

describe("INITIAL_STATE", () => {
  it("Should match snapshot", () => {
    expect(INITIAL_STATE).toMatchSnapshot();
  });
});

describe("fimsHistoryReducer", () => {
  it("Should match INITIAL_STATE upon first invocation with 'undefined' input state and unrelated action 'applicationChangeState'", () => {
    const historyState = reducer(undefined, applicationChangeState("active"));
    expect(historyState).toEqual(INITIAL_STATE);
  });
});

describe("fimsHistoryReducer, receiving fimsHistoryGet.request", () => {
  const consentsResponse = {} as ConsentsResponseDTO;
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(consentsResponse),
    pot.noneError("An error"),
    pot.some(consentsResponse),
    pot.someLoading(consentsResponse),
    pot.someUpdating(consentsResponse, consentsResponse),
    pot.someError(consentsResponse, "An error")
  ].forEach(consentsList =>
    [undefined, false, true].forEach(shouldReloadFromScratch =>
      [undefined, "01JBVEPWGWVD8NWXQ3PEQAPFX3"].forEach(continuationToken => {
        it(`Should set 'consentsList' to loading state ${
          shouldReloadFromScratch ? "(keeping the inner pot value)" : ""
        } and leave 'historyExportState unaffected, for 'fimsHistoryGet.request' action with 'shouldReloadFromScratch' set to ${shouldReloadFromScratch} and 'continuationToken' ${
          continuationToken ? "defined" : "undefined"
        }`, () => {
          const fimsHistoryGetRequest = fimsHistoryGet.request({
            continuationToken,
            shouldReloadFromScratch
          });
          const historyState = reducer(
            { consentsList, historyExportState: remoteLoading },
            fimsHistoryGetRequest
          );

          if (shouldReloadFromScratch) {
            expect(historyState.consentsList).toEqual(pot.noneLoading);
          } else {
            expect(historyState.consentsList).toEqual(
              pot.toLoading(consentsList)
            );
          }
          expect(historyState.historyExportState).toEqual(remoteLoading);
        });
      })
    )
  );
});

describe("fimsHistoryReducer, receiving fimsHistoryGet.success", () => {
  [
    [],
    [
      {
        id: "id1",
        service_id: "sid1",
        timestamp: new Date()
      },
      {
        id: "id2",
        service_id: "sid2",
        timestamp: new Date()
      },
      {
        id: "id3",
        service_id: "sid3",
        timestamp: new Date()
      }
    ] as ReadonlyArray<Consent>
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ].forEach(initialStateItems => {
    const consentsResponseDTO = {
      items: initialStateItems,
      continuationToken: "The initial continuation token"
    };
    [
      pot.none,
      pot.noneLoading,
      pot.noneUpdating(consentsResponseDTO),
      pot.noneError("An error"),
      pot.some(consentsResponseDTO),
      pot.someLoading(consentsResponseDTO),
      pot.someUpdating(consentsResponseDTO, consentsResponseDTO),
      pot.someError(consentsResponseDTO, "An error")
    ].forEach(initialConsentsList => {
      const initialState = {
        consentsList: initialConsentsList,
        historyExportState: remoteLoading
      };
      [undefined, "01JBVYCJJTMYJWA7Q7YDGJYA6Z"].forEach(
        responseContinuationToken =>
          [
            [],
            [
              {
                id: "id4",
                service_id: "sid4",
                timestamp: new Date()
              },
              {
                id: "id5",
                service_id: "sid5",
                timestamp: new Date()
              }
            ] as ReadonlyArray<Consent>
          ].forEach(responseItems => {
            const expectedOutputItems = [
              ...(pot.isSome(initialConsentsList)
                ? initialConsentsList.value.items
                : []),
              ...responseItems
            ];
            it(`Given 'consentsList' ${initialConsentsList.kind} (${
              pot.isSome(initialConsentsList)
                ? initialConsentsList.value.items.length
                : 0
            } items), after 'fimsHistoryGetSuccess.success' with 'continuationToken' ${
              responseContinuationToken ? "defined" : "undefined"
            } and ${
              responseItems.length
            } items, it should keep 'historyExportState', have same 'continuationToken' and (${
              expectedOutputItems.length
            } final items)`, () => {
              const fimsHistoryGetSuccess = fimsHistoryGet.success({
                items: responseItems,
                continuationToken: responseContinuationToken
              });

              const historyState = reducer(initialState, fimsHistoryGetSuccess);

              expect(historyState.historyExportState).toBe(remoteLoading);

              const outputConsentsList = historyState.consentsList;
              expect(pot.isSome(outputConsentsList)).toBeTruthy();

              if (!pot.isSome(outputConsentsList)) {
                throw Error(
                  "Test is failing: historeState.consentsList should be pot.some"
                );
              }

              expect(outputConsentsList.value.items).toEqual(
                expectedOutputItems
              );
              expect(outputConsentsList.value.continuationToken).toEqual(
                responseContinuationToken
              );
            });
          })
      );
    });
  });
});

describe("fimsHistoryReducer, receiving fimsHistoryGet.failure", () => {
  const consentsData = {
    items: [
      {
        id: "01JBXRH74QWKN21SA1Q8KQZG97",
        service_id: "01JBXRHCYN6HDM2FNYBG40EPYF",
        timestamp: new Date()
      }
    ],
    continuationToken: "01JBXRGCN4RJRE0TCGR2Z86DZP"
  };
  [
    pot.none,
    pot.noneLoading,
    pot.noneUpdating(consentsData),
    pot.noneError("An error"),
    pot.some(consentsData),
    pot.someLoading(consentsData),
    pot.someUpdating(consentsData, consentsData),
    pot.someError(consentsData, "An error")
  ].forEach(consentsDataPot => {
    it(`Given a '${
      consentsDataPot.kind
    }' initial state, it should keep same value for 'historyExportState', have an error pot for 'consentsList'${
      pot.isSome(consentsDataPot) ? " and keep its inner value" : ""
    }`, () => {
      const initialState = {
        consentsList: consentsDataPot,
        historyExportState: remoteLoading
      };
      const errorReason = "This is the error reason";
      const fimsHistoryGetFailure = fimsHistoryGet.failure(errorReason);

      const historyState = reducer(initialState, fimsHistoryGetFailure);

      expect(historyState.historyExportState).toEqual(remoteLoading);
      const stateConsentsList = historyState.consentsList;
      expect(pot.isError(stateConsentsList)).toBe(true);

      if (!pot.isError(stateConsentsList)) {
        throw Error(
          "Test is failing: historyState.consentsList should be pot.error"
        );
      }

      expect(stateConsentsList.error).toBe(errorReason);

      if (pot.isSome(consentsDataPot)) {
        expect(pot.isSome(stateConsentsList)).toBe(true);
        if (!pot.isSome(stateConsentsList)) {
          throw Error(
            "Test is failing: historyState.consentsList should be pot.someError"
          );
        }
        expect(stateConsentsList.value).toBe(consentsData);
      }
    });
  });
});

const generateInitialConsentsList = () =>
  pot.someError(
    {
      items: [
        {
          id: "01JBXSV418Y8BC511JMBSS33GM",
          service_id: "01JBXSV79PBB4DGJ5V84RQX4H9",
          timestamp: new Date()
        }
      ],
      continuationToken: "01JBXSTE8J0WG7CAFMK6KKDS6C"
    },
    "There was an error"
  );

const generateHistoryExportInitialStatuses = (): ReadonlyArray<
  RemoteValue<FimsExportSuccessStates, null>
> => [
  remoteUndefined,
  remoteLoading,
  remoteReady("SUCCESS"),
  remoteReady("ALREADY_EXPORTING"),
  remoteError(null)
];

describe("fimsHistoryReducer, receiving fimsHistoryExport.request", () =>
  generateHistoryExportInitialStatuses().forEach(historyExportInitialState => {
    it(`Given initial 'historyExportState' of type '${
      historyExportInitialState.kind
    } ${
      isReady(historyExportInitialState) ? historyExportInitialState.value : ""
    }', it should set 'historyExportState' to 'remoteLoading' and preserve the value in 'consentsList'`, () => {
      const initialState = {
        consentsList: generateInitialConsentsList(),
        historyExportState: historyExportInitialState
      };
      const fimsHistoryExportRequest = fimsHistoryExport.request();

      const historyState = reducer(initialState, fimsHistoryExportRequest);

      expect(historyState.consentsList).toEqual(initialState.consentsList);
      expect(historyState.historyExportState).toBe(remoteLoading);
    });
  }));

describe("fimsHistoryReducer, receiving fimsHistoryExport.success", () =>
  generateHistoryExportInitialStatuses().forEach(historyExportInitialState => {
    const initialState = {
      consentsList: generateInitialConsentsList(),
      historyExportState: historyExportInitialState
    };
    (
      ["SUCCESS", "ALREADY_EXPORTING"] as ReadonlyArray<FimsExportSuccessStates>
    ).forEach(exportState =>
      it(`Given initial 'historyExportState' of type '${
        historyExportInitialState.kind
      } ${
        isReady(historyExportInitialState)
          ? historyExportInitialState.value
          : ""
      }', it should set 'historyExportState' to 'remoteReady', matching the action's '${exportState}' value and preserve the value in 'consentsList'`, () => {
        const fimsHistoryExportSuccess = fimsHistoryExport.success(exportState);

        const historyState = reducer(initialState, fimsHistoryExportSuccess);

        expect(historyState.consentsList).toEqual(initialState.consentsList);

        const historyExportState = historyState.historyExportState;
        expect(isReady(historyExportState)).toBe(true);

        if (!isReady(historyExportState)) {
          throw Error(
            "Test failure: 'historyState.historyExportState' should be 'remoteReady'"
          );
        }

        expect(historyExportState.value).toBe(exportState);
      })
    );
  }));

describe("fimsHistoryReducer, receiving fimsHistoryExport.failure", () =>
  generateHistoryExportInitialStatuses().forEach(historyExportInitialState => {
    const initialState = {
      consentsList: generateInitialConsentsList(),
      historyExportState: historyExportInitialState
    };
    it(`Given initial 'historyExportState' of type '${
      historyExportInitialState.kind
    } ${
      isReady(historyExportInitialState) ? historyExportInitialState.value : ""
    }', it should set 'historyExportState' to 'remoteError' with a 'null' value and preserve the value in 'consentsList'`, () => {
      const fimsHistoryExportFailure = fimsHistoryExport.failure();

      const historyState = reducer(initialState, fimsHistoryExportFailure);

      expect(historyState.consentsList).toEqual(initialState.consentsList);

      const historyExportState = historyState.historyExportState;
      expect(isError(historyExportState)).toBe(true);

      if (!isError(historyExportState)) {
        throw Error(
          "Test failure: 'historyState.historyExportState' should be 'remoteError'"
        );
      }

      expect(historyExportState.error).toBeNull();
    });
  }));
