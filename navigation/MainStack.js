import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import Product from "../screens/Product";
import ListProducts from "../screens/ListProducts";
import ClientPage from "../screens/ClientPage";
import ProductInfo from "../screens/ProductInfo";
import ShoppingCart from "../screens/ShoppingCart";

const Stack = createNativeStackNavigator();

function MainStack() {

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >

        <Stack.Screen 
          name='Login'
          component={Login} 
        />

        <Stack.Screen
          name='SignUp'
          component={SignUp}
        />

        <Stack.Screen
          name='Product'
          component={Product}
        />

        <Stack.Screen
          name='ListProducts'
          component={ListProducts}
          initialParams={{ informationUpdate: false }}
        />

        <Stack.Screen
          name='ClientPage'
          component={ClientPage}
          initialParams={{ informationUpdate: false, cartEmpty: false }}
        />

        <Stack.Screen
          name='ProductInfo'
          component={ProductInfo}
        />

        <Stack.Screen
          name='ShoppingCart'
          component={ShoppingCart}
        />   
    
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainStack;
