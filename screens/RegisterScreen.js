import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar,
} from 'react-native';
import tw from 'twrnc';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would connect to your backend API
      // For now, we'll just simulate a registration
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to login after successful registration
        alert('Registration successful! Please log in.');
        navigation.navigate('Login');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={tw`flex-1 bg-[#f8f9fa]`}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={tw`items-center mt-10`}>
            <Image
              source={require('../assets/icon.png')}
              style={tw`w-18 h-18`}
              resizeMode="contain"
            />
            <Text style={tw`text-2xl font-bold text-[#3a86ff] mt-2`}>SmartFit</Text>
          </View>
          
          <View style={tw`px-6 mt-5`}>
            <Text style={tw`text-3xl font-bold text-[#212529]`}>Create Account</Text>
            <Text style={tw`text-base text-[#6c757d] mt-1 mb-6`}>Sign up to get started</Text>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm text-[#495057] mb-2`}>Full Name</Text>
              <TextInput
                style={tw`bg-[#ffffff] border border-[#ced4da] rounded-lg p-4 text-base`}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm text-[#495057] mb-2`}>Email</Text>
              <TextInput
                style={tw`bg-[#ffffff] border border-[#ced4da] rounded-lg p-4 text-base`}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm text-[#495057] mb-2`}>Password</Text>
              <TextInput
                style={tw`bg-[#ffffff] border border-[#ced4da] rounded-lg p-4 text-base`}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <View style={tw`mb-6`}>
              <Text style={tw`text-sm text-[#495057] mb-2`}>Confirm Password</Text>
              <TextInput
                style={tw`bg-[#ffffff] border border-[#ced4da] rounded-lg p-4 text-base`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              style={tw`${isLoading ? 'bg-[#a8c6ff]' : 'bg-[#3a86ff]'} rounded-lg p-4 items-center mb-5`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={tw`text-[#ffffff] text-base font-bold`}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            
            <View style={tw`mb-5`}>
              <Text style={tw`text-xs text-[#6c757d] text-center leading-5`}>
                By signing up, you agree to our{' '}
                <Text style={tw`text-[#3a86ff] font-bold`}>Terms of Service</Text> and{' '}
                <Text style={tw`text-[#3a86ff] font-bold`}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
          
          <View style={tw`flex-row justify-center mb-8 mt-3`}>
            <Text style={tw`text-[#6c757d] text-sm`}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={tw`text-[#3a86ff] text-sm font-bold`}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

// No styles needed as we're using Tailwind CSS

export default RegisterScreen;
