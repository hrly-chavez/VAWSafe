import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, Alert } from 'react-native';

// formik
import { Formik } from "formik";

// icons
import { Octicons, Ionicons, Fontisto, MaterialIcons } from '@expo/vector-icons';

// local authentication
import * as LocalAuthentication from 'expo-local-authentication';

import { useNavigation } from '@react-navigation/native';

import {
    StyledContainer,
    InnerContainer,
    PageLogo,
    PageTitle,
    SubTitle,
    StyledFormArea,
    LeftIcon,
    StyledInputLabel,
    StyledTextInput,
    RightIcon,
    StyledButton,
    ButtonText,
    Colors,
    MsgBox,
    Line,
    ExtraView,
    ExtraText,
    TextLink,
    TextLinkContent,
} from './../components/styles';

// keyboard avoiding view
import KeyboardAvoidingWrapper from "./../components/KeyboardAvoidingWrapper";

// Colors
const { brand, darklight, primary } = Colors;

const Login = () => {
    const [hidePassword, setHidePassword] = useState(true);

    const navigation = useNavigation();

    // Face ID / Fingerprint login function
    const handleFaceID = async () => {
        try {
            // Check if device supports biometrics
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                Alert.alert('Error', 'Your device does not support Face ID');
                return;
            }

            // Check if biometrics are enrolled
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            if (!enrolled) {
                Alert.alert('Error', 'No Face ID found. Please enroll in device settings.');
                return;
            }

            // Prompt for authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Face ID',
                fallbackLabel: 'Enter Password',
            });

            if (result.success) {
                Alert.alert('Success', 'Authenticated successfully!');
                // Navigate to Welcome screen or Dashboard here
                navigation.navigate('Welcome');
            } else {
                Alert.alert("Error", "Authentication failed.");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <KeyboardAvoidingWrapper>
            <StyledContainer>
                <StatusBar style="dark" />
                <InnerContainer>
                    <PageLogo resizeMode="contain" source={require('./../assets/img/logo.png')} />
                    <SubTitle>Choose your login method</SubTitle>

                    {/* ===== EMAIL/PASSWORD LOGIN FORM ===== */}
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        onSubmit={(values) => {
                            const { email, password } = values;

                            // if (!email || !password) {
                            //     Alert.alert("Missing Fields", "Please enter both email and password.");
                            //     return;
                            // }

                            Alert.alert('Login', `Email: ${email}`);
                            navigation.navigate('Welcome');
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values }) => (
                            <StyledFormArea>
                                <MyTextInput
                                    label="Email Address"
                                    icon="mail"
                                    placeholder="relonxyronnewell@gmail.com"
                                    placeholderTextColor={darklight}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                    keyboardType="email-address"
                                />

                                <MyTextInput
                                    label="Password"
                                    icon="lock"
                                    placeholder="* * * * * * * *"
                                    placeholderTextColor={darklight}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    secureTextEntry={hidePassword}
                                    isPassword={true}
                                    hidePassword={hidePassword}
                                    setHidePassword={setHidePassword}
                                />

                                <MsgBox>...</MsgBox>

                                <StyledButton onPress={handleSubmit}>
                                    <ButtonText>Login</ButtonText>
                                </StyledButton>

                                <Line />

                                {/* Face ID Button */}
                                <StyledButton face={true} onPress={handleFaceID}>
                                    <MaterialIcons name="face" color={primary} size={25} />
                                    <ButtonText face={true}>Face ID</ButtonText>
                                </StyledButton>

                                <Line />

                                {/* Google Button */}
                                {/* <StyledButton google={true} onPress={handleSubmit}>
                                    <Fontisto name="google" color={primary} size={25} />
                                    <ButtonText google={true}>Sign in with Google</ButtonText>
                                </StyledButton> */}

                                {/* <ExtraView>
                                    <ExtraText>Don't have an account already? </ExtraText>
                                    <TextLink onPress={() => navigation.navigate('Signup')}>
                                        <TextLinkContent>Signup</TextLinkContent>
                                    </TextLink>
                                </ExtraView> */}
                            </StyledFormArea>
                        )}
                    </Formik>
                </InnerContainer>
            </StyledContainer>
        </KeyboardAvoidingWrapper>
    );
}

// Custom Text Input component
const MyTextInput = ({ label, icon, isPassword, hidePassword, setHidePassword, ...props }) => {
    return (
        <View style={{ position: 'relative', marginBottom: 20 }}>
            <StyledInputLabel>{label}</StyledInputLabel>
            <LeftIcon>
                <Octicons name={icon} size={30} color={brand} />
            </LeftIcon>
            <StyledTextInput {...props} />
            {isPassword && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darklight} />
                </RightIcon>
            )}
        </View>)
}

export default Login;