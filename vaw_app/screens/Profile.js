// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// // Styled components
// import {
//   StyledContainer,
//   InnerContainer,
//   PageTitle,
//   SubTitle,
//   Line,
//   StyledButton,
//   ButtonText,
//   ProfileHeader,
//   ProfileSubTitle,
//   InfoScroll,
//   InfoRow,
//   InfoIcon,
//   InfoLabel,
//   InfoValue,
//   InfoBlock,
// } from './../components/styles';

// const Profile = () => {
//   const navigation = useNavigation();
//   const [victim, setVictim] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('http://192.168.1.5:8000/api/victim/profile/')
//       .then((res) => res.json())
//       .then((data) => {
//         setVictim(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         Alert.alert('Error', 'Failed to load profile');
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <StyledContainer>
//         <ActivityIndicator size="large" color="#ebb26cff" />
//       </StyledContainer>
//     );
//   }

//   return (
//     <StyledContainer>
//       <InnerContainer>
//         <ProfileHeader>
//           <PageTitle>Victim Profile</PageTitle>
//           <ProfileSubTitle>{victim.vic_fname} {victim.vic_lname}</ProfileSubTitle>
//         </ProfileHeader>

//         <Line />

//         <InfoScroll>
//           <InfoRow>
//             <InfoIcon>
//               <Ionicons name="mail" size={24} color="#ebb26cff" />
//             </InfoIcon>
//             <InfoBlock>
//               <InfoLabel>Email</InfoLabel>
//               <InfoValue>{victim.vic_email}</InfoValue>
//             </InfoBlock>
//           </InfoRow>

//           <InfoRow>
//             <InfoIcon>
//               <Ionicons name="calendar" size={24} color="#ebb26cff" />
//             </InfoIcon>
//             <InfoBlock>
//               <InfoLabel>Birth Date</InfoLabel>
//               <InfoValue>{victim.vic_birth_date}</InfoValue>
//             </InfoBlock>
//           </InfoRow>

//           <InfoRow>
//             <InfoIcon>
//               <Ionicons name="location" size={24} color="#ebb26cff" />
//             </InfoIcon>
//             <InfoBlock>
//               <InfoLabel>Birth Place</InfoLabel>
//               <InfoValue>{victim.vic_birth_place || 'Not specified'}</InfoValue>
//             </InfoBlock>
//           </InfoRow>

//           <InfoRow>
//             <InfoIcon>
//               <Ionicons name="male-female" size={24} color="#ebb26cff" />
//             </InfoIcon>
//             <InfoBlock>
//               <InfoLabel>Sex</InfoLabel>
//               <InfoValue>{victim.vic_sex || 'Not specified'}</InfoValue>
//             </InfoBlock>
//           </InfoRow>

//           <InfoRow>
//             <InfoIcon>
//               <Ionicons name="rainbow" size={24} color="#ebb26cff" />
//             </InfoIcon>
//             <InfoBlock>
//               <InfoLabel>SOGIE</InfoLabel>
//               <InfoValue>{victim.vic_is_SOGIE ? 'Yes' : 'No'}</InfoValue>
//             </InfoBlock>
//           </InfoRow>

//           {victim.vic_is_SOGIE && (
//             <InfoRow>
//               <InfoIcon>
//                 <Ionicons name="information-circle" size={24} color="#ebb26cff" />
//               </InfoIcon>
//               <InfoBlock>
//                 <InfoLabel>Specific SOGIE</InfoLabel>
//                 <InfoValue>{victim.vic_specific_sogie || 'Not specified'}</InfoValue>
//               </InfoBlock>
//             </InfoRow>
//           )}
//         </InfoScroll>

//         <StyledButton onPress={() => navigation.navigate('Welcome')}>
//           <ButtonText>Back to Welcome</ButtonText>
//         </StyledButton>
//       </InnerContainer>
//     </StyledContainer>
//   );
// };

// export default Profile;


import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Styled components
import {
    StyledContainer,
    InnerContainer,
    PageTitle,
    Line,
    InfoScroll,
    InfoRow,
    InfoIcon,
    InfoLabel,
    InfoValue,
    InfoBlock,
    InfoCard,
    InfoValueSmall,
    ProfileSubTitle,
    Avatar,
    TopBackButton,
    TopRightButton,
} from './../components/styles';

