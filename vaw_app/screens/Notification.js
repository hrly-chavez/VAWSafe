import React from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Styled components
import {
    SearchInput,
    NotificationHeader,
    NotificationTitle,
    NotificationCard,
    CardHeader,
    SenderText,
    DateText,
    SearchContainer,
    SubjectText,
    PreviewText,
    ComposeBox,
    ComposeText,
    SectionDivider,
    ContentWrapper,
} from './../components/styles';

const notifications = [
    {
        id: '1',
        sender: 'VAWSAFE',
        subject: 'VAWSAFE is ready',
        preview: 'Xyron Newell, complete your download...',
        date: 'Sep 22',
    },
    {
        id: '2',
        sender: 'VAWDesk',
        subject: 'Account Approved',
        preview: 'Dear Jerry, Your VAWDesk account has...',
        date: 'Sep 21',
    },
    {
        id: '3',
        sender: 'VAWSAFE',
        subject: 'Thanks for confirming your email',
        preview: 'Your email has been verified successfully.',
        date: 'Sep 21',
    },
];

const Notification = () => {
    const navigation = useNavigation();

    const renderItem = ({ item }) => (
        <NotificationCard>
            <CardHeader>
                <SenderText>{item.sender}</SenderText>
                <DateText>{item.date}</DateText>
            </CardHeader>
            <SubjectText>{item.subject}</SubjectText>
            <PreviewText>{item.preview}</PreviewText>
        </NotificationCard>
    );

    return (
            <ContentWrapper>
                <StatusBar style="dark" />
                {/* Search Bar */}

                <SearchContainer>
                    <Ionicons name="search" size={20} color="#888" />
                    <SearchInput
                        placeholder="Search notifications"
                        placeholderTextColor="#888"
                    />
                    <Ionicons
                        name="person-circle-outline"
                        size={26}
                        color="#888"
                        onPress={() => navigation.navigate('Profile')}
                    />
                </SearchContainer>



                {/* Divider Line */}
                <SectionDivider />

                {/* Header */}
                <NotificationHeader>
                    <NotificationTitle>Notifications</NotificationTitle>
                    <MaterialIcons
                        name="feedback"
                        size={24}
                        color="#007AFF"
                        onPress={() => navigation.navigate('FeedbackForm')}
                    />
                </NotificationHeader>

                {/* Notification List */}
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                {/* Compose Box */}
                <ComposeBox onPress={() => navigation.navigate('FeedbackForm')}>
                    <MaterialIcons name="edit" size={24} color="#fff" />
                    <ComposeText>Send Feedback</ComposeText>
                </ComposeBox>
            </ContentWrapper>
    );
};

export default Notification;
