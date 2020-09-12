/* eslint-disable react/sort-comp */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import _, { isEmpty } from 'lodash';

import { ActionsWrapper, ChatWrapper } from 'entries/chat/wrappers';
import { CallWindowComponent } from 'shared/components';

import PeerConnection from 'modules/utils/PeerConnection';

import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import constants from 'modules/constants';
import io from 'socket.io-client';

import * as socketActions from 'redux/actions/socket';
import * as videoCallActions from 'redux/actions/videoCall';
import { instanceOf, string } from 'prop-types';

class HomeEntry extends Component {
	constructor() {
		super();
		this.state = {
			clientId: '',
			callWindow: '',
			callModal: '',
			callFrom: '',
			localSrc: null,
			peerSrc: null,
			started: false
		};
		this.pc = {};
		this.config = null;
		this.startCallHandler = this.startCall.bind(this);
		this.initiateVideo = this.startVideo.bind(this);
	}

	componentDidMount() {
		const { socketActions } = this.props;

		socketActions.startChannel();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const { videoCallData } = this.props;

		console.log(videoCallData, 'didi update');

		if (!this.state.started && videoCallData.socket) {
			videoCallData.socket.on('call', data => {
				if (data.sdp) {
					this.pc.setRemoteDescription(data.sdp);
					if (data.sdp.type === 'offer') this.pc.createAnswer();
				} else {
					console.log('add iice', data.candidate);
					this.pc.addIceCandidate(data.candidate);
				}
			});

			this.setState({ started: true });
		}
	}

	startCall(isCaller, friendID, config) {
		this.config = config;
		this.pc = new PeerConnection(friendID)
			.on('localStream', src => {
				const newState = { callWindow: 'active', localSrc: src };
				if (!isCaller) newState.callModal = '';
				this.setState(newState);
			})
			.on('peerStream', src => {
				console.log('streaming', src);
				this.setState({ peerSrc: src });
			})
			.start(isCaller, config);
	}

	startVideo() {
		// const { videoCallData } = this.props;
		// if (Object.keys(this.pc).length > 0) {
		// 	if (videoCallData.sdp) {
		// 		this.setState({ started: true });
		// 		console.log(videoCallData.sdp, 'pc ae');
		// 		this.pc.setRemoteDescription(videoCallData.sdp);
		// 		if (videoCallData.sdp.type === 'offer') this.pc.createAnswer();
		// 	} else {
		// 		console.log(videoCallData.sdp, 'ice');
		// 		this.pc.addIceCandidate(videoCallData.candidate);
		// 	}
		// }
	}

	handleInitiateVideo() {}

	handleCallStart = () => {
		const { conversationData } = this.props;
		const { currentPartnerIdConversation } = conversationData;
		const config = { audio: true, video: true };
		this.startCall(true, currentPartnerIdConversation, config);
	};

	handleAceptCall = () => {
		const { conversationData } = this.props;
		const { currentPartnerIdConversation } = conversationData;
		const config = { audio: true, video: true };
		this.startCall(false, currentPartnerIdConversation, config);
		const { videoCallActions } = this.props;

		videoCallActions.acceptedVideoCall();
	};

	handleCancelCall = () => {};

	render() {
		const { videoCallData } = this.props;
		const { calling } = videoCallData;
		const { localSrc, peerSrc } = this.state;

		this.initiateVideo();

		return (
			<>
				<div className="chat-wrapper">
					{calling && (
						<div className="call-container">
							<p>Tem alguém ligando</p>
							<button onClick={this.handleAceptCall}>
								aceitar
							</button>
							<button onClick={this.handleCancelCall}>
								cancelar
							</button>
						</div>
					)}

					<ActionsWrapper />
					<ChatWrapper startCall={this.handleCallStart} />
				</div>
				{!_.isEmpty(this.config) && (
					<CallWindowComponent
						status="calling"
						localSrc={localSrc}
						peerSrc={peerSrc}
						config={this.config}
						mediaDevice={this.pc.mediaDevice}
						endCall={this.endCallHandler}
					/>
				)}
			</>
		);
	}
}

const mapDispatchToProps = dispatch => {
	return {
		socketActions: bindActionCreators(socketActions, dispatch),
		videoCallActions: bindActionCreators(videoCallActions, dispatch)
	};
};

const mapStateToProps = state => {
	return {
		videoCallData: state.videoCall,
		conversationData: state.conversation
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HomeEntry);