const mockVictim = {
    vic_fname: 'Xyron',
    vic_lname: 'Relon',
    vic_email: 'relonxyronnewell@gmail.com',
    vic_birth_date: '2000-01-01',
    vic_birth_place: 'Naga City, Philippines',
    vic_sex: 'Male',
    vic_is_SOGIE: true,
    vic_specific_sogie: 'Gay',
};

const Profile = () => {
    const navigation = useNavigation();

    return (
        <StyledContainer>

            {/* Log Out Button */}
            <TopRightButton onPress={() => {
                navigation.navigate('Login');
            }}>
                <Ionicons name="log-out-outline" size={28} color="#ebb26cff" />
            </TopRightButton>

            {/* Top Back Arrow */}
            <TopBackButton onPress={() => navigation.navigate('Notification')}>
                <Ionicons name="arrow-back" size={28} color="#ebb26cff" />
            </TopBackButton>

            <InnerContainer>
                {/* Avatar + Name */}
                <Avatar source={require('./../assets/img/logo1.png')} resizeMode="cover" />
                <PageTitle>{mockVictim.vic_fname} {mockVictim.vic_lname}</PageTitle>
                <ProfileSubTitle>Registered Victim</ProfileSubTitle>

                <Line />

                {/* Info Section */}
                <InfoScroll>

                    {/* Email */}
                    <InfoRow>
                        <InfoIcon>
                            <Ionicons name="mail" size={24} color="#ebb26cff" />
                        </InfoIcon>
                        <InfoBlock>
                            <InfoLabel>Email</InfoLabel>
                            <InfoCard>
                                <InfoValueSmall>{mockVictim.vic_email}</InfoValueSmall>
                            </InfoCard>
                        </InfoBlock>
                    </InfoRow>

                    {/* Birth Date */}
                    <InfoRow>
                        <InfoIcon>
                            <Ionicons name="calendar" size={24} color="#ebb26cff" />
                        </InfoIcon>
                        <InfoBlock>
                            <InfoLabel>Birth Date</InfoLabel>
                            <InfoCard>
                                <InfoValueSmall>{mockVictim.vic_birth_date}</InfoValueSmall>
                            </InfoCard>
                        </InfoBlock>
                    </InfoRow>

                    {/* Birth Place */}
                    <InfoRow>
                        <InfoIcon>
                            <Ionicons name="location" size={24} color="#ebb26cff" />
                        </InfoIcon>
                        <InfoBlock>
                            <InfoLabel>Birth Place</InfoLabel>
                            <InfoCard>
                                <InfoValueSmall>{mockVictim.vic_birth_place}</InfoValueSmall>
                            </InfoCard>
                        </InfoBlock>
                    </InfoRow>

                    {/* Sex */}
                    <InfoRow>
                        <InfoIcon>
                            <Ionicons name="male-female" size={24} color="#ebb26cff" />
                        </InfoIcon>
                        <InfoBlock>
                            <InfoLabel>Sex</InfoLabel>
                            <InfoCard>
                                <InfoValueSmall>{mockVictim.vic_sex}</InfoValueSmall>
                            </InfoCard>
                        </InfoBlock>
                    </InfoRow>

                    {/* SOGIE */}
                    <InfoRow>
                        <InfoIcon>
                            <Ionicons name="accessibility" size={24} color="#ebb26cff" />
                        </InfoIcon>
                        <InfoBlock>
                            <InfoLabel>SOGIE</InfoLabel>
                            <InfoCard>
                                <InfoValueSmall>{mockVictim.vic_is_SOGIE ? 'Yes' : 'No'}</InfoValueSmall>
                            </InfoCard>
                        </InfoBlock>
                    </InfoRow>

                    {mockVictim.vic_is_SOGIE && (
                        <InfoRow>
                            <InfoIcon>
                                <Ionicons name="information-circle" size={24} color="#ebb26cff" />
                            </InfoIcon>
                            <InfoBlock>
                                <InfoLabel>Specific SOGIE</InfoLabel>
                                <InfoCard>
                                    <InfoValueSmall>{mockVictim.vic_specific_sogie}</InfoValueSmall>
                                </InfoCard>
                            </InfoBlock>
                        </InfoRow>
                    )}
                </InfoScroll>
            </InnerContainer>
        </StyledContainer>
    );
};

export default Profile;
