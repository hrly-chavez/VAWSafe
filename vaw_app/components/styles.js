import styled from 'styled-components/native';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

const StatusBarHeight = Constants.statusBarHeight;

export const Colors = {
  primary: "#ffffff",
  secondary: "#E5E7EB",
  tertiary: "#1F2937",
  darklight: "#9CA3AF",
  brand: "#ebb26cff",
  green: "#10B981",
  red: "#EF4444",
};

const { primary, secondary, tertiary, darklight, brand, green, red } = Colors;

export const StyledContainer = styled.View`
  flex: 1;
  padding: 25px;
  padding-top: ${StatusBarHeight + 10}px;
  background-color: ${primary};
`;

export const InnerContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`;

export const WelcomeContainer = styled(InnerContainer)`
  padding: 25px;
  padding-top: 10px;
  justify-content: center;
`;

export const PageLogo = styled.Image`
  width: 250px;
  height: 200px;
`;

export const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  margin: auto;
  border-radius: 50px;
  border-width: 2px;
  border-color: ${primary};
  margin-bottom: 10px;
  margin-top: 10px;
`;

export const WelcomeImage = styled.Image`
  height: 50%;
  min-width: 100%;
`;

export const PageTitle = styled.Text`
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  color: ${brand};
  padding: 10px;

  ${(props) =>
    props.welcome &&
    `
      font-size: 30px;
    `}
`;

export const SubTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 1px;
  font-weight: bold;
  color: ${tertiary};

  ${(props) =>
    props.welcome &&
    `
      margin-bottom: 5px;
      font-weight: normal;
    `}
`;

export const StyledFormArea = styled.View`
  width: 90%;
`;

export const StyledTextInput = styled.TextInput`
  background-color: ${secondary};
  padding: 15px;
  padding-left: 55px;
  padding-right: 55px;
  border-radius: 5px;
  font-size: 16px;
  height: 60px;
  margin-vertical: 3px;
  margin-bottom: 10px;
  color: ${tertiary};
`;

export const StyledInputLabel = styled.Text`
  color: ${tertiary};
  font-size: 13px;
  text-align: left;
`;

export const LeftIcon = styled.View`
  left: 15px;
  top: 38px;
  position: absolute;
  z-index: 1;
`;

export const RightIcon = styled.TouchableOpacity`
  right: 15px;
  top: 38px;
  position: absolute;
  z-index: 1;
`;

export const StyledButton = styled.TouchableOpacity`
  padding: 15px;
  background-color: ${brand};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: 60px;

  ${(props) =>
    props.google &&
    `
      background-color: ${green};
      flex-direction: row;
    `}

  ${(props) =>
    props.face &&
    `
      background-color: ${brand};
      flex-direction: row;
    `}
`;

export const ButtonText = styled.Text`
  color: ${primary};
  font-size: 16px;

  ${(props) => props.google && `margin-left: 10px;`}
  ${(props) => props.face && `margin-left: 10px;`}
`;

export const MsgBox = styled.Text`
  text-align: center;
  font-size: 13px;
`;

export const Line = styled.View`
  height: 1px;
  width: 100%;
  background-color: ${darklight};
  margin-vertical: 10px;
`;

export const ExtraView = styled.View`
  justify-content: center;
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;

export const ExtraText = styled.Text`
  color: ${tertiary};
  font-size: 15px;
`;

export const TextLink = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

export const TextLinkContent = styled.Text`
  color: ${brand};
  font-size: 15px;
`;


//Notification
export const ContentWrapper = styled.View`
  flex: 1;
  padding: 0 25px;
  padding-top: ${StatusBarHeight + 10}px;
`;

export const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${secondary};
  border-radius: 10px;
  padding: 10px 15px;
  margin-top: 20px;
  width: 100%;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 14px;
  color: ${tertiary};
  padding-left: 5px;
`;

export const NotificationHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
`;

export const NotificationTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${brand};
`;

export const NotificationCard = styled.TouchableOpacity`
  background-color: ${secondary};
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  width: 100%;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;
`;

export const SenderText = styled.Text`
  font-weight: bold;
  color: ${tertiary};
`;

export const DateText = styled.Text`
  font-size: 12px;
  color: ${darklight};
`;

export const SubjectText = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${tertiary};
  margin-bottom: 3px;
`;

export const PreviewText = styled.Text`
  font-size: 13px;
  color: ${darklight};
`;

export const ComposeBox = styled.TouchableOpacity`
  position: absolute;
  bottom: 50px;
  right: 25px;
  background-color: ${brand};
  flex-direction: row;
  align-items: center;
  padding: 10px 15px;
  border-radius: 30px;
  elevation: 3;
`;

export const ComposeText = styled.Text`
  color: ${primary};
  font-size: 14px;
  margin-left: 8px;
`;

export const SectionDivider = styled.View`
  height: 1px;
  background-color: ${darklight};
  margin: 15px 25px;
  opacity: 0.4;
`;


// Profile
export const ProfileContainer = styled.View`
  flex: 1;
  padding: 25px;
  background-color: ${primary};
`;

export const ProfileTitle = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${brand};
  margin-bottom: 5px;
`;

export const ProfileSubTitle = styled.Text`
  font-size: 14px;
  color: ${darklight};
  margin-top: 5px;
`;

export const InfoScroll = styled.ScrollView`
  width: 100%;
  margin-bottom: 20px;
`;

export const InfoRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 15px;
`;

export const InfoIcon = styled.View`
  margin-right: 10px;
  margin-top: 3px;
`;

export const InfoLabel = styled.Text`
  font-weight: bold;
  font-size: 15px;
  color: ${tertiary};
`;

export const InfoValue = styled.Text`
  font-size: 14px;
  color: ${darklight};
`;

export const InfoBlock = styled.View`
  flex: 1;
`;

export const InfoCard = styled.View`
  background-color: ${secondary};
  padding: 15px;
  border-radius: 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  width: 100%;
`;

export const InfoValueSmall = styled.Text`
  font-size: 14px;
  color: ${darklight};
`;

export const TopBackButton = styled.TouchableOpacity`
  position: absolute;
  top: ${StatusBarHeight + 10}px;
  left: 25px;
  z-index: 10;
`;

export const TopRightButton = styled.TouchableOpacity`
  position: absolute;
  top: ${StatusBarHeight + 10}px;
  right: 25px;
  z-index: 10;
`;
