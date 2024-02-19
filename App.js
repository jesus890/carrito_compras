import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainStack from "./navigation/MainStack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {

  //añadimos la cuenta de administrador por defecto
  useEffect(() => {
    addAdministrator();
  },[])


  const addAdministrator = async () => {
    
    //obtiene el listado de usuarios
    let listUsers = await AsyncStorage.getItem('@users') || []

    if (listUsers.length === 0) //no hay ningun registro, añade la cuenta del administrador
    {
      //añade el registro a un arreglo
      listUsers.push({
        name: "Jesus Gomez",
        email: "imperiojesus89@gmail.com",
        password: "jesus1qa",
        role: "admin"
      })

      //guarda ese elemento en el local storage
      await AsyncStorage.setItem('@users', JSON.stringify(listUsers))
    }
  }


  return (
      
    <PaperProvider>
      <SafeAreaView style={{flex: 1}}> 
        <MainStack />
      </SafeAreaView>
    </PaperProvider>
    
  );


}

