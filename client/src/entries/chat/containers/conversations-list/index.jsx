import React, {
	Component
} from 'react';

import {
	LabelComponent
} from 'shared/components';

import {
	ConversationCardComponent,
	ConversationCardSketch
} from 'entries/chat/components';

export default class ConversationsList extends Component {
	renderConversationsContent = () => {
		const {
			isFetching,
			items,
			emptyMessage,
			onClickItem
		} = this.props;

		if (isFetching) {
			return (
				<div>
					<ConversationCardSketch />
					<ConversationCardSketch />
					<ConversationCardSketch />
				</div>
			);
		}

		if (items.length <= 0) {
			return (
				<LabelComponent
					fontRegular
					text={emptyMessage}
					alignCenter
					fontSize={16}
					margin="50px 0px 0px 0px"
				/>
			);
		}

		return (
			<div>
				{
					items.map((item, key) => {
						return (
							<ConversationCardComponent
								key={key}
								onClick={onClickItem}
								profile={{
									label: item.nickname,
									width: 40,
									height: 40,
									backgroundColor: item.profileColor,
									color: 'white',
									labelFontSize: 12
								}}
								title={{
									text: item.nickname,
									fontSize: 13,
									maxWidth: 100,
									margin: '0px 0px 0px 14px'
								}}
								desc={{
									text: item.desc,
									fontSize: 13,
									maxWidth: 100,
									margin: '0px 0px 0px 14px'
								}}
								rightLabel={item.rightLabel}
							/>
						);
					})
				}
			</div>
		);
	}

	render () {
		return (
			<div className='conversations-list-container'>
				{
					this.renderConversationsContent()
				}
			</div>
		);
	}
}