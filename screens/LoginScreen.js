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
  StatusBar,
} from 'react-native';
import tw from 'twrnc';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would connect to your backend API
      // For now, we'll just simulate a login
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to main app after successful login
        // navigation.navigate('Home');
        alert('Login successful!');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={tw`flex-1 bg-[#f8f9fa]`}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="dark-content" />
        
        <View style={tw`items-center mt-15`}>
          <Image
            source={require('../assets/icon.png')}
            style={tw`w-20 h-20`}
            resizeMode="contain"
          />
          <Text style={tw`text-2xl font-bold text-[#3a86ff] mt-2.5`}>SmartFit</Text>
        </View>
        
        <View style={tw`flex-1 px-6 mt-8`}>
          <Text style={tw`text-3xl font-bold text-[#212529]`}>Welcome Back</Text>
          <Text style={tw`text-base text-[#6c757d] mt-1 mb-8`}>Sign in to continue</Text>
          
          <View style={tw`mb-5`}>
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
          
          <View style={tw`mb-5`}>
            <Text style={tw`text-sm text-[#495057] mb-2`}>Password</Text>
            <TextInput
              style={tw`bg-[#ffffff] border border-[#ced4da] rounded-lg p-4 text-base`}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={tw`self-end mb-8`}>
            <Text style={tw`text-[#3a86ff] text-sm`}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={tw`${isLoading ? 'bg-[#a8c6ff]' : 'bg-[#3a86ff]'} rounded-lg p-4 items-center mb-5`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={tw`text-[#ffffff] text-base font-bold`}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={tw`flex-row justify-center mb-8`}>
          <Text style={tw`text-[#6c757d] text-sm`}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={tw`text-[#3a86ff] text-sm font-bold`}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

// No styles needed as we're using Tailwind CSS

export default LoginScreen;
