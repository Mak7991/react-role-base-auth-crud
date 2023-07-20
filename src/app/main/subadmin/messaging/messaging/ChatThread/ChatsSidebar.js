import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import { TextField, InputAdornment, CircularProgress } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContactListItem from './ContactListItem';
import * as Actions from './store/actions';

function ChatsSidebar({ isContactsLoading, setIsChatLoading, setIsContactsLoading }) {
	const dispatch = useDispatch();
	const [firstLoad, setFirstLoad] = useState(true);
	const currentConversationStatus = useSelector(({ chatApp }) => chatApp.contacts);
	const conversations = useSelector(({ chatApp }) => chatApp.contacts.entities);
	const selectedContactId = useSelector(({ chatApp }) => chatApp.contacts.selectedContactId);
	const [searchText, setSearchText] = useState('');
	const [hasMore, setHasMore] = useState(false);

	const handleLoadMore = () => {
		dispatch(Actions.getContactsPage(currentConversationStatus.next_page_url));
	};

	useEffect(() => {
		if (currentConversationStatus.next_page_url) {
			setHasMore(true);
		} else {
			setHasMore(false);
		}
	}, [currentConversationStatus]);

	const selectedContact = conversations.find(_contact => _contact.id === selectedContactId);

	function handleSearchText(event) {
		setSearchText(event.target.value);
	}

	useEffect(() => {
		if (selectedContactId) {
			dispatch(Actions.getChat(selectedContactId, setIsChatLoading, selectedContact.student_id));
		}
	}, []);

	useEffect(() => {
		if (firstLoad && conversations.length) {
			setFirstLoad(false);
			return () => 0;
		}
		const timeout = setTimeout(() => {
			dispatch(Actions.getContacts(setIsContactsLoading, searchText));
		}, 700);

		return () => {
			clearTimeout(timeout);
		};
	}, [searchText]);

	const handleContactClick = contactId => {
		const selectedConversation = conversations.filter(contact => contact.id === contactId)[0];
		dispatch(Actions.setselectedContactId(contactId));
		dispatch(Actions.getChat(contactId, setIsChatLoading, selectedConversation.student_id));
		const temp = conversations.map(conversation => {
			if (conversation.id === selectedConversation.id) {
				conversation.messages_unread_count = 0;
			}
			return conversation;
		});
		dispatch(Actions.updateContacts(temp));
	};

	return (
		<div className="flex flex-col flex-auto" style={{ height: '70vh' }}>
			{useMemo(
				() => (
					<>
						<div className="p-16 pt-32">
							<TextField
								onChange={handleSearchText}
								id="search"
								value={searchText}
								className="w-full"
								label="Search"
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => {
													document.getElementById('search').focus();
												}}
											>
												<img
													alt="search-icon"
													src="assets/images/search-icon.svg"
													height="80%"
													width="80%"
												/>
											</IconButton>
										</InputAdornment>
									)
								}}
							/>
						</div>
					</>
				),
				[searchText]
			)}
			{isContactsLoading ? (
				<div className="flex justify-center mt-20">
					<CircularProgress size={25} />
				</div>
			) : (
				<>
					<div className="w-full">
						<>
							<div
								id="chat-sidebar-scrollable-div"
								className="flex flex-col flex-shrink-0 overflow-auto"
								style={{ height: '55vh' }}
							>
								<InfiniteScroll
									dataLength={conversations.length}
									next={handleLoadMore}
									hasMore={hasMore}
									loader={<div>Loading...</div>}
									scrollableTarget="chat-sidebar-scrollable-div"
								>
									{conversations.map(conversation => (
										<ContactListItem
											key={conversation.id}
											conversation={conversation}
											onContactClick={handleContactClick}
										/>
									))}
								</InfiniteScroll>
							</div>
						</>
					</div>
				</>
			)}
		</div>
	);
}

export default ChatsSidebar;
