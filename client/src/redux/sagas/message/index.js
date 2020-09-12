import { takeLatest, takeEvery, put } from "redux-saga/effects";

import { sendRequest } from "modules/utils";

import {
	POST_MESSAGE,
	GET_MESSAGES,
	DELETE_MESSAGE
} from "redux/constants/message";

import { toast } from "react-toastify";

import constants from "modules/constants";
import * as messageActions from "redux/actions/message";
import * as conversationActions from "redux/actions/conversation";

function* sendMessagePostFetchSaga(action) {
	const { body } = action.params;

	try {
		const response = yield sendRequest({
			url: `${constants.API.ROOT}${constants.API.ACTIONS.MESSAGE}`,
			method: constants.API.METHODS.POST,
			body
		});

		yield put(messageActions.postMessageReceived());

		yield put(
			conversationActions.addMessageToCurrentConversationMessages({
				message: {
					currentUserIsSender: true,
					...response.result
				},
				partner: {
					_id: response.result.receiverId
				}
			})
		);
	} catch (e) {
		yield put(messageActions.postMessageReceived());
		toast.error(constants.LABELS.MAIN.GLOBAL_ERROR);
	}
}

function* getMessagesFetchSaga(action) {
	const { partnerId } = action.params;

	const query = {
		partnerId
	};

	try {
		const response = yield sendRequest({
			url: `${constants.API.ROOT}${constants.API.ACTIONS.MESSAGE}`,
			method: constants.API.METHODS.GET,
			query
		});

		yield put(messageActions.getMessagesReceived());
		yield put(
			conversationActions.setCurrentConversationMessages({
				result: response.result,
				partnerId
			})
		);
	} catch (e) {
		yield put(messageActions.getMessagesReceived());
		toast.error(constants.LABELS.MAIN.GLOBAL_ERROR);
	}
}

function* deleteMessageFetchSaga(action) {
	const { messageId, partnerId } = action.params;

	const body = {
		messageId,
		partnerId
	};

	try {
		yield sendRequest({
			url: `${constants.API.ROOT}${constants.API.ACTIONS.MESSAGE}`,
			method: constants.API.METHODS.DELETE,
			body
		});

		yield put(messageActions.deleteMessageReceived());
		yield put(
			conversationActions.removeMessageFromConversation({
				messageId,
				partnerId
			})
		);
	} catch (e) {
		yield put(messageActions.deleteMessageReceived());
		toast.error(constants.LABELS.MAIN.GLOBAL_ERROR);
	}
}

const sagas = [
	takeEvery(POST_MESSAGE, sendMessagePostFetchSaga),
	takeLatest(GET_MESSAGES, getMessagesFetchSaga),
	takeEvery(DELETE_MESSAGE, deleteMessageFetchSaga)
];

export default sagas;
