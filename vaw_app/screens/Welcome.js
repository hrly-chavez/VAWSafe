import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

import {
    InnerContainer,
    PageTitle,
    SubTitle,
    StyledFormArea,
    StyledButton,
    ButtonText,
    Line,
    WelcomeContainer,
    WelcomeImage,
    Avatar
} from './../components/styles';

const Welcome = () => {
    const navigation = useNavigation();

    return (
        <>
            <StatusBar style="light" />
            <InnerContainer>
                <WelcomeImage resizeMode="contain" source={require('./../assets/img/background.png')} />
                <WelcomeContainer>
                    <PageTitle welcome={true}>Welcome to VAWSafe</PageTitle>
                    <SubTitle welcome={true}>Your safety. Your voice. Your space.</SubTitle>
                    <StyledFormArea>
                        <Avatar resizeMode="full" source={require('./../assets/img/logo1.png')} />
                        <Line />
                        <StyledButton onPress={() => navigation.navigate('Notification')}>
                            <ButtonText>Get Started</ButtonText>
                        </StyledButton>
                    </StyledFormArea>
                </WelcomeContainer>
            </InnerContainer>
        </>
    );
};

export default Welcome;